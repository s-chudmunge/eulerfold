import json
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict

import httpx
from fastapi import APIRouter, HTTPException, Request, Body, Depends, BackgroundTasks
from pydantic import BaseModel

from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.core.auth import get_current_user
from app.schemas import User
from app.utils.gemini_client import generate_text, robust_json_loads
from app.utils.streaks import track_activity
from app.utils.resend_client import send_homework_results_email

from app.services.skills_service import calculate_user_skill_scores_for_roadmap

logger = logging.getLogger(__name__)
router = APIRouter()

class SubmissionCreate(BaseModel):
    roadmap_id: int
    module_number: int
    description: str
    link: Optional[str] = None
    files: Optional[List[Dict]] = []

async def evaluate_submission(context: dict) -> dict:
    """
    Evaluates a homework submission using a single AI call.
    Checks for technical accuracy, evidence of learning, and relevance.
    """
    module_title = context.get("module_title")
    roadmap_subject = context.get("roadmap_subject")
    topics_text = context.get("topics_text")
    expected_deliverable = context.get("expected_deliverable")
    description = context.get("description")
    link = context.get("link")
    link_content = context.get("link_content", "")

    prompt = f"""You are a Technical Reviewer analyzing homework for: {module_title}.
ROADMAP SUBJECT: {roadmap_subject}
MODULE OBJECTIVES: {topics_text}
EXPECTED DELIVERABLE: {expected_deliverable}

USER SUBMISSION:
Description: {description}
Link: {link}
{link_content}

CRITERIA:
1. Technical Depth: Accurate and deep enough?
2. Evidence of Learning: Shows genuine understanding?
3. Relevance: Aligns with roadmap?

OUTPUT RULES:
- BE CONCISE. Max 3 lines total for the summary.
- NO fluff, NO encouragement, NO "Great job". Just analysis.
- Decide a level: Solid (Pass), Developing (Needs improvement), or Beginner (Failed).
- If 'Developing' or 'Beginner', provide direct next steps.

Respond ONLY with JSON:
{{
  "level": "Solid | Developing | Beginner",
  "summary": "Direct analysis of the work (max 3 lines).",
  "feedback_details": {{
    "technical": "...",
    "understanding": "...",
    "relevance": "..."
  }}
}}
"""

    try:
        gen_raw = await generate_text([prompt], model=settings.GEMINI_MODEL, response_mime_type="application/json")
        return robust_json_loads(gen_raw)
    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        return {
            "level": "Developing", 
            "summary": "Evaluation engine error. Submission recorded.",
            "feedback_details": {"technical": "N/A", "understanding": "N/A", "relevance": "N/A"}
        }

@router.post("/submissions", status_code=201)
async def create_submission(
    submission: SubmissionCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    email = current_user.email
    uid = current_user.supabase_uid
    sb = get_supabase_client()

    # 1. Cooldown Check (10 mins after a Beginner/Fail)
    recent_res = sb.table("submissions").select("evaluation_level, submitted_at") \
        .eq("roadmap_id", submission.roadmap_id) \
        .eq("module_number", submission.module_number) \
        .eq("user_email", email) \
        .order("submitted_at", desc=True).limit(1).execute()
    
    if recent_res.data:
        last = recent_res.data[0]
        if last.get("evaluation_level") == "Beginner":
            last_time = datetime.fromisoformat(last.get("submitted_at").replace("Z", "+00:00"))
            if datetime.now(timezone.utc) - last_time < timedelta(minutes=10):
                raise HTTPException(status_code=429, detail="System cooling down. Please wait 10 mins after a failed attempt.")

    # 2. Fetch Roadmap Context
    roadmap_res = sb.table("roadmaps").select("*").eq("id", submission.roadmap_id).single().execute()
    if not roadmap_res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    roadmap = roadmap_res.data
    modules = roadmap.get("roadmap_plan", {}).get("modules", [])
    module_idx = submission.module_number - 1
    module = modules[module_idx] if 0 <= module_idx < len(modules) else {}

    # 3. Scrape Link if provided (Jina Reader)
    link_content = ""
    if submission.link:
        try:
            async with httpx.AsyncClient() as client:
                jina_res = await client.get(f"https://r.jina.ai/{submission.link}", timeout=10.0)
                if jina_res.status_code == 200:
                    link_content = f"\nScraped Content:\n{jina_res.text[:3000]}"
        except Exception:
            pass

    # 4. Evaluate
    context = {
        "module_title": module.get("title", f"Module {submission.module_number}"),
        "roadmap_subject": roadmap.get("subject"),
        "topics_text": str(module.get("topics", [])),
        "expected_deliverable": str(module.get("proof_of_work_instructions", {})),
        "description": submission.description,
        "link": submission.link,
        "link_content": link_content
    }

    eval_result = await evaluate_submission(context)

    # 5. Save Submission
    sub_data = {
        "roadmap_id": submission.roadmap_id,
        "module_number": submission.module_number,
        "user_email": email,
        "description": submission.description,
        "link": submission.link,
        "evaluation_level": eval_result.get("level"),
        "evaluation": eval_result.get("summary"),
        "senate_summary": eval_result.get("summary"), 
        "senate_reasoning": eval_result.get("feedback_details"), 
        "is_senate_eval": True,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }

    res = sb.table("submissions").insert(sub_data).execute()
    
    # 6. Track Activity
    await track_activity(email)

    # 7. Update Skills & Send Results Email in Background
    background_tasks.add_task(calculate_user_skill_scores_for_roadmap, submission.roadmap_id, uid)
    
    background_tasks.add_task(
        send_homework_results_email,
        to_email=email,
        module_title=module.get("title", f"Module {submission.module_number}"),
        roadmap_title=roadmap.get("title"),
        roadmap_slug=roadmap.get("slug"),
        evaluation_level=eval_result.get("level"),
        summary=eval_result.get("summary"),
        feedback_details=eval_result.get("feedback_details", {})
    )

    return {"status": "ok", "evaluation": eval_result}


@router.get("/submissions")
async def list_submissions(
    roadmap_id: int,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    res = sb.table("submissions").select("*").eq("roadmap_id", roadmap_id).eq("user_email", current_user.email).order("submitted_at", desc=True).execute()
    return {"submissions": res.data}


@router.get("/submissions/roadmap/{roadmap_id}")
async def list_submissions_legacy(
    roadmap_id: int,
    current_user: User = Depends(get_current_user)
):
    return await list_submissions(roadmap_id, current_user)
