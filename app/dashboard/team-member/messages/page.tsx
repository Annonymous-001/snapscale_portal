import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Reply } from "lucide-react"

export default async function TeamMemberMessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEAM_MEMBER") {
    redirect("/auth/signin")
  }

  // TODO: Replace with server action to fetch team member's messages
  const messages = [
    {
      id: "1",
      content: "Please prioritize the authentication task as the client wants to review it by Friday.",
      fromAdmin: true,
      fromName: "Project Manager",
      read: false,
      priority: "HIGH",
      createdAt: "2024-01-15T10:30:00Z",
      project: "Website Redesign",
    },
    {
      id: "2",
      content: "Great work on the UI components! The client is very happy with the progress.",
      fromAdmin: true,
      fromName: "Project Manager",
      read: true,
      priority: "NORMAL",
      createdAt: "2024-01-14T14:20:00Z",
      project: "Website Redesign",
    },
    {
      id: "3",
      content: "I've completed the wireframes and uploaded them to the project folder. Ready for review.",
      fromAdmin: false,
      fromName: "You",
      read: true,
      priority: "NORMAL",
      createdAt: "2024-01-13T09:15:00Z",
      project: "Mobile App Development",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Messages" breadcrumbs={[{ label: "Team Member", href: "/dashboard/team-member" }]} />

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Internal team communications</p>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id} className={!message.read ? "border-primary/50" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{message.fromName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{message.fromName}</p>
                    <p className="text-sm text-muted-foreground">{message.project}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!message.read && <Badge variant="default">New</Badge>}
                  <Badge variant={message.priority === "HIGH" ? "destructive" : "outline"}>{message.priority}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{message.content}</p>
              <Button variant="outline" size="sm">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
