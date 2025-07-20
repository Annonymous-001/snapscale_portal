"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, Trash2 } from "lucide-react"
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from "@/lib/actions/invoices"
import { InvoiceForm } from "@/components/dashboard/invoice-form"
import { DeleteInvoiceDialog } from "@/components/dashboard/delete-invoice-dialog"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await getInvoices()
      setInvoices(data ?? [])
    } catch (error) {
      toast.error("Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async (formData: FormData) => {
    try {
      await createInvoice(formData)
      await loadInvoices()
    } catch (error) {
      throw error
    }
  }

  const handleUpdateInvoice = async (formData: FormData) => {
    if (!editingInvoice) return
    try {
      await updateInvoice(editingInvoice.id, formData)
      await loadInvoices()
      setEditingInvoice(null)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId)
      await loadInvoices()
    } catch (error) {
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader title="Invoices" breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }]} />
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Manage all invoices</p>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-40 mb-2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
      <DashboardHeader title="Invoices" breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }]} />
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage all invoices</p>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>
      <div className="grid gap-4">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No invoices found</p>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Invoice #{invoice.id}</CardTitle>
                    <CardDescription>{invoice.project?.name || "-"}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        invoice.status === "PAID"
                          ? "default"
                          : invoice.status === "OVERDUE"
                          ? "destructive"
                          : invoice.status === "SENT"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {invoice.status}
                    </Badge>
                    <Badge variant={invoice.paid ? "default" : "secondary"}>{invoice.paid ? "Paid" : "Unpaid"}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Client</p>
                      <p className="font-medium">{invoice.client?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">
                        {invoice.currency} {invoice.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Notes</p>
                      <p className="font-medium">{invoice.notes || "-"}</p>
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
                        setEditingInvoice(invoice)
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
                        setSelectedInvoice(invoice)
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
      <InvoiceForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            setEditingInvoice(null)
          }
        }}
        invoice={editingInvoice || undefined}
        onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
      />
      {selectedInvoice && (
        <DeleteInvoiceDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          invoice={selectedInvoice}
          onDelete={handleDeleteInvoice}
        />
      )}
    </div>
  )
}