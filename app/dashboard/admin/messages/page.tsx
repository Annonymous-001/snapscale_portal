"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Reply, Plus, Trash2, Check } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  projectId: z.string().min(1, "Project is required"),
  userId: z.string().min(1, "Recipient is required"),
  priority: z.enum(["NORMAL", "HIGH"]).default("NORMAL"),
})

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState({ content: "", projectId: "", userId: "", priority: "NORMAL" })
  const [formErrors, setFormErrors] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/messages")
      if (!res.ok) throw new Error("Failed to fetch messages")
      const data = await res.json()
      setMessages(data ?? [])
    } catch {
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCreateMessage = async (e: any) => {
    e.preventDefault()
    setFormErrors({})
    try {
      const parsed = messageSchema.parse(formData)
      setSubmitting(true)
      const fd = new FormData()
      Object.entries(parsed).forEach(([k, v]) => fd.append(k, v))
      const res = await fetch("/api/messages", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Failed to create message")
      setFormOpen(false)
      setFormData({ content: "", projectId: "", userId: "", priority: "NORMAL" })
      await loadMessages()
      toast.success("Message sent")
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setFormErrors(err.flatten().fieldErrors)
      } else {
        toast.error(err.message || "Failed to create message")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: "PUT" })
      if (!res.ok) throw new Error("Failed to mark as read")
      await loadMessages()
      toast.success("Marked as read")
    } catch {
      toast.error("Failed to mark as read")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete message")
      await loadMessages()
      toast.success("Message deleted")
    } catch {
      toast.error("Failed to delete message")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Messages" breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }]} />

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Monitor all system communications</p>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleCreateMessage} className="bg-white border rounded-lg p-4 mb-4 flex flex-col gap-3 max-w-lg">
          <textarea
            name="content"
            value={formData.content}
            onChange={handleFormChange}
            placeholder="Message content"
            className="border rounded p-2"
            rows={3}
          />
          {formErrors.content && <span className="text-red-500 text-xs">{formErrors.content}</span>}
          <input
            name="projectId"
            value={formData.projectId}
            onChange={handleFormChange}
            placeholder="Project ID"
            className="border rounded p-2"
          />
          {formErrors.projectId && <span className="text-red-500 text-xs">{formErrors.projectId}</span>}
          <input
            name="userId"
            value={formData.userId}
            onChange={handleFormChange}
            placeholder="Recipient User ID"
            className="border rounded p-2"
          />
          {formErrors.userId && <span className="text-red-500 text-xs">{formErrors.userId}</span>}
          <select name="priority" value={formData.priority} onChange={handleFormChange} className="border rounded p-2">
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
          </select>
          <div className="flex gap-2 mt-2">
            <Button type="submit" disabled={submitting}>
              Send
            </Button>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground">No messages found</div>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className={!message.read ? "border-primary/50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{message.fromName?.charAt(0) || "?"}</AvatarFallback>
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
                  {!message.read && (
                    <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(message.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(message.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
