import { z } from "zod"

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().min(5, "Description is required"),
  clientId: z.string().min(1, "Client is required"),
  managerId: z.string().min(1, "Manager is required"),
  teamId: z.string().optional(),
  budget: z.coerce.number().min(0, "Budget must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ARCHIVED", "CANCELLED"]).default("PENDING"),
})

export type ProjectFormData = z.infer<typeof projectSchema> 