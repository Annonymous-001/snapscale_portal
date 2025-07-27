import { NextResponse } from "next/server"
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/actions/projects"

export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json(projects)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const project = await createProject(formData)
    return NextResponse.json(project)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) throw new Error("Missing project id")
    const formData = await request.formData()
    const project = await updateProject(id, formData)
    return NextResponse.json(project)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) throw new Error("Missing project id")
    await deleteProject(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 