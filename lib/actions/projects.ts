"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { projectSchema } from "@/lib/validations/project"


export async function getProjects() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  // Admin: all
  if (session.user.role === "ADMIN") {
    const projects = await prisma.project.findMany({
      include: {
        User_Project_clientIdToUser: true,
        User_Project_managerIdToUser: true,
        Team: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return projects.map(project => ({
      ...project,
      budget: project.budget ? Number(project.budget) : null,
    }));
  }

  // Client: owned
  if (session.user.role === "CLIENT") {
    const projects = await prisma.project.findMany({
      where: { clientId: session.user.id },
      include: { User_Project_managerIdToUser: true, Team: true },
      orderBy: { createdAt: "desc" },
    });
    return projects.map(project => ({
      ...project,
      budget: project.budget ? Number(project.budget) : null,
    }));
  }

  // Project Manager: managed
  if (session.user.role === "PROJECT_MANAGER") {
    const projects = await prisma.project.findMany({
      where: { managerId: session.user.id },
      include: { User_Project_clientIdToUser: true, Team: true },
      orderBy: { createdAt: "desc" },
    });
    return projects.map(project => ({
      ...project,
      budget: project.budget ? Number(project.budget) : null,
    }));
  }
}

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }
  const raw = Object.fromEntries(formData.entries())
  const data = projectSchema.parse(raw)
  const project = await prisma.project.create({
    data: {
      ...data,
      budget: Number(data.budget),
      dueDate: new Date(data.dueDate),
      managerId: data.managerId,
      clientId: data.clientId,
      teamId: data.teamId || null,
    },
  })
  revalidatePath("/dashboard/admin/projects")
  return project
}

export async function updateProject(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }
  const raw = Object.fromEntries(formData.entries())
  const data = projectSchema.parse(raw)
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...data,
      budget: Number(data.budget),
      dueDate: new Date(data.dueDate),
      managerId: data.managerId,
      clientId: data.clientId,
      teamId: data.teamId || null,
    },
  })
  revalidatePath("/dashboard/admin/projects")
  return project
}

export async function deleteProject(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }
  await prisma.project.delete({ where: { id } })
  revalidatePath("/dashboard/admin/projects")
}

export async function getProjectFormOptions() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const [clients, managers, teams] = await Promise.all([
    prisma.user.findMany({ where: { role: "CLIENT", isActive: true }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "PROJECT_MANAGER", isActive: true }, select: { id: true, name: true } }),
    prisma.team.findMany({ select: { id: true, name: true } })
  ])
  return { clients, managers, teams }
}
