import os
import sys
import httpx
import asyncio
from dotenv import load_dotenv

# Load .env variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

async def main():
    api_key = os.getenv("AIMLAPI_API_KEY")
    if not api_key:
        print("❌ Error: AIMLAPI_API_KEY is not set in the environment.")
        return

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    base_url = "https://api.aimlapi.com/v1"
    
    print("=== AIMLAPI Connectivity Test ===\n")

    async with httpx.AsyncClient() as client:
        # 1. Test Models Endpoint
        print("[1] Fetching available models...")
        try:
            response = await client.get(f"{base_url}/models", headers=headers, timeout=10.0)
            response.raise_for_status()
            models_data = response.json()
            
            # The API usually returns {"data": [{"id": "..."}, ...]} or a list directly
            data = models_data.get("data", [])
            model_ids = [m.get("id") for m in data if "id" in m]
            
            if model_ids:
                print(f"✅ Found {len(model_ids)} models. Here are the first 10:")
                for m_id in model_ids[:10]:
                    print(f"   - {m_id}")
                    
                # Pick a fast popular model for testing, fallback to the first one if not found
                test_model = "gpt-4o-mini" if "gpt-4o-mini" in model_ids else model_ids[0]
            else:
                print("❌ No models found in the expected format.")
                print("Raw response:", models_data)
                return
        except Exception as e:
            print(f"❌ Failed to fetch models: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Details: {e.response.text}")
            return

        # 2. Test Text Generation
        print(f"\n[2] Testing text generation with model: {test_model}...")
        prompt = "Reply with exactly the words 'AIMLAPI SUCCESS' and nothing else."
        
        payload = {
            "model": test_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 10
        }
        
        try:
            response = await client.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=20.0
            )
            response.raise_for_status()
            data = response.json()
            
            if "choices" in data and len(data["choices"]) > 0:
                print(f"✅ Response: {data['choices'][0]['message']['content']}")
            else:
                print("❌ Generation failed. Unexpected format:")
                print(data)
                
        except Exception as e:
            print(f"❌ Generation failed: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Details: {e.response.text}")

    print("\n=== Test Complete ===")

if __name__ == "__main__":
    asyncio.run(main())
