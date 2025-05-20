import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Brain, FileUp, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]">
      <div className="max-w-3xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to <span className="text-primary">NeuroSync</span>
        </h1>
        <p className="text-xl text-muted-foreground">Upload your notes and ask questions to get AI-powered insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Upload Notes
            </CardTitle>
            <CardDescription>Upload your notes in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Upload markdown, PDF, or image files to extract and store your notes.</p>
            <Link href="/upload">
              <Button className="w-full">Upload Notes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ask Questions
            </CardTitle>
            <CardDescription>Query your uploaded notes with AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Ask questions about your notes and get AI-powered answers.</p>
            <Link href="/ask">
              <Button className="w-full">Ask Questions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 flex items-center gap-2 text-muted-foreground">
        <Brain className="h-5 w-5" />
        <p>Powered by LangChain and FastAPI</p>
      </div>
    </div>
  )
}
