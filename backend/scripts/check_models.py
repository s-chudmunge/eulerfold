import google.generativeai as genai
import os
import time
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

def check_models():
    print("Fetching available models...")
    models = []
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                models.append(m.name)
    except Exception as e:
        print(f"Error listing models: {e}")
        return

    print(f"Found {len(models)} models supporting generateContent. Testing now...\n")
    
    results = []
    
    # Sort models to prioritize common ones
    common_prefixes = ["models/gemini-2.0", "models/gemini-1.5"]
    models.sort(key=lambda x: any(x.startswith(p) for p in common_prefixes), reverse=True)

    print(f"{'Model Name':<40} | {'Status':<10} | {'Time (s)':<10}")
    print("-" * 65)

    for model_name in models:
        # Skip some models that are known to be restricted or specialty
        if "vision" in model_name or "embedding" in model_name or "aqa" in model_name:
            continue
            
        start_time = time.time()
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say hello in one word", generation_config={"max_output_tokens": 5})
            elapsed = time.time() - start_time
            
            if response and response.text:
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
