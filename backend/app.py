from fastapi import FastAPI, File, Form, UploadFile
from PIL import Image
import pytesseract
from io import BytesIO
from models import NoteType, Question

import pdfplumber
from dotenv import load_dotenv
import os
import shutil

from langchain_community.document_loaders import TextLoader
from rag_util import split_text, save_to_chroma
import chromadb

app = FastAPI()
load_dotenv()

CHROMA_PATH = "chroma"

if os.path.exists(CHROMA_PATH):
    shutil.rmtree(CHROMA_PATH)


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

    loader = TextLoader(f"{filename}.md")
    docs = loader.load()
    chunks = split_text(docs)
    save_to_chroma(chunks, CHROMA_PATH)

    return {"title": title, "note_type": note_type, "extracted_text": text}

    

# Accept question + history, return RAG Answer
@app.post('/ask')
def ask(request: Question):
    question = request.question

    pass

# Return list of notes for tagging/viewing 
@app.get("/notes")
def get_notes(): 
    pass

