"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { TeamRole } from "../generated/prisma"

const teamSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function getTeams() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  const teams = await prisma.team.findMany({
    include: {
      TeamMember: {
        include: { User: true },
      },
      Project: true,
    },
    orderBy: { createdAt: "desc" },
  })
  // Map to shape for frontend
  return teams.map(team => ({
    id: team.id,
    name: team.name,
    description: team.description,
    isActive: team.isActive,
    memberCount: team.TeamMember.length,
    activeProjects: team.Project.filter(p => p.status !== "COMPLETED" && p.status !== "ARCHIVED" && p.status !== "CANCELLED").length,
    lead: team.TeamMember.find(m => m.role === "LEAD") ? {
      name: team.TeamMember.find(m => m.role === "LEAD")?.User?.name || "",
      avatar: team.TeamMember.find(m => m.role === "LEAD")?.User?.avatar || null
    } : null,
    members: team.TeamMember.map(m => ({
      name: m.User?.name || "",
      avatar: m.User?.avatar || null
    })),
  }))
}

export async function createTeam(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    isActive: formData.get("isActive") === "true",
    members: formData.getAll("members"), // array of user IDs
    lead: formData.get("lead") as string,
  }
  const data = teamSchema.parse(raw)
  const memberIds = Array.isArray(raw.members) ? raw.members.map(v => String(v)) : [String(raw.members)].filter(Boolean)
  const leadId = raw.lead ? String(raw.lead) : ""
  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      teamLeadId: leadId || null,
      TeamMember: {
        create: memberIds.map((userId: string) => ({
          userId,
          role: userId === leadId ? "LEAD" : "MEMBER",
          isActive: true,
        })),
      },
    },
    include: { TeamMember: true },
  })
  revalidatePath("/dashboard/admin/teams")
  return team
}

export async function updateTeam(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    isActive: formData.get("isActive") === "true",
    members: formData.getAll("members"),
    lead: formData.get("lead") as string,
  }
  const data = teamSchema.parse(raw)
  const memberIds = Array.isArray(raw.members) ? raw.members.map(v => String(v)) : [String(raw.members)].filter(Boolean)
  const leadId = raw.lead ? String(raw.lead) : ""
  // Fetch current members
  const currentMembers = await prisma.teamMember.findMany({ where: { teamId: id } })
  // Remove members not in new list
  const toRemove = currentMembers.filter(m => !memberIds.includes(m.userId)).map(m => m.id)
  // Upsert members (add new, update role for lead)
  await prisma.$transaction([
    prisma.team.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        teamLeadId: leadId || null,
      },
    }),
    ...toRemove.map(memberId => prisma.teamMember.delete({ where: { id: memberId } })),
    ...memberIds.map(userId =>
      prisma.teamMember.upsert({
        where: { userId_teamId: { userId, teamId: id } },
        update: { role: userId === leadId ? "LEAD" : "MEMBER", isActive: true },
        create: { userId, teamId: id, role: userId === leadId ? "LEAD" : "MEMBER", isActive: true },
      })
    ),
  ])
  revalidatePath("/dashboard/admin/teams")
  return prisma.team.findUnique({
    where: { id },
    include: { TeamMember: true },
  })
}

export async function deleteTeam(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  await prisma.team.delete({ where: { id } })
  revalidatePath("/dashboard/admin/teams")
}

const addMemberSchema = z.object({
  userId: z.string().min(1),
  teamId: z.string().min(1),
  role: z.enum(["MEMBER", "LEAD", "ADMIN"]).default("MEMBER"),
});

export async function addTeamMember(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  const raw = {
    userId: formData.get("userId") as string,
    teamId: formData.get("teamId") as string,
    role: (formData.get("role") as string) || "MEMBER",
  };
  const data = addMemberSchema.parse(raw);
  // If setting as LEAD, demote any existing LEAD to MEMBER
  if (data.role === "LEAD") {
    await prisma.teamMember.updateMany({
      where: { teamId: data.teamId, role: "LEAD" },
      data: { role: "MEMBER" as TeamRole },
    });
  }
  const member = await prisma.teamMember.create({
    data: {
      userId: data.userId,
      teamId: data.teamId,
      role: data.role as TeamRole,
      isActive: true,
    },
  });
  revalidatePath("/dashboard/admin/teams");
  return member;
}

export async function updateTeamMemberRole(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  const teamMemberId = formData.get("teamMemberId") as string;
  const role = (formData.get("role") as string) || "MEMBER";
  const teamId = formData.get("teamId") as string;
  // If setting as LEAD, demote any existing LEAD to MEMBER
  if (role === "LEAD") {
    await prisma.teamMember.updateMany({
      where: { teamId, role: "LEAD" },
      data: { role: "MEMBER" as TeamRole },
    });
  }
  const updated = await prisma.teamMember.update({
    where: { id: teamMemberId },
    data: { role: role as TeamRole },
  });
  revalidatePath("/dashboard/admin/teams");
  return updated;
}

export async function removeTeamMember(teamMemberId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  await prisma.teamMember.delete({ where: { id: teamMemberId } });
  revalidatePath("/dashboard/admin/teams");
}

export async function getTeamMemberOptions() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      OR: [
        { role: "TEAM_MEMBER" },
        { role: "PROJECT_MANAGER" },
      ],
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
  return users
} 