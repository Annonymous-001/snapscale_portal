"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as z from "zod"

const taskSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"]).default("PENDING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  deadline: z.string().optional(),
  estimatedHours: z.string().optional(),
  actualHours: z.string().optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
})

export async function getTasks() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  const tasks = await prisma.task.findMany({
    include: {
      Project: {
        include: {
          User_Project_clientIdToUser: true,
        },
      },
      User: true, // assignee
    },
    orderBy: { createdAt: "desc" },
  })
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    deadline: task.deadline ? task.deadline.toISOString() : null,
    estimatedHours: task.estimatedHours,
    actualHours: task.actualHours,
    assignee: task.User ? { id: task.User.id, name: task.User.name, avatar: task.User.name?.split(" ").map(n => n[0]).join("") } : null,
    project: task.Project ? { id: task.Project.id, name: task.Project.name } : null,
    client: task.Project?.User_Project_clientIdToUser ? { id: task.Project.User_Project_clientIdToUser.id, name: task.Project.User_Project_clientIdToUser.name } : null,
  }))
}

export async function createTask(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) throw new Error("Unauthorized")
  const raw = Object.fromEntries(formData.entries())
  const data = taskSchema.parse(raw)
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : undefined,
      actualHours: data.actualHours ? parseInt(data.actualHours) : undefined,
      assigneeId: data.assigneeId || null,
      projectId: data.projectId,
      createdBy: session.user.id,
    },
  })
  revalidatePath("/dashboard/admin/tasks")
  return task
}

export async function updateTask(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) throw new Error("Unauthorized")
  const raw = Object.fromEntries(formData.entries())
  const data = taskSchema.parse(raw)
  const task = await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : undefined,
      actualHours: data.actualHours ? parseInt(data.actualHours) : undefined,
      assigneeId: data.assigneeId || null,
      projectId: data.projectId,
    },
  })
  revalidatePath("/dashboard/admin/tasks")
  return task
}

export async function deleteTask(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) throw new Error("Unauthorized")
  await prisma.task.delete({ where: { id } })
  revalidatePath("/dashboard/admin/tasks")
}
