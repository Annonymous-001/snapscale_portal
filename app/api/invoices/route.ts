import { NextResponse } from "next/server"
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from "@/lib/actions/invoices"

export async function GET() {
  try {
    const invoices = await getInvoices()
    return NextResponse.json(invoices)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const invoice = await createInvoice(formData)
    return NextResponse.json(invoice)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) throw new Error("Missing invoice id")
    const formData = await request.formData()
    const invoice = await updateInvoice(id, formData)
    return NextResponse.json(invoice)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) throw new Error("Missing invoice id")
    await deleteInvoice(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 