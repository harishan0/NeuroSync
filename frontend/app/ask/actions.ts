"use server"

export async function askQuestion({ question }: { question: string }) {
  try {
    // Use your FastAPI backend URL
    const response = await fetch("http://127.0.0.1:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.detail || "Failed to process your question" }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error asking question:", error)
    return {
      error: "Failed to process your question. Make sure your FastAPI backend is running at http://127.0.0.1:8000",
    }
  }
}
