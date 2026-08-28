import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("GROQ_API_KEY not found in .env")
    exit(1)

headers = {
    "Authorization": f"Bearer {api_key}"
}

try:
    response = requests.get("https://api.groq.com/openai/v1/models", headers=headers)
    response.raise_for_status()
    models = response.json().get("data", [])
    print("Available Groq Models:")
    for m in models:
        print(f" - {m['id']}")
except Exception as e:
    print(f"Failed to fetch Groq models: {e}")
