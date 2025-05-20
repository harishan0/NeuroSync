"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare, Brain } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { askQuestion } from "./actions"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AskPage() {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) {
      setError("Please enter a question")
      return
    }

    setIsLoading(true)
    setError(null)

    // Add user message to chat history
    const userMessage: ChatMessage = {
      role: "user",
      content: question,
      timestamp: new Date(),
    }

    setChatHistory((prev) => [...prev, userMessage])

    try {
      const result = await askQuestion({ question: question.trim() })

      if (result.error) {
        setError(result.error)
      } else {
        // Add assistant message to chat history
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: result.answer || "",
          timestamp: new Date(),
        }

        setChatHistory((prev) => [...prev, assistantMessage])
        setQuestion("")
      }
    } catch (err) {
      setError("An error occurred while processing your question")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ask Questions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ask About Your Notes</CardTitle>
          <CardDescription>Ask questions about your uploaded notes and get AI-powered answers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about your notes?"
              className="min-h-32"
              disabled={isLoading}
            />

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask Question
                </>
              )}
            </Button>
          </form>

          {chatHistory.length > 0 && (
            <div className="mt-8 space-y-6">
              <h3 className="text-lg font-medium">Chat History</h3>

              <div className="space-y-4">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.role === "assistant" ? (
                          <Brain className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">{message.role === "user" ? "You" : "NeuroSync"}</span>
                        <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
