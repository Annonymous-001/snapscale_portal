import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Mail, UserCheck } from "lucide-react"

export default async function ProjectManagerTeamPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "PROJECT_MANAGER") {
    redirect("/auth/signin")
  }

  // TODO: Replace with server action to fetch team members
  const teamMembers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@agency.com",
      role: "TEAM_MEMBER",
      avatar: "JD",
      activeTasks: 3,
      completedTasks: 12,
      currentProjects: ["Website Redesign", "Mobile App"],
      lastActive: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@agency.com",
      role: "TEAM_MEMBER",
      avatar: "SJ",
      activeTasks: 2,
      completedTasks: 18,
      currentProjects: ["E-commerce Platform"],
      lastActive: "2024-01-15T09:15:00Z",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@agency.com",
      role: "TEAM_MEMBER",
      avatar: "MC",
      activeTasks: 1,
      completedTasks: 8,
      currentProjects: ["Website Redesign"],
      lastActive: "2024-01-14T16:45:00Z",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Team" breadcrumbs={[{ label: "Project Manager", href: "/dashboard/project-manager" }]} />

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage your team members and their assignments</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{member.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.email}</CardDescription>
                </div>
                <Badge variant="outline">{member.role.replace("_", " ")}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Active Tasks</p>
                    <p className="font-medium text-lg">{member.activeTasks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="font-medium text-lg">{member.completedTasks}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm mb-2">Current Projects</p>
                  <div className="flex flex-wrap gap-1">
                    {member.currentProjects.map((project, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Last active: {new Date(member.lastActive).toLocaleString()}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assign Task
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
