import { PrismaClient } from "../lib/generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Hash passwords for demo accounts
  const hashedPassword = await bcrypt.hash("demo123", 12)

  // Create demo users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@agency.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  })

  const managerUser = await prisma.user.create({
    data: {
      email: "manager@agency.com",
      name: "Project Manager",
      password: hashedPassword,
      role: "PROJECT_MANAGER",
      isActive: true,
    },
  })

  const teamUser = await prisma.user.create({
    data: {
      email: "team@agency.com",
      name: "Team Member",
      password: hashedPassword,
      role: "TEAM_MEMBER",
      isActive: true,
    },
  })

  const clientUser = await prisma.user.create({
    data: {
      email: "client@agency.com",
      name: "Client User",
      password: hashedPassword,
      role: "CLIENT",
      isActive: true,
    },
  })

  // Additional users for teams
  const additionalTeamMember = await prisma.user.create({
    data: {
      email: "sarah@agency.com",
      name: "Sarah Johnson",
      password: hashedPassword,
      role: "TEAM_MEMBER",
      isActive: true,
    },
  })

  const additionalClient = await prisma.user.create({
    data: {
      email: "john@client.com",
      name: "John Smith",
      password: hashedPassword,
      role: "CLIENT",
      isActive: true,
    },
  })

  console.log("✅ Created demo users")

  // Create teams
  const devTeam = await prisma.team.create({
    data: {
      name: "Development Team",
      description: "Frontend and backend developers",
      isActive: true,
    },
  })

  const designTeam = await prisma.team.create({
    data: {
      name: "Design Team",
      description: "UI/UX designers and creative team",
      isActive: true,
    },
  })

  const qaTeam = await prisma.team.create({
    data: {
      name: "QA Team",
      description: "Quality assurance and testing specialists",
      isActive: true,
    },
  })

  console.log("✅ Created teams")

  // Add team members and assign leads
  const devMember = await prisma.teamMember.create({
    data: {
      userId: teamUser.id,
      teamId: devTeam.id,
      role: "MEMBER",
      isActive: true,
    },
  })
  const devLead = await prisma.teamMember.create({
    data: {
      userId: managerUser.id,
      teamId: devTeam.id,
      role: "LEAD",
      isActive: true,
    },
  })
  await prisma.team.update({
    where: { id: devTeam.id },
    data: { teamLeadId: managerUser.id },
  })

  const designMember = await prisma.teamMember.create({
    data: {
      userId: teamUser.id,
      teamId: designTeam.id,
      role: "MEMBER",
      isActive: true,
    },
  })
  const designLead = await prisma.teamMember.create({
    data: {
      userId: additionalTeamMember.id,
      teamId: designTeam.id,
      role: "LEAD",
      isActive: true,
    },
  })
  await prisma.team.update({
    where: { id: designTeam.id },
    data: { teamLeadId: additionalTeamMember.id },
  })

  const qaMember = await prisma.teamMember.create({
    data: {
      userId: additionalTeamMember.id,
      teamId: qaTeam.id,
      role: "MEMBER",
      isActive: true,
    },
  })
  const qaLead = await prisma.teamMember.create({
    data: {
      userId: teamUser.id,
      teamId: qaTeam.id,
      role: "LEAD",
      isActive: true,
    },
  })
  await prisma.team.update({
    where: { id: qaTeam.id },
    data: { teamLeadId: teamUser.id },
  })

  console.log("✅ Created team memberships and assigned leads")

  // Create sample projects
  const websiteProject = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete redesign of company website with modern UI/UX",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date("2024-02-15"),
      startDate: new Date("2024-01-01"),
      budget: 15000.0,
      currency: "USD",
      clientId: clientUser.id,
      managerId: managerUser.id,
      teamId: devTeam.id,
    },
  })

  const mobileProject = await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "Native mobile app for iOS and Android",
      status: "REVIEW",
      priority: "MEDIUM",
      dueDate: new Date("2024-03-01"),
      startDate: new Date("2024-01-15"),
      budget: 25000.0,
      currency: "USD",
      clientId: clientUser.id,
      managerId: managerUser.id,
      teamId: devTeam.id,
    },
  })

  const brandProject = await prisma.project.create({
    data: {
      name: "Brand Identity",
      description: "Complete brand identity package including logo and guidelines",
      status: "COMPLETED",
      priority: "LOW",
      dueDate: new Date("2024-01-30"),
      startDate: new Date("2023-12-01"),
      budget: 8000.0,
      currency: "USD",
      clientId: clientUser.id,
      managerId: managerUser.id,
      teamId: designTeam.id,
    },
  })

  console.log("✅ Created sample projects")

  // Create sample tasks
  await prisma.task.create({
    data: {
      title: "Implement user authentication",
      description: "Set up NextAuth.js with database integration",
      status: "IN_PROGRESS",
      priority: "HIGH",
      deadline: new Date("2024-01-20"),
      estimatedHours: 16,
      actualHours: 12,
      assigneeId: teamUser.id,
      projectId: websiteProject.id,
      createdBy: managerUser.id,
    },
  })

  await prisma.task.create({
    data: {
      title: "Design mobile wireframes",
      description: "Create wireframes for all mobile app screens",
      status: "PENDING",
      priority: "MEDIUM",
      deadline: new Date("2024-01-25"),
      estimatedHours: 24,
      assigneeId: teamUser.id,
      projectId: mobileProject.id,
      createdBy: managerUser.id,
    },
  })

  await prisma.task.create({
    data: {
      title: "Code review and testing",
      description: "Review code and perform comprehensive testing",
      status: "PENDING",
      priority: "URGENT",
      deadline: new Date("2024-01-18"),
      estimatedHours: 8,
      assigneeId: teamUser.id,
      projectId: websiteProject.id,
      createdBy: managerUser.id,
    },
  })

  console.log("✅ Created sample tasks")

  // Create sample invoices
  await prisma.invoice.create({
    data: {
      amount: 5000.0,
      currency: "USD",
      dueDate: new Date("2024-02-01"),
      paid: false,
      status: "SENT",
      notes: "First milestone payment for website redesign",
      clientId: clientUser.id,
      projectId: websiteProject.id,
    },
  })

  await prisma.invoice.create({
    data: {
      amount: 8000.0,
      currency: "USD",
      dueDate: new Date("2024-01-15"),
      paid: true,
      status: "PAID",
      notes: "Final payment for brand identity project",
      paidAt: new Date("2024-01-10"),
      clientId: clientUser.id,
      projectId: brandProject.id,
    },
  })

  console.log("✅ Created sample invoices")

  // Create sample proposals
  await prisma.proposal.create({
    data: {
      title: "Mobile App Development Proposal",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "We propose to develop a comprehensive mobile application that will serve your business needs and provide an excellent user experience for your customers.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The project will include native iOS and Android applications with the following features:",
              },
            ],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "User authentication and profiles" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Real-time notifications" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Offline functionality" }],
                  },
                ],
              },
            ],
          },
        ],
      },
      status: "SENT",
      version: 1,
      validUntil: new Date("2024-02-15"),
      projectId: mobileProject.id,
      createdBy: managerUser.id,
    },
  })

  console.log("✅ Created sample proposals")

  // Create sample messages
  await prisma.message.create({
    data: {
      content:
        "The website redesign is progressing well. We have completed the authentication system and are now working on the user interface. The project is on track to meet the deadline.",
      fromAdmin: true,
      read: false,
      priority: "NORMAL",
      userId: clientUser.id,
      projectId: websiteProject.id,
    },
  })

  await prisma.message.create({
    data: {
      content:
        "Please review the mobile app proposal we sent yesterday. We would like to get your feedback by the end of the week so we can proceed with the development phase.",
      fromAdmin: true,
      read: false,
      priority: "HIGH",
      userId: clientUser.id,
      projectId: mobileProject.id,
    },
  })

  await prisma.message.create({
    data: {
      content:
        "Thank you for the project update. The progress looks great! I have a few questions about the user interface design. Can we schedule a call this week?",
      fromAdmin: false,
      read: true,
      priority: "NORMAL",
      userId: clientUser.id,
      projectId: websiteProject.id,
    },
  })

  console.log("✅ Created sample messages")

  // Create additional project for the new client
  const ecommerceProject = await prisma.project.create({
    data: {
      name: "E-commerce Platform",
      description: "Full-featured e-commerce platform with payment integration",
      status: "PENDING",
      priority: "MEDIUM",
      dueDate: new Date("2024-04-01"),
      startDate: new Date("2024-02-01"),
      budget: 35000.0,
      currency: "USD",
      clientId: additionalClient.id,
      managerId: managerUser.id,
      teamId: devTeam.id,
    },
  })

  // Add more tasks for better demo
  await prisma.task.create({
    data: {
      title: "Database schema design",
      description: "Design and implement the database schema for the e-commerce platform",
      status: "PENDING",
      priority: "HIGH",
      deadline: new Date("2024-02-10"),
      estimatedHours: 20,
      assigneeId: additionalTeamMember.id,
      projectId: ecommerceProject.id,
      createdBy: managerUser.id,
    },
  })

  await prisma.task.create({
    data: {
      title: "Payment gateway integration",
      description: "Integrate Stripe payment gateway for secure transactions",
      status: "PENDING",
      priority: "HIGH",
      deadline: new Date("2024-02-20"),
      estimatedHours: 16,
      assigneeId: teamUser.id,
      projectId: ecommerceProject.id,
      createdBy: managerUser.id,
    },
  })

  await prisma.task.create({
    data: {
      title: "UI component library",
      description: "Create reusable UI components for the website",
      status: "COMPLETED",
      priority: "MEDIUM",
      deadline: new Date("2024-01-15"),
      estimatedHours: 12,
      actualHours: 14,
      completedAt: new Date("2024-01-14"),
      assigneeId: additionalTeamMember.id,
      projectId: websiteProject.id,
      createdBy: managerUser.id,
    },
  })

  console.log("✅ Created additional demo data")

  console.log("🎉 Database seeded successfully!")
  console.log("\n📧 Demo accounts created:")
  console.log("Admin: admin@agency.com / demo123")
  console.log("Manager: manager@agency.com / demo123")
  console.log("Team: team@agency.com / demo123")
  console.log("Client: client@agency.com / demo123")
  console.log("Additional Team: sarah@agency.com / demo123")
  console.log("Additional Client: john@client.com / demo123")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
