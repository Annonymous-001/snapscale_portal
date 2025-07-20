import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Users, DollarSign, FolderOpen, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  // Fetch real analytics data
  const [
    totalRevenue,
    activeProjects,
    projectStatusDistribution,
    monthlyRevenue,
    teamUtilization,
    avgProjectTime
  ] = await Promise.all([
    // Total revenue this year
    prisma.invoice.aggregate({
      where: { 
        paid: true,
        paidAt: {
          gte: new Date(new Date().getFullYear(), 0, 1) // Start of current year
        }
      },
      _sum: { amount: true }
    }),

    // Active projects count
    prisma.project.count({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS", "REVIEW"] }
      }
    }),

    // Project status distribution
    prisma.project.groupBy({
      by: ['status'],
      _count: { status: true }
    }),

    // Monthly revenue for current year
    prisma.$queryRaw<Array<{
      month: string
      amount: bigint
    }>>`
      SELECT 
        TO_CHAR("paidAt", 'Month') as month,
        SUM(amount) as amount
      FROM "Invoice" 
      WHERE "paid" = true 
        AND "paidAt" >= DATE_TRUNC('year', CURRENT_DATE)
      GROUP BY TO_CHAR("paidAt", 'Month')
      ORDER BY MIN("paidAt")
    `,

    // Team utilization (active team members / total team members)
    prisma.$queryRaw<Array<{
      utilization: number
    }>>`
      SELECT 
        ROUND(
          (COUNT(CASE WHEN tm."isActive" = true THEN 1 END) * 100.0 / COUNT(*))
        ) as utilization
      FROM "TeamMember" tm
    `,

    // Average project completion time
    prisma.$queryRaw<Array<{
      avg_days: number
    }>>`
      SELECT 
        ROUND(AVG(
          EXTRACT(DAY FROM ("updatedAt" - "startDate"))
        )) as avg_days
      FROM "Project" 
      WHERE "status" = 'COMPLETED' 
        AND "startDate" IS NOT NULL
    `
  ])

  const revenue = totalRevenue._sum.amount || 0
  const utilization = teamUtilization[0]?.utilization || 0
  const avgDays = avgProjectTime[0]?.avg_days || 0

  // Calculate project status percentages
  const totalProjects = projectStatusDistribution.reduce((sum, item) => sum + item._count.status, 0)
  const statusData = projectStatusDistribution.map(item => ({
    status: item.status,
    count: item._count.status,
    percentage: totalProjects > 0 ? Math.round((item._count.status / totalProjects) * 100) : 0,
    color: item.status === 'IN_PROGRESS' ? 'bg-blue-500' :
           item.status === 'PENDING' ? 'bg-yellow-500' :
           item.status === 'REVIEW' ? 'bg-purple-500' :
           'bg-green-500'
  }))

  // Process monthly revenue data
  const maxRevenue = Math.max(...monthlyRevenue.map(m => Number(m.amount)), 1)
  const monthlyData = monthlyRevenue.map((month, index) => {
    const prevAmount = index > 0 ? Number(monthlyRevenue[index - 1].amount) : 0
    const currentAmount = Number(month.amount)
    const growth = prevAmount > 0 ? Math.round(((currentAmount - prevAmount) / prevAmount) * 100) : 0
    
    return {
      month: month.month.trim(),
      amount: currentAmount,
      growth,
      percentage: (currentAmount / maxRevenue) * 100
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Analytics" breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }]} />

      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${revenue.toLocaleString()}`}
          description="This year"
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          description="Currently running"
          icon={FolderOpen}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Team Utilization"
          value={`${utilization}%`}
          description="Average across teams"
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Avg. Project Time"
          value={`${avgDays} days`}
          description="From start to completion"
          icon={Clock}
          trend={{ value: -3, isPositive: false }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
            <CardDescription>Monthly revenue breakdown for this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.length > 0 ? (
                monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-sm font-medium">{data.month}</div>
                      <div className="flex-1">
                        <Progress value={data.percentage} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">${data.amount.toLocaleString()}</span>
                      <div className={`flex items-center ${data.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                        {data.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span className="text-xs">{Math.abs(data.growth)}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No revenue data available for this year
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current status of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusData.length > 0 ? (
                statusData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${data.color}`} />
                        <span className="capitalize">{data.status.replace('_', ' ')}</span>
                      </div>
                      <span className="font-medium">{data.count} projects</span>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No projects found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
