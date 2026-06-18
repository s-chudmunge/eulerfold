import asyncio
import json
import os
import re
import uuid
import time
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv
import httpx

# Load environment variables
load_dotenv("backend/.env")

# Supabase Config
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# OpenRouter Config
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
MODEL_NAME = "anthropic/claude-3-5-haiku" # High speed for seeding

# System User Config
SYSTEM_EMAIL = "eulerfold@gmail.com"
SYSTEM_USERNAME = "eulerfold"

# Roadmap Proposals
OFFICIAL_ROADMAPS = [
    {
        "subject": "High-Scale Distributed Systems",
        "goal": "Design systems that handle 1M+ RPS using Microservices.",
        "time_value": 6,
        "category": "System Design"
    }
]

def clean_json_string(text: str) -> str:
    match = re.search(r"([\[\{].*[\]\}])", text, re.DOTALL)
    if match:
        text = match.group(1)
    text = re.sub(r'^```json\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'```$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^```\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r',\s*([\]\}])', r'\1', text)
    return text.strip()

def generate_slug(title: str):
    base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    return f"{base}-{uuid.uuid4().hex[:6]}"

async def generate_and_seed(roadmap_meta):
    subject = roadmap_meta["subject"]
    goal = roadmap_meta["goal"]
    duration = roadmap_meta["time_value"]
    
    print(f"\n🚀 Generating: {subject}...")
    
    prompt = f"""
You are an expert curriculum designer. Your task is to generate a structured learning roadmap in a specific JSON format.
Output JSON ONLY. Adhere to the schema exactly.

Schema:
{{
  "title": "string",
  "description": "string",
  "depth_score": number,
  "roadmap_plan": {{
    "modules": [
      {{
        "title": "string",
        "outcome": "string",
        "timeline": "string",
        "proof_of_work_instructions": {{
          "what_to_build": "string",
          "what_counts_as_evidence": "string",
          "eval_criteria": ["string", "string"]
        }},
        "topics": [
          {{
            "title": "string",
            "subtopics": [ {{ "title": "string" }} ]
          }}
        ],
        "resources": [
          {{ "title": "string", "url": "string", "type": "video|docs|article" }}
        ]
      }}
    ]
  }}
}}

Details:
- Subject: "{subject}"
- Goal: "{goal}"
- Target Duration: {duration} weeks

Resource Instructions:
- Include 2-3 real, high-quality URLs for each module.
- Outcomes must start with "By the end of this module you will be able to...".

Begin JSON output:
"""

    try:
        if not OPENROUTER_API_KEY:
            raise RuntimeError("OPENROUTER_API_KEY not found in environment.")

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": MODEL_NAME,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=180.0
            )
            response.raise_for_status()
            data = response.json()

        if "choices" not in data or not data["choices"]:
            print(f"❌ Failed to get response for {subject}")
            return

        response_text = data["choices"][0]["message"]["content"]
        cleaned_text = clean_json_string(response_text)
        data = json.loads(cleaned_text)
        
        # Add metadata for DB
        title = data.get("title", subject)
        slug = generate_slug(title)
        
        insert_data = {
            "title": title,
            "slug": slug,
            "description": data.get("description", ""),
            "depth_score": data.get("depth_score", 1.0),
            "roadmap_plan": data["roadmap_plan"],
            "subject": subject,
            "goal": goal,
            "time_value": duration,
            "time_unit": "weeks",
            "model": MODEL_NAME,
            "email": SYSTEM_EMAIL,
            "is_public": True,
            "show_author": True
        }
        
        res = sb.table("roadmaps").insert(insert_data).execute()
        
        if res.data:
            print(f"✅ Successfully seeded: {title}")
            print(f"🔗 Slug: {slug}")
        else:
            print(f"❌ DB Insert failed for {subject}")

    except Exception as e:
        print(f"❌ Error seeding {subject}: {e}")

async def main():
    for i, roadmap in enumerate(OFFICIAL_ROADMAPS):
        await generate_and_seed(roadmap)
        
        if i < len(OFFICIAL_ROADMAPS) - 1:
            print("\n⏳ Sleeping for 2 minutes to prevent system hang...")
            await asyncio.sleep(120)

if __name__ == "__main__":
    asyncio.run(main())
