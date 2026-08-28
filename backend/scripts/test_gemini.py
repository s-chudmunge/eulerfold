import os
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    for m in data['models']:
        if 'embed' in m['name'].lower():
            print(m['name'], m.get('supportedGenerationMethods', []))
