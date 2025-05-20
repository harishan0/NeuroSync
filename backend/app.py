from fastapi import FastAPI, File, Form, UploadFile
from PIL import Image
import pytesseract
from io import BytesIO
from models import NoteType, Question

import pdfplumber
from dotenv import load_dotenv
import os
import shutil

from rag_util import split_text, save_to_faiss, query_documents, cleanup_vector_db, load_file, load_directory

app = FastAPI()
load_dotenv()

FAISS_PATH = "faiss"

# Remove database if it exists 
# if os.path.exists(FAISS_PATH):
#     shutil.rmtree(FAISS_PATH)


@app.get("/")
def read_root(): 
    return {"message": "FastAPI Server is running"}

# Uploading notes to database
@app.post('/upload')
async def upload_notes(title: str = Form(...), note_type: NoteType = Form(...), file: UploadFile = File(...)):
    contents = await file.read()
    if note_type == NoteType.IMAGE: 
        image = Image.open(BytesIO(contents))
        text = pytesseract.image_to_string(image)

    elif note_type == NoteType.MARKDOWN: 
        text = contents.decode('utf-8')

    elif note_type == NoteType.PDF: 
        text = ""
        with pdfplumber.open(BytesIO(contents)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    else: 
        return {"title": title, "note_type": note_type, "extracted_text": "Unsupported document type"}
    

    output_dir = "../notes"
    os.makedirs(output_dir, exist_ok=True)

    filename = f"{filename}.md"
    file_path = os.path.join(output_dir, filename)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)   

    # Chunk text and save to FAISS
    docs = load_file(filename)
    chunks = split_text(docs)
    save_to_faiss(chunks, FAISS_PATH)

    return {"title": title, "note_type": note_type, "extracted_text": text}

# Accept question + history, return RAG Answer
@app.post('/ask')
def ask(request: Question):
    question = request.question
    answer = query_documents(question, FAISS_PATH)
    return {"question": question, "answer": answer}

