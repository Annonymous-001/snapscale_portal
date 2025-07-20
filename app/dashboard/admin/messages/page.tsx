import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Reply, Plus } from "lucide-react"

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  // TODO: Replace with server action to fetch all messages
  const messages = [
    {
      id: "1",
      content:
        "Thank you for the project update. The progress looks great! I have a few questions about the user interface design.",
      fromAdmin: false,
      fromName: "John Smith (Client)",
      toName: "Mike Chen (Manager)",
      read: true,
      priority: "NORMAL",
      createdAt: "2024-01-15T10:30:00Z",
      project: "Website Redesign",
    },
    {
      id: "2",
      content: "I've completed the wireframes and uploaded them to the project folder. Ready for review.",
      fromAdmin: false,
      fromName: "Sarah Johnson (Team)",
      toName: "Mike Chen (Manager)",
      read: false,
      priority: "NORMAL",
      createdAt: "2024-01-14T14:20:00Z",
      project: "Mobile App Development",
    },
    {
      id: "3",
      content: "The authentication system is now complete. Moving on to the dashboard implementation.",
      fromAdmin: false,
      fromName: "Mike Chen (Manager)",
      toName: "John Smith (Client)",
      read: true,
      priority: "HIGH",
      createdAt: "2024-01-13T09:15:00Z",
      project: "Website Redesign",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Messages" breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }]} />

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Monitor all system communications</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
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
                    <p className="font-medium">
                      {message.fromName} → {message.toName}
                    </p>
                    <p className="text-sm text-muted-foreground">{message.project}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!message.read && <Badge variant="default">Unread</Badge>}
                  <Badge variant={message.priority === "HIGH" ? "destructive" : "outline"}>{message.priority}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{message.content}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline" size="sm">
                  Mark as Read
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
