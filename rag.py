from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv

load_dotenv()

# Load and process documents
loader = TextLoader("my_notes.md")
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", " ", ""]  # Updated default separators
)
chunks = text_splitter.split_documents(docs)

# Create vector store
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(chunks, embeddings)

# Create retriever with search configuration
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# Create chat model
llm = ChatOpenAI(model="gpt-3.5-turbo-0125")

# Create conversation chain using LCEL (LangChain Expression Language)
contextualize_q_prompt = ChatPromptTemplate.from_messages([
    ("system", """Given a chat history and the latest user question, \
    which might reference context in the chat history, formulate a standalone question \
    which can be understood without the chat history. Return just the standalone question."""),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
])

# Create chains
history_aware_retriever = create_history_aware_retriever(
    llm,
    retriever,
    contextualize_q_prompt
)

qa_prompt = ChatPromptTemplate.from_messages([
    ("system", """Answer the question based only on the following context:
    {context}
    
    Answer in a helpful, conversational tone. If you don't know the answer, say you don't know."""),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
])

question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

# Initialize chat history
chat_history = []

# Query the chain
question = "What did I say about apples?"
response = rag_chain.invoke({
    "input": question,
    "chat_history": chat_history
})

# Update chat history
chat_history.extend([
    HumanMessage(content=question),
    AIMessage(content=response["answer"])
])

print(response["answer"])