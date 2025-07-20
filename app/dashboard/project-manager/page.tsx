import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, Users, CheckSquare, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default async function ProjectManagerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "PROJECT_MANAGER") {
    redirect("/auth/signin")
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Dashboard" breadcrumbs={[{ label: "Project Manager" }]} />

      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <StatsCard
          title="Active Projects"
          value={8}
          description="Projects in progress"
          icon={FolderOpen}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard title="Team Members" value={12} description="Active team members" icon={Users} />
        <StatsCard title="Pending Tasks" value={24} description="Tasks awaiting assignment" icon={CheckSquare} />
        <StatsCard
          title="Revenue"
          value="$45,230"
          description="This month"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>Current project status and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Website Redesign</p>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">75% complete • Due in 2 weeks</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Mobile App Development</p>
                  <Badge variant="outline">Review</Badge>
                </div>
                <Progress value={90} className="h-2" />
                <p className="text-xs text-muted-foreground">90% complete • Due in 5 days</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">E-commerce Platform</p>
                  <Badge variant="destructive">Delayed</Badge>
                </div>
                <Progress value={45} className="h-2" />
                <p className="text-xs text-muted-foreground">45% complete • Overdue by 3 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Team member task completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">Frontend Developer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">95%</p>
                  <p className="text-xs text-muted-foreground">12/12 tasks</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Mike Chen</p>
                    <p className="text-xs text-muted-foreground">Backend Developer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">87%</p>
                  <p className="text-xs text-muted-foreground">8/9 tasks</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Alex Rivera</p>
                    <p className="text-xs text-muted-foreground">UI/UX Designer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">72%</p>
                  <p className="text-xs text-muted-foreground">5/7 tasks</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
