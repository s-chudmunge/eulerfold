import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock settings before importing app
os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY", "")

from app.utils.gemini_client import generate_text, robust_json_loads

async def verify_ai():
    print("=== EulerFold AI Core Verification (New SDK) ===")
    
    # Test 1: Simple Generation
    print("\n[TEST 1] Testing basic text generation...")
    try:
        response = await generate_text("Say 'Infrastructure Verified' if you can read this.")
        print(f"Response: {response.strip()}")
        if "Verified" in response:
            print("✅ Basic AI generation works.")
        else:
            print("❌ AI returned unexpected content.")
    except Exception as e:
        print(f"❌ Basic AI generation failed: {e}")

    # Test 2: JSON Formatting & Parsing
    print("\n[TEST 2] Testing JSON generation and parsing...")
    prompt = "Generate a JSON object with a 'status' field set to 'stable' and a 'score' field set to 100. Return ONLY the JSON."
    try:
        response = await generate_text(prompt, response_mime_type="application/json")
        print(f"Raw Response: {response.strip()}")
        parsed = robust_json_loads(response)
        if parsed.get("status") == "stable" and parsed.get("score") == 100:
            print("✅ JSON generation and robust parsing work.")
        else:
            print(f"❌ JSON parsing failed or data incorrect: {parsed}")
    except Exception as e:
        print(f"❌ JSON generation/parsing failed: {e}")

    print("\n=== Verification Complete ===")

if __name__ == "__main__":
    asyncio.run(verify_ai())
