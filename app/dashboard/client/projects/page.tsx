import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Eye, FileText, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function ClientProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CLIENT") {
    redirect("/auth/signin")
  }

  // TODO: Replace with server action to fetch user's projects
  const projects = [
    {
      id: "1",
      name: "Website Redesign",
      description: "Complete redesign of company website with modern UI/UX",
      status: "IN_PROGRESS",
      priority: "HIGH",
      progress: 75,
      dueDate: "2024-02-15",
      budget: 15000,
    },
    {
      id: "2",
      name: "Mobile App Development",
      description: "Native mobile app for iOS and Android",
      status: "REVIEW",
      priority: "MEDIUM",
      progress: 90,
      dueDate: "2024-03-01",
      budget: 25000,
    },
    {
      id: "3",
      name: "Brand Identity",
      description: "Complete brand identity package including logo and guidelines",
      status: "COMPLETED",
      priority: "LOW",
      progress: 100,
      dueDate: "2024-01-30",
      budget: 8000,
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="My Projects" breadcrumbs={[{ label: "Client", href: "/dashboard/client" }]} />

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
                  <Badge variant={project.status === "COMPLETED" ? "default" : "secondary"}>
                    {project.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline">{project.priority}</Badge>
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
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  <span>Budget: ${project.budget.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/client/projects/${project.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/client/projects/${project.id}/files`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Files
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/client/messages?project=${project.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
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
