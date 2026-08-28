import os
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={GEMINI_API_KEY}"
payload = json.dumps({
    "model": "models/gemini-embedding-2",
    "content": {
        "parts": [{"text": "Hello"}]
    },
    "outputDimensionality": 768
}).encode('utf-8')

req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print("Dims:", len(result['embedding']['values']))
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode())
