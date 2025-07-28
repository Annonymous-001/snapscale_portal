// import { PrismaClient } from "../lib/generated/prisma";
// import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🧹 Cleaning up existing data...");
  
//   // Delete all data in reverse order of dependencies
//   await prisma.message.deleteMany();
//   await prisma.proposal.deleteMany();
//   await prisma.task.deleteMany();
//   await prisma.invoice.deleteMany();
//   await prisma.file.deleteMany();
//   await prisma.project.deleteMany();
//   await prisma.teamMember.deleteMany();
//   await prisma.team.deleteMany();
//   await prisma.account.deleteMany();
//   await prisma.session.deleteMany();
//   await prisma.verificationToken.deleteMany();
//   await prisma.user.deleteMany();

//   console.log("🌱 Seeding database...");

//   const hashPassword = (pw: string) => bcrypt.hash(pw, 12);

//   const users: Record<string, { email: string; name: string; role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER" | "CLIENT" }> = {
//     admin: {
//       email: "admin@agency.com",
//       name: "Admin User",
//       role: "ADMIN",
//     },
//     manager: {
//       email: "manager@agency.com",
//       name: "Project Manager",
//       role: "PROJECT_MANAGER",
//     },
//     team1: {
//       email: "dev1@agency.com",
//       name: "Dev One",
//       role: "TEAM_MEMBER",
//     },
//     team2: {
//       email: "dev2@agency.com",
//       name: "Dev Two",
//       role: "TEAM_MEMBER",
//     },
//     designer: {
//       email: "designer@agency.com",
//       name: "UI Designer",
//       role: "TEAM_MEMBER",
//     },
//     client1: {
//       email: "client1@client.com",
//       name: "Client One",
//       role: "CLIENT",
//     },
//     client2: {
//       email: "client2@client.com",
//       name: "Client Two",
//       role: "CLIENT",
//     },
//   };

//   const password = await hashPassword("demo123");

//   const createdUsers: Record<string, any> = {};
//   for (const key in users) {
//     const user = await prisma.user.create({
//       data: {
//         ...users[key],
//         password,
//         isActive: true,
//       },
//     });
//     createdUsers[key] = user;
//   }

//   // Create Teams
//   const devTeam = await prisma.team.create({
//     data: {
//       name: "Development Team",
//       teamLeadId: createdUsers.manager.id,
//     },
//   });

//   const designTeam = await prisma.team.create({
//     data: {
//       name: "Design Team",
//       teamLeadId: createdUsers.designer.id,
//     },
//   });

//   // Assign Team Members
//   await prisma.teamMember.createMany({
//     data: [
//       {
//         userId: createdUsers.team1.id,
//         teamId: devTeam.id,
//         role: "MEMBER",
//       },
//       {
//         userId: createdUsers.team2.id,
//         teamId: devTeam.id,
//         role: "MEMBER",
//       },
//       {
//         userId: createdUsers.designer.id,
//         teamId: designTeam.id,
//         role: "LEAD",
//       },
//     ],
//   });

//   // Create Projects
//   const projects = [
//     {
//       name: "SaaS Platform",
//       clientId: createdUsers.client1.id,
//       managerId: createdUsers.manager.id,
//       teamId: devTeam.id,
//       priority: "HIGH" as const,
//       status: "IN_PROGRESS" as const,
//       budget: 20000,
//     },
//     {
//       name: "Logo Rebrand",
//       clientId: createdUsers.client2.id,
//       managerId: createdUsers.manager.id,
//       teamId: designTeam.id,
//       priority: "LOW" as const,
//       status: "COMPLETED" as const,
//       budget: 5000,
//     },
//     {
//       name: "E-commerce Site",
//       clientId: createdUsers.client1.id,
//       managerId: createdUsers.manager.id,
//       teamId: devTeam.id,
//       priority: "URGENT" as const,
//       status: "REVIEW" as const,
//       budget: 30000,
//     },
//   ];

//   const createdProjects = [];
//   for (const project of projects) {
//     createdProjects.push(
//       await prisma.project.create({
//         data: {
//           ...project,
//           currency: "USD",
//           startDate: new Date("2024-01-01"),
//           dueDate: new Date("2024-12-31"),
//         },
//       })
//     );
//   }

//   // Create Tasks
//   await prisma.task.createMany({
//     data: [
//       {
//         title: "Setup CI/CD",
//         status: "COMPLETED",
//         assigneeId: createdUsers.team1.id,
//         projectId: createdProjects[0].id,
//         estimatedHours: 10,
//         actualHours: 12,
//         priority: "MEDIUM",
//         deadline: new Date("2024-02-01"),
//         createdBy: createdUsers.manager.id,
//       },
//       {
//         title: "API Integration",
//         status: "IN_PROGRESS",
//         assigneeId: createdUsers.team2.id,
//         projectId: createdProjects[0].id,
//         estimatedHours: 20,
//         priority: "HIGH",
//         deadline: new Date("2024-02-10"),
//         createdBy: createdUsers.manager.id,
//       },
//       {
//         title: "Design Landing Page",
//         status: "COMPLETED",
//         assigneeId: createdUsers.designer.id,
//         projectId: createdProjects[1].id,
//         estimatedHours: 8,
//         actualHours: 7,
//         completedAt: new Date("2024-01-20"),
//         priority: "LOW",
//         createdBy: createdUsers.manager.id,
//       },
//       {
//         title: "Checkout Integration",
//         status: "BLOCKED",
//         assigneeId: createdUsers.team1.id,
//         projectId: createdProjects[2].id,
//         estimatedHours: 16,
//         priority: "URGENT",
//         createdBy: createdUsers.manager.id,
//       },
//     ],
//   });

//   // Create Invoices
//   await prisma.invoice.createMany({
//     data: [
//       {
//         amount: 5000,
//         currency: "USD",
//         dueDate: new Date("2024-02-15"),
//         clientId: createdUsers.client1.id,
//         projectId: createdProjects[0].id,
//         status: "SENT",
//       },
//       {
//         amount: 3000,
//         currency: "USD",
//         dueDate: new Date("2024-01-10"),
//         paid: true,
//         paidAt: new Date("2024-01-09"),
//         clientId: createdUsers.client2.id,
//         projectId: createdProjects[1].id,
//         status: "PAID",
//       },
//     ],
//   });

//   // Create Proposals
//   await prisma.proposal.create({
//     data: {
//       title: "Redesign Proposal",
//       content: {
//         type: "doc",
//         content: [
//           {
//             type: "paragraph",
//             content: [{ type: "text", text: "Modernize the current branding and website." }],
//           },
//         ],
//       },
//       projectId: createdProjects[1].id,
//       createdBy: createdUsers.manager.id,
//       status: "APPROVED",
//       version: 1,
//       validUntil: new Date("2024-04-01"),
//     },
//   });

//   // Messages
//   await prisma.message.createMany({
//     data: [
//       {
//         content: "Please review the new homepage layout.",
//         fromAdmin: true,
//         priority: "NORMAL",
//         userId: createdUsers.client1.id,
//         projectId: createdProjects[0].id,
//       },
//       {
//         content: "When is the next invoice due?",
//         fromAdmin: false,
//         priority: "LOW",
//         userId: createdUsers.client1.id,
//         projectId: createdProjects[0].id,
//       },
//     ],
//   });

//   console.log("🎉 Seed complete with users, teams, projects, tasks, invoices, messages.");
// }

// main()
//   .then(() => prisma.$disconnect())
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
