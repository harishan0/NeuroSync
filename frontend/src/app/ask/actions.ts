"use server"

export async function askQuestion({ question }: { question: string }) {
  try {
    // In a real implementation, you would send this to your FastAPI backend
    // For now, we'll simulate a response

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Validate input
    if (!question) {
      return { error: "Question is required" }
    }

    // In a real implementation, you would send the question to your API
    // const response = await fetch("YOUR_API_URL/ask", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ question }),
    // })
    // const data = await response.json()

    // Simulate different responses based on keywords in the question
    let answer = ""

    if (question.toLowerCase().includes("markdown")) {
      answer =
        "Markdown is a lightweight markup language with plain text formatting syntax. In NeuroSync, you can upload markdown files and our system will extract the text content for you to query later."
    } else if (question.toLowerCase().includes("pdf")) {
      answer =
        "PDF (Portable Document Format) is a file format used to present documents in a manner independent of application software, hardware, and operating systems. NeuroSync can extract text from your PDF files to make them searchable."
    } else if (question.toLowerCase().includes("image")) {
      answer =
        "NeuroSync can process image files (.png, .jpg, .jpeg) using OCR (Optical Character Recognition) to extract text content from your images, making them searchable along with your other notes."
    } else {
      answer =
        "Based on your uploaded notes, I can provide the following information:\n\nNeuroSync is a powerful note management system that allows you to upload various types of documents and query them using natural language. The system uses advanced AI to understand your questions and find relevant information in your notes.\n\nYou can upload markdown files, PDFs, and even images containing text, and NeuroSync will extract and index the content for you."
    }

    return { answer }
  } catch (error) {
    console.error("Error asking question:", error)
    return { error: "Failed to process your question" }
  }
}
