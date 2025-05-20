from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import FAISS
from langchain.chains.retrieval_qa.base import RetrievalQA
import openai 
from dotenv import load_dotenv
import os
import shutil

load_dotenv()
openai.api_key = os.environ['OPENAI_API_KEY']

FAISS_PATH = "faiss"
data_path = '../notes'

def cleanup_vector_db(path='faiss'):
    """Clean up the existing vector database directory if it exists."""
    if os.path.exists(path):
        try:
            shutil.rmtree(path)
            print(f"Successfully cleaned up existing vector database at {path}")
        except Exception as e:
            print(f"Error cleaning up vector database: {e}")
            raise
    else:
        print(f"No existing vector database found at {path}")

def main(): 
    # Clean up existing vector database
    cleanup_vector_db(FAISS_PATH)
    
    documents = load_directory()
    chunks = split_text(documents)
    save_to_faiss(chunks, FAISS_PATH)

    query_text = input("Enter a question: ")
    response = query_documents(query_text, FAISS_PATH)
    print(response)

def load_directory(): 
    loader = DirectoryLoader("../notes", glob="*.md")
    documents = loader.load()
    return documents

def load_file(filename): 
    loader = TextLoader(filename)
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

def save_to_faiss(chunks, path): 
    embeddings = OpenAIEmbeddings()
    db = FAISS.from_documents(
        chunks,
        embeddings
    )
    print(f"Saved {len(chunks)} chunks to {path}")
    db.save_local(path)

def query_documents(query_text, path): 
    db = FAISS.load_local(path, embeddings=OpenAIEmbeddings(), allow_dangerous_deserialization=True)

    context_text = db.similarity_search(query_text, k=3)
    docs_scores = db.similarity_search_with_relevance_scores(query_text, k=3)
    
    retriever = db.as_retriever()   
    
    PROMPT = """Answer the question based only on the following context:
    {context}

    ---    
    Answer this question based on the above context: {question}
    """
    prompt_template = ChatPromptTemplate.from_template(PROMPT)
    prompt = prompt_template.format(context=context_text, question=query_text)
    
    chain = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(),
        chain_type="stuff",
        retriever=retriever
    )
    response = chain.invoke({"query": query_text})

    return response['result']


if __name__ == "__main__": 
    main()

