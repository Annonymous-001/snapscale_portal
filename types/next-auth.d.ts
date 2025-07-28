import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: Role
      isActive: boolean
    }
  }

  interface User {
    role: Role
    isActive: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    isActive: boolean
  }
}
