from genkit import define_tool
import os

@define_tool(
    name="readFile",
    description="Reads the content of a specified file. The path should be relative to the 'backend/data' directory."
)
def read_file(filepath: str) -> str:
    """
    Reads a file from the 'backend/data' directory and returns its content.
    """
    # Security: Prevent directory traversal attacks
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data'))
    target_path = os.path.abspath(os.path.join(base_path, filepath))

    if not target_path.startswith(base_path):
        return "Error: Access denied. Path is outside the allowed directory."

    try:
        with open(target_path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        return f"Error: File not found at '{filepath}'."
    except Exception as e:
        return f"An error occurred: {e}"
