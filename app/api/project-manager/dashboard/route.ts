import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "PROJECT_MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get projects managed by this project manager
    const managedProjects = await prisma.project.findMany({
      where: {
        managerId: userId,
        status: { in: ["PENDING", "IN_PROGRESS", "REVIEW"] }
      },
      include: {
        Task: true,
        User_Project_clientIdToUser: true
      },
      orderBy: { dueDate: 'asc' }
    })

    // Get team members working on these projects
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        Team: {
          Project: {
            some: {
              managerId: userId
            }
          }
        },
        isActive: true
      },
      include: {
        User: true,
        Team: {
          include: {
            Project: {
              where: {
                managerId: userId
              }
            }
          }
        }
      }
    })

    // Get tasks for managed projects
    const tasks = await prisma.task.findMany({
      where: {
        Project: {
          managerId: userId
        }
      },
      include: {
        User: true,
        Project: true
      }
    })

    // Calculate stats
    const activeProjects = managedProjects.length
    const pendingTasks = tasks.filter(task => task.status === "PENDING").length
    const teamMembersCount = new Set(teamMembers.map(m => m.userId)).size

    // Calculate revenue from completed invoices for managed projects
    const revenue = await prisma.invoice.aggregate({
      where: {
        Project: {
          managerId: userId
        },
        paid: true,
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    })

    // Calculate project growth (comparing to last month)
    const lastMonthProjects = await prisma.project.count({
      where: {
        managerId: userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    const projectGrowth = lastMonthProjects > 0 
      ? Math.round(((activeProjects - lastMonthProjects) / lastMonthProjects) * 100)
      : activeProjects > 0 ? 100 : 0

    // Calculate revenue growth
    const lastMonthRevenue = await prisma.invoice.aggregate({
      where: {
        Project: {
          managerId: userId
        },
        paid: true,
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    })

    const currentRevenue = revenue._sum.amount || 0
    const lastRevenue = lastMonthRevenue._sum.amount || 0
    const revenueGrowth = lastRevenue > 0 
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : currentRevenue > 0 ? 100 : 0

    // Process projects for display
    const projects = managedProjects.map(project => {
      const totalTasks = project.Task.length
      const completedTasks = project.Task.filter(task => task.status === "COMPLETED").length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      const now = new Date()
      const dueDate = project.dueDate ? new Date(project.dueDate) : null
      let dueInfo = "No due date"

      if (dueDate) {
        const diffTime = dueDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
          dueInfo = `Overdue by ${Math.abs(diffDays)} days`
        } else if (diffDays === 0) {
          dueInfo = "Due today"
        } else if (diffDays === 1) {
          dueInfo = "Due tomorrow"
        } else if (diffDays < 7) {
          dueInfo = `Due in ${diffDays} days`
        } else {
          const weeks = Math.ceil(diffDays / 7)
          dueInfo = `Due in ${weeks} week${weeks > 1 ? 's' : ''}`
        }
      }

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        progress,
        dueInfo
      }
    })

    // Process team performance
    const teamPerformance = teamMembers.map(member => {
      const memberTasks = tasks.filter(task => task.assigneeId === member.userId)
      const totalTasks = memberTasks.length
      const completedTasks = memberTasks.filter(task => task.status === "COMPLETED").length
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        name: member.User.name || "Unknown",
        role: member.User.role || "Team Member",
        completionRate,
        completedTasks,
        totalTasks
      }
    }).filter(member => member.totalTasks > 0) // Only show members with tasks

    return NextResponse.json({
      stats: {
        activeProjects,
        teamMembers: teamMembersCount,
        pendingTasks,
        revenue: currentRevenue,
        projectGrowth,
        revenueGrowth
      },
      projects,
      teamPerformance
    })
  } catch (error) {
    console.error("Error fetching project manager dashboard:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
} 