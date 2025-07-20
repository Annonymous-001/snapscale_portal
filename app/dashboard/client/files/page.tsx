import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Upload } from "lucide-react"

export default async function ClientFilesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CLIENT") {
    redirect("/auth/signin")
  }

  // TODO: Replace with server action to fetch user's files
  const files = [
    {
      id: "1",
      name: "Website_Mockups_v2.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadedAt: "2024-01-15",
      project: "Website Redesign",
    },
    {
      id: "2",
      name: "Brand_Guidelines.zip",
      type: "ZIP",
      size: "15.2 MB",
      uploadedAt: "2024-01-10",
      project: "Brand Identity",
    },
    {
      id: "3",
      name: "App_Wireframes.fig",
      type: "Figma",
      size: "8.7 MB",
      uploadedAt: "2024-01-08",
      project: "Mobile App Development",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Files" breadcrumbs={[{ label: "Client", href: "/dashboard/client" }]} />

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage your project files and documents</p>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      <div className="grid gap-4">
        {files.map((file) => (
          <Card key={file.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.project} • {file.size} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{file.type}</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
