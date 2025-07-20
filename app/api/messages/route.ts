import { NextResponse } from "next/server"
import { getMessages, createMessage, markMessageAsRead, deleteMessage } from "@/lib/actions/messages"

export async function GET() {
  try {
    const messages = await getMessages()
    return NextResponse.json(messages)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const message = await createMessage(formData)
    return NextResponse.json(message)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) throw new Error("Missing message id")
    await markMessageAsRead(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) throw new Error("Missing message id")
    await deleteMessage(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 