"use server"

export async function uploadNote(formData: FormData) {
  try {
    // Use your FastAPI backend URL
    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.detail || "Failed to upload note" }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error uploading note:", error)
    return { error: "Failed to upload note. Make sure your FastAPI backend is running at http://127.0.0.1:8000" }
  }
}
