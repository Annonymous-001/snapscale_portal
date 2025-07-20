"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, UserCheck, UserX, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserForm } from "@/components/users/user-form"
import { DeleteUserDialog } from "@/components/users/delete-user-dialog"
import { getUsers, createUser, updateUser, toggleUserStatus, deleteUser } from "@/lib/actions/users"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  phone: string | null
  timezone: string
  projectsCount: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data as User[])
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (formData: FormData) => {
    try {
      await createUser(formData)
      await loadUsers()
    } catch (error) {
      throw error
    }
  }

  const handleUpdateUser = async (formData: FormData) => {
    if (!editingUser) return
    try {
      await updateUser(editingUser.id, formData)
      await loadUsers()
      setEditingUser(null)
    } catch (error) {
      throw error
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      await toggleUserStatus(userId)
      await loadUsers()
      toast.success("User status updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user status")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      await loadUsers()
    } catch (error) {
      throw error
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "PROJECT_MANAGER":
        return "bg-yellow-100 text-yellow-800"
      case "TEAM_MEMBER":
        return "bg-green-100 text-green-800"
      case "CLIENT":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader title="Users" breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }]} />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search users..." className="pl-10" disabled />
            </div>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-40 mb-2" />
                      <div className="flex items-center gap-2 mt-1">
                        <Skeleton className="h-5 w-20 rounded" />
                        <Skeleton className="h-5 w-16 rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-8 w-20 rounded" />
                  <Skeleton className="h-8 w-28 rounded" />
                  <Skeleton className="h-8 w-20 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Users" breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }]} />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "No users found matching your search" : "No users found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{user.name || "N/A"}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getRoleColor(user.role)}>
                          {user.role.replace("_", " ")}
                        </Badge>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Projects: {user.projectsCount}</p>
                      <p>Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</p>
                      <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingUser(user)
                      setFormOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <UserForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            setEditingUser(null)
          }
        }}
        user={editingUser || undefined}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
      />

      {selectedUser && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={selectedUser}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  )
}
