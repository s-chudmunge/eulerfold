import requests
import os
import time
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    print("Error: OPENROUTER_API_KEY not found in .env")
    exit(1)

def check_models():
    print("Fetching available models from OpenRouter...")
    models = []
    try:
        response = requests.get("https://openrouter.ai/api/v1/models")
        response.raise_for_status()
        data = response.json()
        models = [m["id"] for m in data["data"]]
    except Exception as e:
        print(f"Error listing models: {e}")
        return

    print(f"Found {len(models)} models. Testing a few common ones...\n")
    
    results = []
    
    # Filter to only test some common ones to avoid massive test
    common_models = [
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-3-5-haiku",
        "meta-llama/llama-3.3-70b-instruct",
        "openai/gpt-4o-mini",
        "google/gemini-2.5-flash"
    ]
    models = [m for m in models if m in common_models]

    print(f"{'Model Name':<40} | {'Status':<10} | {'Time (s)':<10}")
    print("-" * 65)

    for model_name in models:
        # Skip some models that are known to be restricted or specialty
        if "vision" in model_name or "embedding" in model_name or "aqa" in model_name:
            continue
            
        start_time = time.time()
        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": model_name,
                "messages": [{"role": "user", "content": "Say hello in one word"}],
                "max_tokens": 5
            }
            res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=10)
            res.raise_for_status()
            data = res.json()
            elapsed = time.time() - start_time
            
            if "choices" in data and data["choices"]:
                status = "Success"
                results.append({"name": model_name, "time": elapsed, "status": status})
            else:
                status = "Empty"
                results.append({"name": model_name, "time": elapsed, "status": status})
        except Exception as e:
            elapsed = time.time() - start_time
            status = "Failed"
            results.append({"name": model_name, "time": elapsed, "status": status})
        
        print(f"{model_name:<40} | {status:<10} | {elapsed:<10.2f}")

    # Rank results
    successful_results = [r for r in results if r["status"] == "Success"]
    successful_results.sort(key=lambda x: x["time"])

    print("\n" + "=" * 40)
    if successful_results:
        recommended = successful_results[0]["name"]
        print(f"RECOMMENDED MODEL: {recommended}")
        print(f"Response time: {successful_results[0]['time']:.2f}s")
        print("=" * 40)
        return recommended
    else:
        print("No models succeeded the test.")
        print("=" * 40)
        return None

if __name__ == "__main__":
    check_models()
