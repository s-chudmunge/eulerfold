import uuid
import logging
import asyncio
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks

from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.schemas import UrlRoadmapCreate, RoadmapRead, User
from app.utils.ai_client import generate_text, robust_json_loads, log_backend_ai_usage
from app.utils.youtube_client import search_youtube_videos
from app.core.auth import get_current_user
from app.routers.payments import check_and_revoke_pro_if_no_credits
from app.services.skills_service import extract_skills_from_roadmap
from app.database.monitor import monitor_query

# We need these helper functions from roadmaps.py
from app.routers.roadmaps import _generate_unique_slug, _generate_plan_hash

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/roadmaps/generate-from-url", response_model=RoadmapRead)
@monitor_query(query_type="generate_from_url", table="roadmaps")
async def generate_from_url(
    payload: UrlRoadmapCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Deconstruct a URL/Repo into a roadmap."""
    email = current_user.email
    uid = current_user.supabase_uid
    if not email:
        raise HTTPException(status_code=401, detail="Could not determine user email")

    sb = get_supabase_client()
    profile_res = sb.table("profiles").select("roadmap_credits, is_pro").eq("email", email).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    is_pro = profile_res.data[0].get("is_pro", False)
    
    if not is_pro:
        raise HTTPException(status_code=403, detail="Deconstruct from URL is a Pro feature.")

    credits = profile_res.data[0].get("roadmap_credits", 0)
    
    if credits < 1:
        if is_pro:
            raise HTTPException(status_code=402, detail="You have run out of roadmap credits.")
        else:
            raise HTTPException(status_code=402, detail="No roadmap credits left. Please upgrade to Pro.")

    # 1. Fetch URL Content
    try:
        from app.utils.doc_fetcher import fetch_rendered_webpage_text
        text_content, content_type = await fetch_rendered_webpage_text(payload.url)
        if not text_content or len(text_content.strip()) < 10:
            raise Exception("No readable text found at URL")
        text_content = text_content[:30000] # Safe limit for prompt context
    except Exception as e:
        logger.error(f"Failed to fetch URL {payload.url}: {e}")
        raise HTTPException(status_code=400, detail="Could not fetch or parse the provided URL.")

    # 2. Generate Roadmap
    diagnostic_text = f"\n**DIAGNOSTIC ASSESSMENT RESULTS:**\n{payload.diagnostic_prompt_context}" if payload.diagnostic_prompt_context else ""

    prompt = f"""
You are an expert instructional designer.
I will give you raw text content scraped from a URL.
Deconstruct this content and build a roadmap to master it.
Identify the core concepts and technologies required to fully understand or build what is described.
Generate a rigorous {payload.time_value} {payload.time_unit} learning course that starts from foundational prerequisites and culminates in mastering the content from this URL.

**CONTENT:**
{text_content}
{diagnostic_text}

**RULES:**
1. **Engaging Title:** The "title" must be catchy, SEO-friendly, and natural (e.g., "Understanding Backpropagation", "Fundamentals of React Hooks"). Do NOT use dry, robotic formats like "Intensive 4-Week X Mastery Course". Do NOT include the time duration in the title. Do NOT use buzzwords like "Mastery", "High-Performance", "Bootcamp", or "Journey".
2. **SEO-Friendly Description:** The "description" must be a single, punchy, search-engine-friendly sentence similar to the title.
2. **Technical Rigor:** Focus on depth and verifiable technical skills.
3. **Specific Topics:** Each module must have 3-5 specific topics using industry-standard terms.
4. **Practical Outcomes:** The `proof_of_work_instructions` must describe a realistic technical task that demonstrates competency.
5. **Conciseness:** Course description must be max 2 sentences. Each module 'outcome' must be max 1 sentence.
6. **Output JSON ONLY** matching this schema:
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
              "youtube_search_query": "Clean 3-5 word technical topic query for YouTube (e.g., 'Population Stability Index PSI', 'Kolmogorov Smirnov test'). DO NOT include university names like MIT or Stanford.",
              "subtopics": [ {{ "title": "string" }} ]
            }}
         ]
       }}
     ]
   }}
"""
    try:
        model_to_use = settings.DEFAULT_ROADMAP_MODEL
        generated_text, usage = await generate_text(prompt, model=model_to_use, response_mime_type="application/json", return_usage=True)
        log_backend_ai_usage(sb, uid, f"URL Deconstruction (Cost: 1.0 Credits)", usage, source="backend")
        roadmap_plan = robust_json_loads(generated_text)

        # Enrichment logic (IDs and YouTube)
        for i, module in enumerate(roadmap_plan.get("modules", [])):
            if not isinstance(module, dict): continue
            module["id"] = f"module_{i+1}"
            if not module.get("outcome"):
                 module["outcome"] = "By the end of this module you will be able to apply the listed topics and solve basic related problems."
            for t_idx, topic in enumerate(module.get("topics", [])):
                if not isinstance(topic, dict): continue
                topic["id"] = f"topic_{i+1}_{t_idx+1}"
                topic["uuid"] = str(uuid.uuid4())
                for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                    if not isinstance(subtopic, dict): continue
                    subtopic["id"] = str(uuid.uuid4())
                
                # YouTube Enrichment
                if settings.YOUTUBE_API_KEY:
                    try:
                        search_query = topic.get("youtube_search_query") or f"{topic['title']}"
                        results = await search_youtube_videos(search_query, max_results=1, topic_title=topic['title'], strict_official_sources=getattr(payload, 'strict_official_sources', False), subject_context=roadmap_plan.get("title", ""))
                        if results:
                            topic["youtube_video_id"] = results[0]["video_id"]
                            topic["youtube_video_title"] = results[0]["video_title"]
                            topic["duration"] = results[0]["duration_minutes"]
                        await asyncio.sleep(0.1)
                    except Exception as yt_err:
                        logger.error(f"YouTube enrichment failed for topic {topic['title']}: {yt_err}")

            # DuckDuckGo Enrichment
            search_query = module.get("optimal_search_query")
            if search_query:
                def fetch_ddg():
                    try:
                        from ddgs import DDGS
                        with DDGS() as ddgs:
                            return list(ddgs.text(search_query, max_results=3))
                    except Exception as e:
                        logger.error(f"DDG search failed for query {search_query}: {e}")
                        return []
                ddg_results = await asyncio.to_thread(fetch_ddg)
                if ddg_results:
                    logger.info(f"DuckDuckGo search successful for '{search_query}'. Found {len(ddg_results)} references.")
                    module["resources"] = [{"title": r["title"], "url": r["href"], "type": "article"} for r in ddg_results]

        slug = await _generate_unique_slug(roadmap_plan["title"], email, sb)
        
        db_data = {
            "title": roadmap_plan["title"],
            "description": roadmap_plan["description"],
            "roadmap_plan": roadmap_plan,
            "subject": f"Deconstructing: {payload.url}",
            "goal": "Understand Source Material",
            "time_value": payload.time_value,
            "time_unit": payload.time_unit,
            "model": model_to_use,
            "email": email,
            "slug": slug,
            "status": "active",
            "version": 1,
            "snapshot_hash": _generate_plan_hash(roadmap_plan)
        }
        
        response = sb.table("roadmaps").insert(db_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save roadmap")
            
        new_credits = credits - 1
        sb.table("profiles").update({"roadmap_credits": new_credits}).eq("email", email).execute()
        if new_credits <= 0:
            await check_and_revoke_pro_if_no_credits(email, sb)
            
        if uid:
            background_tasks.add_task(extract_skills_from_roadmap, response.data[0]["id"], uid)

        return RoadmapRead(**response.data[0])

    except Exception as e:
        logger.error(f"Roadmap URL generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")
