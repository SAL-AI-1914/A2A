from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from genkit import stream, run
from core import flows
from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI app
app = FastAPI(
    title="SANDY AI Backend",
    description="This API exposes the Genkit flows for the SANDY AI assistant.",
    version="1.0.0"
)

# Configure CORS (Cross-Origin Resource Sharing)
# This is essential to allow the frontend (running on localhost:3000)
# to communicate with the backend (running on localhost:8000).
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# Define the data model for the request body of the /chat endpoint.
# This ensures that any request to this endpoint has a 'message' field of type string.
class ChatRequest(BaseModel):
    message: str

# Define the main endpoint for the chat functionality
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    This endpoint receives a user's message and invokes the main Genkit orchestrator flow.
    """
    print(f"Received message: {request.message}")

    # Run the Genkit flow with the user's message as input.
    # The `run` function executes the flow and waits for the result.
    result = run(flows.sandy_orchestrator, request.message)

    # Return the result from the flow as a JSON response.
    return {"response": result}

# A simple root endpoint to confirm the API is running.
@app.get("/")
def read_root():
    return {"message": "SANDY AI Backend is running."}

# WebSocket endpoint for streaming chat
@app.websocket("/api/chat/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Wait for a message from the client
            message = await websocket.receive_text()
            print(f"Received message via WebSocket: {message}")

            # Start streaming the response from the Genkit flow
            response_stream = stream(flows.sandy_orchestrator_stream, message)

            # Send each chunk of the response to the client
            for chunk in response_stream:
                await websocket.send_text(chunk)

    except WebSocketDisconnect:
        print("Client disconnected from WebSocket.")
    except Exception as e:
        print(f"An error occurred in the WebSocket: {e}")
        await websocket.close(code=1011)
