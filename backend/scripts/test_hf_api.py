import os
import sys
from dotenv import load_dotenv

# Add backend directory to sys.path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from huggingface_hub import InferenceClient

def main():
    api_key = os.getenv("HF_API_TOKEN")
    if not api_key:
        print("❌ Error: HF_API_TOKEN is not set in the environment.")
        return

    print("=== Hugging Face API Connectivity Test ===\n")
    
    # Initialize client
    client = InferenceClient(api_key=api_key)
    
    test_model = "Qwen/Qwen2.5-7B-Instruct"
    print(f"[1] Testing text generation with model: {test_model}...")
    
    try:
        messages = [{"role": "user", "content": "Reply with exactly the words 'HUGGING FACE SUCCESS' and nothing else."}]
        response = client.chat_completion(
            messages=messages,
            model=test_model,
            max_tokens=10
        )
        print(f"✅ Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ Generation failed: {e}")

if __name__ == "__main__":
    main()
