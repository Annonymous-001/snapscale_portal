"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// TODO: Implement message CRUD operations

export async function createMessage(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Unauthorized")
  }

  // TODO: Validate form data and create message
  // const content = formData.get("content") as string
  // const projectId = formData.get("projectId") as string
  // const priority = (formData.get("priority") as MessagePriority) || "NORMAL"
  // const userId = formData.get("userId") as string // recipient

  // const message = await prisma.message.create({
  //   data: {
  //     content,
  //     projectId,
  //     userId,
  //     priority,
  //     fromAdmin: ["ADMIN", "PROJECT_MANAGER"].includes(session.user.role),
  //   },
  // })

  // revalidatePath("/dashboard/client/messages")
  // revalidatePath("/dashboard/project-manager/messages")
  // return message
}

export async function markMessageAsRead(id: string) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Unauthorized")
  }

  // TODO: Mark message as read
  // const updatedMessage = await prisma.message.update({
  //   where: { id },
  //   data: { read: true },
  // })

  // revalidatePath("/dashboard/client/messages")
  // return updatedMessage
}

export async function deleteMessage(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  // TODO: Delete message
  // await prisma.message.delete({
  //   where: { id },
  // })

  // revalidatePath("/dashboard/admin/messages")
}
