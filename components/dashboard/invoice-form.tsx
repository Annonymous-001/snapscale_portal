"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import * as z from "zod"
import { getProjects } from "@/lib/actions/projects"
import { getUsers } from "@/lib/actions/users"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { format } from "date-fns"

const invoiceSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("USD"),
  dueDate: z.string().min(1, "Due date is required"),
  paid: z.string().optional(),
  status: z.enum(["PENDING", "SENT", "PAID", "OVERDUE", "CANCELLED"]).default("PENDING"),
  notes: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().min(1, "Project is required"),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: any
  onSubmit: (formData: FormData) => Promise<void>
}

export function InvoiceForm({ open, onOpenChange, invoice, onSubmit }: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [projectOptions, setProjectOptions] = useState<{ id: string; name: string }[]>([])
  const [clientOptions, setClientOptions] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    async function fetchOptions() {
      const projects = await getProjects()
      if (Array.isArray(projects)) {
        setProjectOptions(projects.map((p: any) => ({ id: p.id, name: p.name ?? "(No Name)" })))
      } else {
        setProjectOptions([])
      }
      const users = await getUsers()
      if (Array.isArray(users)) {
        setClientOptions(
          users
            .filter((u: any) => u.role === "CLIENT")
            .map((u: any) => ({ id: u.id, name: u.name ?? "(No Name)" }))
        )
      } else {
        setClientOptions([])
      }
    }
    if (open) fetchOptions()
  }, [open])

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
          amount: invoice.amount || "",
          currency: invoice.currency || "USD",
          dueDate: invoice.dueDate ? invoice.dueDate.slice(0, 10) : "",
          paid: invoice.paid ? "true" : "false",
          status: invoice.status || "PENDING",
          notes: invoice.notes || "",
          clientId: invoice.client?.id || "",
          projectId: invoice.project?.id || "",
        }
      : {
          amount: "",
          currency: "USD",
          dueDate: "",
          paid: "false",
          status: "PENDING",
          notes: "",
          clientId: "",
          projectId: "",
        },
  })

  useEffect(() => {
    if (invoice) {
      form.reset({
        amount: invoice.amount || "",
        currency: invoice.currency || "USD",
        dueDate: invoice.dueDate ? invoice.dueDate.slice(0, 10) : "",
        paid: invoice.paid ? "true" : "false",
        status: invoice.status || "PENDING",
        notes: invoice.notes || "",
        clientId: invoice.client?.id || "",
        projectId: invoice.project?.id || "",
      })
    } else {
      form.reset({
        amount: "",
        currency: "USD",
        dueDate: "",
        paid: "false",
        status: "PENDING",
        notes: "",
        clientId: "",
        projectId: "",
      })
    }
  }, [invoice, open])

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === "paid") {
          formData.append("paid", value === "true" ? "true" : "false")
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string)
        }
      })
      await onSubmit(formData)
      toast.success(invoice ? "Invoice updated" : "Invoice created")
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "New Invoice"}</DialogTitle>
          <DialogDescription>
            {invoice ? "Update invoice details" : "Create a new invoice"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={field.value ? "default" : "outline"}
                          className={"w-full justify-start text-left font-normal" + (!field.value ? " text-muted-foreground" : "")}
                          type="button"
                        >
                          {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={date => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Paid?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 