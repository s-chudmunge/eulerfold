import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.ai_client import (
    _call_openrouter,
    _call_groq,
    _call_cohere,
    _call_gemini,
    _call_huggingface,
    get_fastest_free_openrouter_model
)

async def test_providers():
    prompt = "Reply with exactly one word: Hello"
    response_mime_type = "text/plain"
    
    print("Testing OpenRouter...")
    try:
        model = await get_fastest_free_openrouter_model()
        text, usage, model_name = await _call_openrouter(prompt, model, response_mime_type)
        print(f"  Success! Model: {model_name}")
        print(f"  Usage: {usage}")
    except Exception as e:
        print(f"  OpenRouter failed: {e}")

    print("\nTesting Groq...")
    try:
        text, usage, model_name = await _call_groq(prompt, "llama-3.1-8b-instant", response_mime_type)
        print(f"  Success! Model: {model_name}")
        print(f"  Usage: {usage}")
    except Exception as e:
        print(f"  Groq failed: {e}")

    print("\nTesting Cohere...")
    try:
        text, usage, model_name = await _call_cohere(prompt, response_mime_type)
        print(f"  Success! Model: {model_name}")
        print(f"  Usage: {usage}")
    except Exception as e:
        print(f"  Cohere failed: {e}")

    print("\nTesting Gemini...")
    try:
        text, usage, model_name = await _call_gemini(prompt, response_mime_type)
        print(f"  Success! Model: {model_name}")
        print(f"  Usage: {usage}")
    except Exception as e:
        print(f"  Gemini failed: {e}")

    print("\nTesting Hugging Face...")
    try:
        text, usage, model_name = await _call_huggingface(prompt, response_mime_type)
        print(f"  Success! Model: {model_name}")
        print(f"  Usage: {usage}")
    except Exception as e:
        print(f"  Hugging Face failed: {e}")

if __name__ == "__main__":
    load_dotenv()
    asyncio.run(test_providers())
