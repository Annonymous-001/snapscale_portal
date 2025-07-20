import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Eye, Edit, Users, CheckSquare } from "lucide-react"
import Link from "next/link"

export default async function ProjectManagerProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "PROJECT_MANAGER") {
    redirect("/auth/signin")
  }

  // TODO: Replace with server action to fetch managed projects
  const projects = [
    {
      id: "1",
      name: "Website Redesign",
      description: "Complete redesign of company website with modern UI/UX",
      status: "IN_PROGRESS",
      priority: "HIGH",
      progress: 75,
      budget: 15000,
      spent: 11250,
      client: "Acme Corp",
      teamMembers: 3,
      tasks: 8,
      dueDate: "2024-02-15",
    },
    {
      id: "2",
      name: "Mobile App Development",
      description: "Native mobile app for iOS and Android",
      status: "REVIEW",
      priority: "MEDIUM",
      progress: 90,
      budget: 25000,
      spent: 22500,
      client: "Tech Startup",
      teamMembers: 4,
      tasks: 12,
      dueDate: "2024-03-01",
    },
    {
      id: "3",
      name: "E-commerce Platform",
      description: "Full-featured e-commerce platform with payment integration",
      status: "PENDING",
      priority: "MEDIUM",
      progress: 0,
      budget: 35000,
      spent: 0,
      client: "Retail Company",
      teamMembers: 2,
      tasks: 0,
      dueDate: "2024-04-01",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader
        title="Projects"
        breadcrumbs={[{ label: "Project Manager", href: "/dashboard/project-manager" }]}
      />

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage all your projects and track progress</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      project.status === "COMPLETED"
                        ? "default"
                        : project.status === "IN_PROGRESS"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                  <Badge
                    variant={
                      project.priority === "HIGH"
                        ? "destructive"
                        : project.priority === "MEDIUM"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {project.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Client</p>
                    <p className="font-medium">{project.client}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium">
                      ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Team & Tasks</p>
                    <p className="font-medium">
                      {project.teamMembers} members • {project.tasks} tasks
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/project-manager/projects/${project.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/project-manager/projects/${project.id}/team`}>
                      <Users className="h-4 w-4 mr-2" />
                      Team
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/project-manager/tasks?project=${project.id}`}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Tasks
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
