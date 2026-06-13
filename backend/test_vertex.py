import os
from dotenv import load_dotenv
import asyncio

# Load the .env file explicitly
load_dotenv()

# Set up logging to see debug messages
import logging
logging.basicConfig(level=logging.INFO)

from app.utils.gemini_client import get_vertex_client, generate_text

async def test_vertex():
    print("Checking VERTEX_CREDENTIALS_JSON in env...")
    creds = os.getenv("VERTEX_CREDENTIALS_JSON")
    if creds:
        print(f"Found credentials! Length: {len(creds)} chars")
    else:
        print("VERTEX_CREDENTIALS_JSON not found in environment!")
        return

    print("Initializing Vertex client...")
    client = get_vertex_client()
    if client is None:
        print("Failed to initialize Vertex client.")
        return
        
    print("Vertex client successfully initialized!")
    print("Testing generate_text using Vertex AI...")
    try:
        response = await generate_text("Say 'Hello Vertex AI' exactly.", model="gemini-2.5-flash")
        print(f"Response: {response}")
    except Exception as e:
        print(f"Error during generation: {e}")

if __name__ == "__main__":
    asyncio.run(test_vertex())
