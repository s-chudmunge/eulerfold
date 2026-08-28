import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

api_key = os.getenv("GROQ_API_KEY")
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "openai/gpt-oss-120b",
    "messages": [{"role": "user", "content": "What is 2+2? Answer in one word."}]
}

print("Testing Groq model: openai/gpt-oss-120b...")
try:
    response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
    response.raise_for_status()
    print("SUCCESS! Output:")
    print(response.json()['choices'][0]['message']['content'])
except Exception as e:
    print(f"FAILED: {e}")
    if hasattr(response, 'text'):
        print(response.text)
