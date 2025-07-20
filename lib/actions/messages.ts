"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as z from "zod"

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  projectId: z.string().min(1, "Project is required"),
  userId: z.string().min(1, "Recipient is required"),
  priority: z.enum(["NORMAL", "HIGH"]).default("NORMAL"),
})

export async function getMessages() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  const messages = await prisma.message.findMany({
    include: {
      Project: true,
      User: true, // recipient
    },
    orderBy: { createdAt: "desc" },
  })
  return messages.map(message => ({
    id: message.id,
    content: message.content,
    fromAdmin: message.fromAdmin,
    fromName: message.fromAdmin ? "Admin" : (message.User ? message.User.name : "Unknown"),
    toName: message.User ? message.User.name : "Unknown",
    read: message.read,
    priority: message.priority,
    createdAt: message.createdAt,
    project: message.Project ? message.Project.name : "",
    projectId: message.projectId,
    userId: message.userId,
  }))
}

export async function createMessage(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")
  const raw = Object.fromEntries(formData.entries())
  const data = messageSchema.parse(raw)
  const message = await prisma.message.create({
    data: {
      content: data.content,
      projectId: data.projectId,
      userId: data.userId,
      priority: data.priority,
      fromAdmin: ["ADMIN", "PROJECT_MANAGER"].includes(session.user.role),
      read: false,
    },
  })
  revalidatePath("/dashboard/admin/messages")
  return message
}

export async function markMessageAsRead(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")
  const updatedMessage = await prisma.message.update({
    where: { id },
    data: { read: true },
  })
  revalidatePath("/dashboard/admin/messages")
  return updatedMessage
}

export async function deleteMessage(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) throw new Error("Unauthorized")
  await prisma.message.delete({ where: { id } })
  revalidatePath("/dashboard/admin/messages")
}
