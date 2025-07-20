import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { Role } from "./lib/generated/prisma"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirect to appropriate dashboard after login
    if (pathname === "/" && token) {
      const dashboardPath = getDashboardPath(token.role as Role)
      return NextResponse.redirect(new URL(dashboardPath, req.url))
    }

    // Role-based route protection
    if (pathname.startsWith("/dashboard")) {
      const userRole = token?.role as Role
      const requiredRole = getRequiredRole(pathname)

      // Only allow access if userRole matches requiredRole (except ADMIN, who can access all)
      if (requiredRole && userRole !== requiredRole && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes
        if (pathname.startsWith("/auth") || pathname === "/unauthorized") {
          return true
        }

        // Protected routes require authentication
        return !!token
      },
    },
  },
)

function getDashboardPath(role: Role): string {
  switch (role) {
    case "CLIENT":
      return "/dashboard/client"
    case "TEAM_MEMBER":
      return "/dashboard/team-member"
    case "PROJECT_MANAGER":
      return "/dashboard/project-manager"
    case "ADMIN":
      return "/dashboard/admin"
    default:
      return "/auth/signin"
  }
}

function getRequiredRole(pathname: string): Role | null {
  if (pathname.startsWith("/dashboard/client")) return "CLIENT"
  if (pathname.startsWith("/dashboard/team-member")) return "TEAM_MEMBER"
  if (pathname.startsWith("/dashboard/project-manager")) return "PROJECT_MANAGER"
  if (pathname.startsWith("/dashboard/admin")) return "ADMIN"
  return null
}

function hasAccess(userRole: Role, requiredRole: Role | null, pathname: string): boolean {
  if (!requiredRole) return true

  // Admin has access to everything
  if (userRole === "ADMIN") return true

  // Project managers can access team member routes
  if (userRole === "PROJECT_MANAGER" && requiredRole === "TEAM_MEMBER") return true

  // Exact role match
  return userRole === requiredRole
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
