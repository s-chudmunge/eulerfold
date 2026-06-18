import asyncio
import sys
import os

# Add backend directory to sys.path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utils.ai_client import _call_groq

async def main():
    print("=== EulerFold AI Groq Direct Test ===")
    
    prompt = "Write a haiku about a robot writing code."
    model = "llama-3.1-8b-instant"
    print(f"\n[1] Testing Groq API Directly (Model: {model})")
    print(f"Prompt: {prompt}\n")
    
    try:
        response = await _call_groq(prompt, model, None)
        print(f"✅ Groq Response:\n{response}")
    except Exception as e:
        print(f"❌ Groq generation failed: {e}")
        
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    asyncio.run(main())
