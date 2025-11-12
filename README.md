# SANDY-AI (Genkit Edition) - Phase 1

This is a research-grade, production-grade AI assistant built with a modern, scalable architecture. This first phase establishes a working text-based chat application with RAG memory.

## Architecture

- **Frontend**: Next.js (React)
- **Backend**: FastAPI (Python)
- **Orchestrator**: Google Genkit
- **Memory (RAG)**: ChromaDB

## Local "Production" Environment Setup

This setup uses WSL2 and Docker to create a professional, isolated development environment.

1.  **Install WSL2**:
    -   Open PowerShell as Administrator and run: `wsl --install`
    -   Restart your PC.
    -   Open the "Ubuntu" app from the Start Menu.

2.  **Install VS Code + WSL Extension**:
    -   Install Visual Studio Code.
    -   Install the "WSL" extension from the VS Code Marketplace.

3.  **Install Docker Desktop**:
    -   Install Docker Desktop for your operating system. Ensure it's configured to use the WSL2 backend.

4.  **Install Node.js (in WSL)**:
    -   Open your Ubuntu (WSL) terminal.
    -   Run the following commands:
        ```bash
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        ```

5.  **Install Python (in WSL)**:
    -   Open your Ubuntu (WSL) terminal.
    -   Run: `sudo apt-get install -y python3.10-venv`

## Project Setup & Launch

1.  **Clone the Repository**:
    -   `git clone <your-repo-url>`
    -   `cd SANDY-AI`

2.  **Set Up Environment Variables**:
    -   `cp .env.example .env`
    -   Edit the `.env` file and add your `GOOGLE_API_KEY`.

3.  **Set Up Backend**:
    -   `cd backend`
    -   `python3 -m venv .venv`
    -   `source .venv/bin/activate`
    -   `pip install -r requirements.txt`

4.  **Start ChromaDB Service**:
    -   From the **root** directory, start just the database service in the background:
        ```bash
        docker-compose up -d chroma
        ```
    -   **Important:** Wait about 10-15 seconds for the database to initialize before proceeding.

5.  **Load RAG Memory**:
    -   This is a crucial one-time step.
    -   Navigate to the `backend` directory and ensure your virtual environment is active (`source .venv/bin/activate`).
    -   Run the ingestion script:
        ```bash
        python -m core.rag
        ```

6.  **Launch the Full System**:
    -   Go back to the **root** directory of the project.
    -   Run the command to build and start the `api` and `frontend` services:
        ```bash
        docker-compose up --build
        ```

7.  **Access the Application**:
    -   Open your web browser to `http://localhost:3000`.

## How to Test

Once the application is running, try these queries in the chat interface:

-   "What is SAL AI?"
-   "Who is Sal?"
-   "What is SANDS?" (Should be corrected to SANDY)
-   "read the file sample.txt"

This will test the RAG memory and the custom Genkit tool.
