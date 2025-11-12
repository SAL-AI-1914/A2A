import os
import genkit
from genkit import flow
from genkit.model import llm
from genkit.retriever import chroma
from genkit.retriever import define_retriever
from dotenv import load_dotenv
import google.generativeai as genai

# Import our custom tool
from core.tools.file_system import readFile

# Load environment variables from .env file
load_dotenv()

# Initialize Genkit and configure the Gemini model
# This uses the GOOGLE_API_KEY from your .env file
genkit.init()
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Define the model we'll be using.
# gemini_1_5_pro is a powerful, multi-modal model.
main_model = llm("google/gemini-1.5-pro-latest")

# Define our RAG retriever
# This tells Genkit how to connect to our ChromaDB instance to fetch relevant documents.
@define_retriever(name="sandy_knowledge_retriever")
async def sandy_knowledge_retriever(text: str):
    # This connects to the ChromaDB service running in Docker.
    # The host 'chroma' and port 8000 are used here.
    # Note: This is the internal Docker network address.
    client = chroma.Client(host='chroma', port=8000)

    # Retrieve the 3 most relevant document chunks for the user's query.
    results = await client.retrieve(
        "sandy_knowledge", # The collection name we defined in rag.py
        text,
        3 # Number of results to return
    )
    # Format the results in the way Genkit expects
    return [doc.text for doc in results]

# This is the main orchestrator flow for SANDY AI
@flow(name="sandyOrchestrator")
def sandy_orchestrator(user_query: str) -> str:
    """
    The main flow that orchestrates the AI's response.
    It uses RAG for knowledge retrieval and can use tools.
    """

    # This is the core prompt for the AI.
    # It instructs the AI on how to behave, its personality, and how to use the tools and context.
    prompt = f"""
    You are SANDY, an advanced AI assistant. Your creator is named Sal.
    Your personality is helpful, knowledgeable, and slightly formal.
    Always answer the user's query based on the provided context.
    If the context does not contain the answer, state that you do not have enough information.
    Do not make up answers.

    Query: {user_query}
    """

    # Run the model with the prompt, the RAG retriever, and the file system tool.
    # Genkit automatically handles fetching the RAG documents and making tools available to the model.
    response = main_model.generate(
        prompt,
        retrievers=[sandy_knowledge_retriever],
        tools=[readFile]
    )

    return response.text()

# This is the streaming version of the main orchestrator flow
@flow(name="sandyOrchestratorStream")
async def sandy_orchestrator_stream(user_query: str):
    """
    A streaming version of the main flow that yields response chunks.
    """
    prompt = f"""
    You are SANDY, an advanced AI assistant. Your creator is named Sal.
    Your personality is helpful, knowledgeable, and slightly formal.
    Always answer the user's query based on the provided context.
    If the context does not contain the answer, state that you do not have enough information.
    Do not make up answers.

    Query: {user_query}
    """

    # Use the `stream` method to get a stream of response chunks.
    stream = main_model.stream(
        prompt,
        retrievers=[sandy_knowledge_retriever],
        tools=[readFile]
    )

    # Yield each chunk of the response as it comes in.
    async for chunk in stream:
        yield chunk.text
