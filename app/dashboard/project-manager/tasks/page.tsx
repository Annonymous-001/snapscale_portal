import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Edit, UserPlus } from "lucide-react"

export default async function ProjectManagerTasksPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "PROJECT_MANAGER") {
    redirect("/auth/signin")
  }

  // TODO: Replace with server action to fetch all tasks
  const tasks = [
    {
      id: "1",
      title: "Implement user authentication",
      description: "Set up NextAuth.js with database integration",
      status: "IN_PROGRESS",
      priority: "HIGH",
      deadline: "2024-01-20",
      estimatedHours: 16,
      actualHours: 12,
      assignee: { name: "John Doe", avatar: "JD" },
      project: "Website Redesign",
    },
    {
      id: "2",
      title: "Design mobile wireframes",
      description: "Create wireframes for all mobile app screens",
      status: "PENDING",
      priority: "MEDIUM",
      deadline: "2024-01-25",
      estimatedHours: 24,
      actualHours: 0,
      assignee: null,
      project: "Mobile App Development",
    },
    {
      id: "3",
      title: "Database schema design",
      description: "Design and implement the database schema",
      status: "COMPLETED",
      priority: "HIGH",
      deadline: "2024-01-15",
      estimatedHours: 20,
      actualHours: 18,
      assignee: { name: "Sarah Johnson", avatar: "SJ" },
      project: "E-commerce Platform",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Tasks" breadcrumbs={[{ label: "Project Manager", href: "/dashboard/project-manager" }]} />

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage and assign tasks across all projects</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription>{task.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      task.status === "COMPLETED" ? "default" : task.status === "IN_PROGRESS" ? "secondary" : "outline"
                    }
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                  <Badge
                    variant={
                      task.priority === "HIGH" ? "destructive" : task.priority === "MEDIUM" ? "secondary" : "outline"
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Project</p>
                    <p className="font-medium">{task.project}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deadline</p>
                    <p className="font-medium">{new Date(task.deadline).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hours</p>
                    <p className="font-medium">
                      {task.actualHours}/{task.estimatedHours}h
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assignee</p>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{task.assignee.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {!task.assignee && (
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
