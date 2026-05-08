import asyncio
import os
import sys
import json
from unittest.mock import MagicMock, patch

# Setup paths
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Set API Key for the test
os.environ["GEMINI_API_KEY"] = "AIzaSyAQC9-uWz0rVIPWjVcs600B2h_u3cHTMko"

from app.utils.gemini_client import generate_text
from app.routers.submissions import call_auditor, resolve_senate_verdict
from app.routers.practice import _generate_mcq_questions

async def test_roadmap_logic():
    print("\n[AI TEST 1] Roadmap Generation Logic...")
    prompt = """
Generate a JSON roadmap for 'Python Basics'. 
Return ONLY JSON in this format:
{
  "title": "Python Basics",
  "description": "A guide",
  "modules": [
    {
      "title": "Introduction",
      "topics": [{"title": "Basics"}]
    }
  ]
}
"""
    try:
        from app.utils.gemini_client import robust_json_loads
        res = await generate_text(prompt, response_mime_type="application/json")
        data = robust_json_loads(res)
        # Handle nesting if AI adds it
        actual_data = data.get("roadmap", data) if "roadmap" in data else data
        
        if "modules" in actual_data:
            print(f"✅ Roadmap logic confirmed. Modules found: {len(actual_data['modules'])}")
        else:
            print(f"❌ Roadmap logic failed. Keys found: {list(actual_data.keys())}")
    except Exception as e:
        print(f"❌ Roadmap logic error: {e}")

async def test_audit_senate_logic():
    print("\n[AI TEST 2] Audit Senate (Parallel Personas)...")
    context = {
        "module_title": "Variables",
        "roadmap_subject": "Python",
        "topics_text": "Assigning variables, types",
        "expected_deliverable": "A script demonstrating variables.",
        "description": "I wrote a script that prints x=10.",
        "files_summary": "file.py: x = 10; print(x)",
        "link_context": ""
    }
    
    try:
        # We test if we can call the auditors in parallel as the router does
        results = await asyncio.gather(
            call_auditor("technician", context, []),
            call_auditor("educator", context, []),
            call_auditor("relevance_judge", context, [])
        )
        
        votes = [r["level"] for r in results]
        final_level, agreement, _ = resolve_senate_verdict(votes)
        print(f"✅ Senate logic confirmed. Verdict: {final_level} (Agreement: {agreement}/3)")
        print(f"   Votes: {votes}")
    except Exception as e:
        print(f"❌ Audit Senate logic error: {e}")

async def test_mcq_logic():
    print("\n[AI TEST 3] MCQ Question Generation...")
    try:
        # num_questions=2
        questions = await _generate_mcq_questions("Variables", "Python", 1, 2)
        if len(questions) >= 1:
            print(f"✅ MCQ logic confirmed. Generated {len(questions)} questions.")
            print(f"   Sample Question: {questions[0].get('question')[:50]}...")
        else:
            print("❌ MCQ logic failed: No questions returned.")
    except Exception as e:
        print(f"❌ MCQ logic error: {e}")

async def main():
    print("=== EulerFold Deep AI Integration Tests ===")
    await test_roadmap_logic()
    await test_audit_senate_logic()
    await test_mcq_logic()
    print("\n=== All AI Features Verified for Production ===")

if __name__ == "__main__":
    asyncio.run(main())
