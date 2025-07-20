"use client"

import { useSession } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Home,
  FolderOpen,
  FileText,
  MessageSquare,
  Receipt,
  Users,
  CheckSquare,
  Settings,
  LogOut,
  ChevronUp,
  BarChart3,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import type { Role } from "@/lib/generated/prisma"
import { ThemeToggle } from "@/components/theme-toggle"

const navigationConfig = {
  CLIENT: [
    { title: "Dashboard", url: "/dashboard/client", icon: Home },
    { title: "My Projects", url: "/dashboard/client/projects", icon: FolderOpen },
    { title: "Files", url: "/dashboard/client/files", icon: FileText },
    { title: "Messages", url: "/dashboard/client/messages", icon: MessageSquare },
    { title: "Invoices", url: "/dashboard/client/invoices", icon: Receipt },
    { title: "Proposals", url: "/dashboard/client/proposals", icon: FileText },
  ],
  TEAM_MEMBER: [
    { title: "Dashboard", url: "/dashboard/team-member", icon: Home },
    { title: "My Tasks", url: "/dashboard/team-member/tasks", icon: CheckSquare },
    { title: "Projects", url: "/dashboard/team-member/projects", icon: FolderOpen },
    { title: "Messages", url: "/dashboard/team-member/messages", icon: MessageSquare },
  ],
  PROJECT_MANAGER: [
    { title: "Dashboard", url: "/dashboard/project-manager", icon: Home },
    { title: "Projects", url: "/dashboard/project-manager/projects", icon: FolderOpen },
    { title: "Tasks", url: "/dashboard/project-manager/tasks", icon: CheckSquare },
    { title: "Team", url: "/dashboard/project-manager/team", icon: Users },
    { title: "Proposals", url: "/dashboard/project-manager/proposals", icon: FileText },
    { title: "Invoices", url: "/dashboard/project-manager/invoices", icon: Receipt },
    { title: "Messages", url: "/dashboard/project-manager/messages", icon: MessageSquare },
  ],
  ADMIN: [
    { title: "Dashboard", url: "/dashboard/admin", icon: Home },
    { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3 },
    { title: "Users", url: "/dashboard/admin/users", icon: UserCheck },
    { title: "Projects", url: "/dashboard/admin/projects", icon: FolderOpen },
    { title: "Teams", url: "/dashboard/admin/teams", icon: Users },
    { title: "Tasks", url: "/dashboard/admin/tasks", icon: CheckSquare },
    { title: "Invoices", url: "/dashboard/admin/invoices", icon: Receipt },
    { title: "Messages", url: "/dashboard/admin/messages", icon: MessageSquare },
    { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
  ],
}

export function AppSidebar() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  const userRole = session.user.role as Role
  const navigationItems = navigationConfig[userRole] || []

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Agency Pro</span>
            <span className="truncate text-xs text-muted-foreground">{userRole.replace("_", " ").toLowerCase()}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {session.user.name?.charAt(0) || session.user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{session.user.name || "User"}</span>
                    <span className="truncate text-xs">{session.user.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
