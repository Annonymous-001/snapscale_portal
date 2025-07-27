"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Edit, Eye, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserForm } from "@/components/users/user-form"
import { DeleteUserDialog } from "@/components/users/delete-user-dialog"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [editingUser, setEditingUser] = useState<any | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/users")
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data ?? [])
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (formData: FormData) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Failed to create user")
      await loadUsers()
    } catch (error) {
      throw error
    }
  }

  const handleUpdateUser = async (formData: FormData) => {
    if (!editingUser) return
    try {
      const res = await fetch(`/api/users?id=${editingUser.id}`, {
        method: "PUT",
        body: formData,
      })
      if (!res.ok) throw new Error("Failed to update user")
      await loadUsers()
      setEditingUser(null)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete user")
      await loadUsers()
    } catch (error) {
      throw error
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "PROJECT_MANAGER":
        return "secondary"
      case "TEAM_MEMBER":
        return "default"
      case "CLIENT":
        return "outline"
      default:
        return "outline"
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
            New User
          </Button>
        </div>
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-8 w-20 rounded" />
                  <Skeleton className="h-8 w-20 rounded" />
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
          New User
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{user.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleVariant(user.role)}>
                      {user.role?.replace("_", " ")}
                    </Badge>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{user.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{user.location || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Login</p>
                      <p className="font-medium">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "-"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
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
