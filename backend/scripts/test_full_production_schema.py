import json
import time
import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure we can import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.utils.gemini_client import generate_text, clean_json_string

async def test_full_production_generation(model_name, label):
    print(f"\n🚀 Testing FULL PRODUCTION SCHEMA: {label} ({model_name})...")
    
    # This is the exact prompt structure from roadmaps.py
    prompt = """
    You are an expert curriculum designer. Generate a 1-week learning roadmap for 'React Native'.
    Output JSON ONLY. Adhere to this exact schema:
    {
      "title": "string",
      "description": "string",
      "depth_score": number,
      "roadmap_plan": {
        "modules": [
          {
            "title": "string",
            "outcome": "string",
            "timeline": "string",
            "proof_of_work_instructions": {
              "what_to_build": "string",
              "what_counts_as_evidence": "string",
              "eval_criteria": ["string", "string"]
            },
            "topics": [
              {
                "title": "string",
                "subtopics": [{ "title": "string" }]
              }
            ],
            "resources": [
              { "title": "string", "url": "string", "type": "video|docs|article" }
            ]
          }
        ]
      }
    }
    """
    
    start_time = time.time()
    try:
        raw_text = await generate_text(prompt, model=model_name, response_mime_type="application/json")
        elapsed = time.time() - start_time
        
        cleaned = clean_json_string(raw_text)
        data = json.loads(cleaned)
        
        # Validation Checks
        required_root = ["title", "description", "depth_score", "roadmap_plan"]
        missing_root = [f for f in required_root if f not in data]
        
        modules = data.get("roadmap_plan", {}).get("modules", [])
        has_pow = all("proof_of_work_instructions" in m for m in modules) if modules else False
        
        if not missing_root and has_pow:
            print(f"✅ SUCCESS: Full schema validated in {elapsed:.2f}s")
            print(f"📊 Depth Score: {data.get('depth_score')}")
            print("\n📄 FULL JSON OUTPUT:")
            print("-" * 40)
            print(json.dumps(data, indent=2))
            print("-" * 40)
        else:
            print(f"⚠️ SCHEMA INCOMPLETE")
            if missing_root: print(f"❌ Missing Root Fields: {missing_root}")
            if not has_pow: print(f"❌ Missing Proof of Work instructions")
            
        return True
    except Exception as e:
        print(f"❌ FAILED: {str(e)[:200]}")
        return False

async def main():
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
    print("🧪 Full-Scale Production Schema Verification")
    print("============================================")
    
    await test_full_production_generation("models/gemini-2.5-flash", "Free Tier")
    await test_full_production_generation("models/gemini-2.5-pro", "Paid Tier")
    
    print("\n============================================")

if __name__ == "__main__":
    asyncio.run(main())
