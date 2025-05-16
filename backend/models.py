from enum import Enum
from pydantic import BaseModel, FilePath, HttpUrl
from typing import Optional
from pathlib import Path

class NoteType(str, Enum): 
    MARKDOWN = "markdown"
    PDF = "pdf"
    IMAGE = "image"

class Question(BaseModel): 
    question: str