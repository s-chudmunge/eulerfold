import asyncio
import json
import uuid
import os
import sys
import logging

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv(".env")

from app.core.supabase_client import get_supabase_client
from app.utils.ai_client import generate_text, robust_json_loads
from app.routers.roadmaps import _generate_unique_slug, _generate_plan_hash
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    sb = get_supabase_client()
    email = "eulerfold@gmail.com"
    
    with open("/home/sankalp/.gemini/antigravity-cli/brain/b970e6e8-66fe-458c-a120-99705566584c/raft_syllabus.md", "r") as f:
        syllabus_text = f.read()

    time_value = 4
    time_unit = "weeks"

    prompt = f"""
You are an instructional designer.
I will provide you with a static course syllabus or table of contents.
Translate this exactly into our interactive {time_value} {time_unit} course JSON schema.
Do not change the core subjects taught, but enrich them with practical "proof_of_work" tasks.

**SYLLABUS TEXT:**
{syllabus_text}

**RULES:**
1. **Engaging Title:** The "title" must be catchy, SEO-friendly, and natural. Do NOT use dry, robotic formats like "Intensive 4-Week X Mastery Course". Do NOT include the time duration in the title. Do NOT use buzzwords like "Mastery", "High-Performance", "Bootcamp", or "Journey".
2. **SEO-Friendly Description:** The "description" must be a single, punchy, search-engine-friendly sentence similar to the title.
3. **Technical Rigor:** Focus on depth and verifiable technical skills.
4. **Specific Topics:** Each module must have 3-5 specific topics using industry-standard terms.
5. **Practical Outcomes:** The `proof_of_work_instructions` must describe a realistic technical task that demonstrates competency.
6. **Conciseness:** Course description must be max 2 sentences. Each module 'outcome' must be max 1 sentence.
7. **Output JSON ONLY** matching this schema:
   {{
     "title": "string",
     "description": "string",
     "modules": [
       {{
         "title": "string",
         "outcome": "string",
         "timeline": "string",
         "workspace_type": "code|research|design",
         "proof_of_work_instructions": {{
            "what_to_build": "string",
            "what_counts_as_evidence": "string",
            "eval_criteria": ["string", "string"]
         }},
         "optimal_search_query": "string",
         "topics": [
           {{
              "title": "string",
              "youtube_search_query": "string",
              "subtopics": [ {{ "title": "string" }} ]
            }}
         ]
       }}
     ]
   }}
"""
    logger.info("Calling AI to parse syllabus...")
    model_to_use = settings.DEFAULT_ROADMAP_MODEL
    
    # generate_text is from ai_client, we will not ask for usage to simplify unpacking
    try:
        generated_text = await generate_text(prompt, model=model_to_use, response_mime_type="application/json", return_usage=False)
    except ValueError as e: # Handle case where return_usage defaults or returns tuple anyway
        res = await generate_text(prompt, model=model_to_use, response_mime_type="application/json", return_usage=True)
        generated_text = res[0] if isinstance(res, tuple) else res
    
    if isinstance(generated_text, tuple):
        generated_text = generated_text[0]
        
    try:
        roadmap_plan = robust_json_loads(generated_text)
    except Exception as e:
        logger.warning(f"Failed to parse JSON on first try: {e}, retrying...")
        res = await generate_text(prompt, model=model_to_use, response_mime_type="application/json", return_usage=True)
        generated_text = res[0] if isinstance(res, tuple) else res
        roadmap_plan = robust_json_loads(generated_text)

    logger.info(f"AI returned roadmap with {len(roadmap_plan.get('modules', []))} modules.")

    for i, module in enumerate(roadmap_plan.get("modules", [])):
        module["id"] = f"module_{i+1}"
        if not module.get("outcome"):
             module["outcome"] = "By the end of this module you will be able to apply the listed topics and solve basic related problems."
        for t_idx, topic in enumerate(module.get("topics", [])):
            topic["id"] = f"topic_{i+1}_{t_idx+1}"
            topic["uuid"] = str(uuid.uuid4())
            for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                if isinstance(subtopic, dict):
                    subtopic["id"] = str(uuid.uuid4())

    slug = await _generate_unique_slug(roadmap_plan["title"], email, sb)
    
    db_data = {
        "title": roadmap_plan["title"],
        "description": roadmap_plan["description"],
        "roadmap_plan": roadmap_plan,
        "subject": "Distributed Systems",
        "goal": "Implement Raft Consensus from Scratch",
        "time_value": time_value,
        "time_unit": time_unit,
        "model": model_to_use,
        "email": email,
        "slug": slug,
        "status": "active",
        "version": 1,
        "snapshot_hash": _generate_plan_hash(roadmap_plan),
        "is_public": True,
        "show_author": True
    }
    
    logger.info("Saving to Supabase...")
    response = sb.table("roadmaps").insert(db_data).execute()
    if not response.data:
        logger.error("Failed to save roadmap")
    else:
        logger.info(f"Successfully saved public roadmap '{roadmap_plan['title']}' with id {response.data[0]['id']}")

if __name__ == "__main__":
    asyncio.run(main())
