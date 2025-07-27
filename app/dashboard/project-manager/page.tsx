"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, Users, CheckSquare, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectManagerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/project-manager/dashboard")
      if (!res.ok) throw new Error("Failed to fetch dashboard data")
      const data = await res.json()
      setDashboardData(data)
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader title="Dashboard" breadcrumbs={[{ label: "Project Manager" }]} />

        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-20 rounded" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader title="Dashboard" breadcrumbs={[{ label: "Project Manager" }]} />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load dashboard data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { stats, projects, teamPerformance } = dashboardData

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Dashboard" breadcrumbs={[{ label: "Project Manager" }]} />

      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <StatsCard
          title="Active Projects"
          value={stats.activeProjects}
          description="Projects in progress"
          icon={FolderOpen}
          trend={{ value: stats.projectGrowth, isPositive: stats.projectGrowth > 0 }}
        />
        <StatsCard 
          title="Team Members" 
          value={stats.teamMembers} 
          description="Active team members" 
          icon={Users} 
        />
        <StatsCard 
          title="Pending Tasks" 
          value={stats.pendingTasks} 
          description="Tasks awaiting assignment" 
          icon={CheckSquare} 
        />
        <StatsCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          description="This month"
          icon={DollarSign}
          trend={{ value: stats.revenueGrowth, isPositive: stats.revenueGrowth > 0 }}
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
              {projects.length > 0 ? (
                projects.map((project: any) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{project.name}</p>
                      <Badge variant={
                        project.status === "IN_PROGRESS" ? "secondary" :
                        project.status === "REVIEW" ? "outline" :
                        project.status === "COMPLETED" ? "default" :
                        "destructive"
                      }>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {project.progress}% complete • {project.dueInfo}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No projects found
                </div>
              )}
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
              {teamPerformance.length > 0 ? (
                teamPerformance.map((member: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        member.completionRate >= 90 ? "bg-green-100" :
                        member.completionRate >= 75 ? "bg-blue-100" :
                        "bg-yellow-100"
                      }`}>
                        {member.completionRate >= 90 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : member.completionRate >= 75 ? (
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.completionRate}%</p>
                      <p className="text-xs text-muted-foreground">{member.completedTasks}/{member.totalTasks} tasks</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No team performance data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
