import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os

# Define the path to the knowledge base file
# This assumes the script is run from the 'backend' directory
KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'knowledge', 'sample.txt')
# This is the directory where ChromaDB will store its data.
# It's configured to be in the backend directory for simplicity.
PERSIST_DIRECTORY = os.path.join(os.path.dirname(__file__), '..', '.chroma')
COLLECTION_NAME = "sandy_knowledge"

def main():
    """
    Main function to initialize ChromaDB, load documents, and populate the vector store.
    """
    print("Starting RAG memory population process...")

    # 1. Initialize ChromaDB client
    # This setup connects to the ChromaDB running in Docker.
    # The host 'chroma' is the service name defined in docker-compose.yml.
    # The port 8000 is the port ChromaDB listens on inside the Docker network.
    try:
        client = chromadb.HttpClient(host='localhost', port=8001)
        print("Successfully connected to ChromaDB service.")
    except Exception as e:
        print(f"Error connecting to ChromaDB: {e}")
        print("Please ensure the ChromaDB container is running. Run 'docker-compose up -d chroma' if needed.")
        return

    # 2. Get or create the collection
    # A collection in ChromaDB is like a table in a relational database.
    collection = client.get_or_create_collection(name=COLLECTION_NAME)
    print(f"Collection '{COLLECTION_NAME}' ready.")

    # 3. Load the document
    try:
        with open(KNOWLEDGE_BASE_PATH, 'r') as f:
            text = f.read()
        print(f"Successfully loaded knowledge base from '{KNOWLEDGE_BASE_PATH}'.")
    except FileNotFoundError:
        print(f"Error: Knowledge base file not found at '{KNOWLEDGE_BASE_PATH}'.")
        return

    # 4. Split the document into chunks
    # Large documents are split into smaller chunks for more effective embedding and retrieval.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
    )
    chunks = text_splitter.split_text(text)
    print(f"Split document into {len(chunks)} chunks.")

    # 5. Add documents to the collection
    # Each chunk is added to ChromaDB. ChromaDB will automatically handle
    # the process of converting the text to embeddings using its default model.
    # We assign a unique ID to each chunk.
    try:
        collection.add(
            documents=chunks,
            ids=[f"id_{i}" for i in range(len(chunks))]
        )
        print("Successfully added document chunks to the ChromaDB collection.")
        print("\nRAG memory population complete!")
        print(f"Total documents in collection: {collection.count()}")

    except Exception as e:
        print(f"An error occurred while adding documents to Chroma: {e}")

if __name__ == "__main__":
    main()
