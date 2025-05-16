from langchain.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
import chromadb


def load_documents(): 
    loader = DocumentLoader("../notes", glob="*.md")
    documents = loader.load()
    return documents

def split_text(documents): 
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=500,
        length_function=len,
        add_start_index=True
    )
    chunks = text_splitter.split_documents(documents)
    return chunks 

def save_to_chroma(chunks, path): 
    db = Chroma.from_documents(
        chunks, OpenAIEmbeddings(), persist_directory=path
    )
    db.persist()
    print(f"Saved {len(chunks)} chunks to {path}")

def query(query_text, path): 
    embedding_function = OpenAIEmbeddings()
    db = Chroma(persist_directory=path, embedding_function=embedding_function)
    results = db.similarity_search_with_relevance_scores(query_text, k=3)

    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    return context_text
