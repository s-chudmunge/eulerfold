import os
import sys
import httpx
import asyncio
from dotenv import load_dotenv

# Load .env variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

async def test_cohere():
    api_key = os.getenv("COHERE_API_KEY")
    if not api_key:
        print("❌ Error: COHERE_API_KEY is not set.")
        return

    print("=== COHERE API TEST ===")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        # 1. Fetch Models
        print("[1] Fetching Cohere models...")
        test_model = "command-a-03-2025"
        try:
            response = await client.get("https://api.cohere.com/v1/models", headers=headers, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            models = [m.get("name") for m in data.get("models", [])]
            if models:
                print(f"✅ Found {len(models)} models. First 10: {', '.join(models[:10])}")
            else:
                print("❌ No models found.")
        except Exception as e:
            print(f"❌ Failed to fetch models: {e}")
            if hasattr(e, 'response') and e.response:
                print(e.response.text)

        # 2. Test Generation
        print(f"\n[2] Testing generation with Cohere ({test_model})...")
        payload = {
            "model": test_model,
            "message": "Reply with exactly the words 'COHERE SUCCESS' and nothing else.",
            "temperature": 0.1
        }
        try:
            response = await client.post("https://api.cohere.com/v1/chat", headers=headers, json=payload, timeout=20.0)
            response.raise_for_status()
            data = response.json()
            print(f"✅ Response: {data.get('text', 'No text returned')}")
        except Exception as e:
            print(f"❌ Generation failed: {e}")
            if hasattr(e, 'response') and e.response:
                print(e.response.text)

async def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("\n❌ Error: GEMINI_API_KEY is not set.")
        return

    print("\n=== GEMINI API TEST ===")
    
    async with httpx.AsyncClient() as client:
        # 1. Fetch Models
        print("[1] Fetching Gemini models...")
        test_model = "gemini-2.5-flash"
        try:
            response = await client.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}", timeout=10.0)
            response.raise_for_status()
            data = response.json()
            models = [m.get("name").replace("models/", "") for m in data.get("models", [])]
            if models:
                print(f"✅ Found {len(models)} models. First 10: {', '.join(models[:10])}")
                if "gemini-2.5-flash" not in models and "gemini-1.5-flash" in models:
                    test_model = "gemini-1.5-flash"
            else:
                print("❌ No models found.")
        except Exception as e:
            print(f"❌ Failed to fetch models: {e}")
            if hasattr(e, 'response') and e.response:
                print(e.response.text)

        # 2. Test Generation
        print(f"\n[2] Testing generation with Gemini ({test_model})...")
        payload = {
            "contents": [{"parts": [{"text": "Reply with exactly the words 'GEMINI SUCCESS' and nothing else."}]}],
            "generationConfig": {"temperature": 0.1}
        }
        try:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{test_model}:generateContent?key={api_key}",
                json=payload, timeout=20.0
            )
            response.raise_for_status()
            data = response.json()
            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                print(f"✅ Response: {text.strip()}")
            except KeyError:
                print(f"❌ Could not parse text from response: {data}")
        except Exception as e:
            print(f"❌ Generation failed: {e}")
            if hasattr(e, 'response') and e.response:
                print(e.response.text)

async def main():
    await test_cohere()
    await test_gemini()

if __name__ == "__main__":
    asyncio.run(main())
