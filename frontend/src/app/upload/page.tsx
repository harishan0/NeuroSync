"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUp, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { uploadNote } from "./actions"

type NoteType = "MARKDOWN" | "PDF" | "IMAGE"

export default function UploadPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [noteType, setNoteType] = useState<NoteType | "">("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !noteType || !file) {
      setError("Please fill in all fields")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("title", title)
      if (noteType) {
        formData.append("note_type", noteType)
      } else {
        setError("Note type is required")
        return
      }

      formData.append("file", file)

      const result = await uploadNote(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setExtractedText(result.extracted_text || null)
      }
    } catch (err) {
      setError("An error occurred while uploading your note")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Notes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload a New Note</CardTitle>
          <CardDescription>Upload your notes in markdown, PDF, or image format</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Note Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your note"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-type">Note Type</Label>
              <Select value={noteType} onValueChange={(value) => setNoteType(value as NoteType)}>
                <SelectTrigger id="note-type">
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKDOWN">Markdown</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="IMAGE">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {noteType === "MARKDOWN" && "Markdown (.md)"}
                      {noteType === "PDF" && "PDF (.pdf)"}
                      {noteType === "IMAGE" && "Image (.png, .jpg, .jpeg)"}
                      {!noteType && "Select a note type first"}
                    </p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept={
                      noteType === "MARKDOWN"
                        ? ".md"
                        : noteType === "PDF"
                          ? ".pdf"
                          : noteType === "IMAGE"
                            ? ".png,.jpg,.jpeg"
                            : ""
                    }
                    disabled={!noteType}
                  />
                </label>
              </div>
              {file && <p className="text-sm text-muted-foreground mt-2">Selected file: {file.name}</p>}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Note"
              )}
            </Button>
          </form>

          {extractedText && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Extracted Text Preview</h3>
              <div className="p-4 border rounded-lg bg-muted/50 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
