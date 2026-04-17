import json
import logging
import uuid
import asyncio
import httpx
import re
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.core.auth import get_current_user
from app.services.skills_service import calculate_user_skill_scores_for_roadmap
from app.schemas import (
    User, 
    PracticeSessionCreate, 
    PracticeSessionRead, 
    PracticeResource, 
    PracticeProgressUpdate,
    PracticeProgressRead,
    MCQSessionCreate,
    MCQSessionRead,
    MCQSubmitAnswer,
    MCQQuestion
)
from app.utils.gemini_client import generate_text, clean_json_string
from app.core.coins import EulerCoins
from app.utils.eulercoins import award_coins

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/practice", tags=["practice"])

async def _verify_url(url: str) -> bool:
    """
    Check if a URL is valid. 
    Passes: 200, 401, 403, 405, and timeouts/connectivity errors (fail-open).
    Fails: 404, 410.
    """
    if not url or not url.startswith("http"):
        return False
    try:
        # Use a real browser-like User-Agent to reduce blocks
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        # Increased timeout to 10s to account for slow educational sites
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=headers) as client:
            try:
                # Try HEAD first as it's faster
                response = await client.head(url)
            except (httpx.RequestError, httpx.HTTPStatusError):
                # Fallback to GET if HEAD is rejected or fails
                response = await client.get(url)
            
            # Treat these as pass (bot protection or paywalls on valid pages)
            if response.status_code in [401, 403, 405]:
                return True
                
            # Explicitly fail ONLY on guaranteed broken links
            if response.status_code in [404, 410]:
                return False
                
            # Pass all other status codes (including 500s - fail-open) or 200
            return True
    except (httpx.TimeoutException, httpx.ConnectError, httpx.ConnectTimeout):
        # Fail-open: If the site is slow or we have no internet, pass the link
        logger.warning(f"URL Verification Timeout/ConnectError for {url}. Failing open.")
        return True
    except Exception:
        # Discard only on genuine internal errors or malformed URLs
        return False

async def _generate_practice_resources(topic: str, subject: str, goal: str, existing: List[dict] = None) -> List[dict]:
    """Call Gemini to generate practice problems."""
    existing_urls = [e["url"] for e in existing] if existing else []
    
    prompt = f"""
    User is learning "{topic}" as part of a roadmap for "{subject}" with the goal "{goal}".
    Suggest 3-4 practice problems, interactive exercises, or specific project-based resources.
    
    CRITICAL QUALITY STANDARDS:
    - ONLY suggest well-established, high-authority platforms relevant to "{subject}":
        * Coding: LeetCode, HackerRank, Codewars, Exercism, Frontend Mentor
        * Math: Brilliant.org, Art of Problem Solving, Project Euler, Khan Academy, Desmos
        * Physics/Chemistry/Biology: PhET Simulations (phet.colorado.edu), Physics Classroom, HHMI BioInteractive, Chemix
        * Engineering: Tinkercad, CircuitLab, OnShape, MIT OpenCourseWare problem sets
        * Design: Daily UI, Sharpen.design, Figma Community, Dribbble, Canva, Adobe Discover, Google Fonts
        * Writing: Reedsy Prompts, 750words.com
        * General STEM: Brilliant.org, MIT OpenCourseWare, Coursera graded assignments, Kaggle
    - Every URL MUST be a direct, stable link to a specific exercise, project template, or tool.
    - DO NOT suggest coding platforms (like LeetCode) for non-coding roadmaps.
    - DO NOT suggest search result pages (e.g., site.com/search?q=...) or generic homepages.
    - DO NOT suggest forum threads, Reddit posts, or Stack Exchange questions.
    - DO NOT suggest "self-directed" exercises (e.g., "Font Pairing Challenge") without a real, functional interactive URL.
    - Avoid vague "tutorial" pages unless they include a specific interactive task.
    - Ensure the URL is valid and publicly accessible.
    
    {f"IMPORTANT: Do NOT suggest any of these already provided URLs: {', '.join(existing_urls)}" if existing_urls else ""}
    
    Return ONLY a JSON array of objects. Each object must have:
    - title: string
    - url: string
    - platform: string
    - difficulty: string (e.g., Easy, Medium, Hard)
    - note: a one-line focus note on why this is relevant
    
    If you cannot find any truly high-quality resources that meet these strict criteria, return an empty array [].
    """
    
    try:
        try:
            response_text = await generate_text(prompt, model=settings.GEMINI_MODEL, response_mime_type="application/json")
        except Exception as e:
            if "429" in str(e):
                logger.warning("Primary model hit quota, falling back to gemini-flash-lite-latest")
                response_text = await generate_text(prompt, model="models/gemini-flash-lite-latest", response_mime_type="application/json")
            else:
                raise e
                
        # More robust JSON extraction
        resources = None
        try:
            cleaned_json = clean_json_string(response_text)
            resources = json.loads(cleaned_json)
        except json.JSONDecodeError:
            match = re.search(r"(\[.*\])", response_text, re.DOTALL)
            if match:
                try:
                    resources = json.loads(match.group(1))
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse practice JSON even with regex fallback. Text starts with: {response_text[:200]}")
                    return []
            else:
                logger.error(f"No JSON-like array structure found in: {response_text[:200]}")
                return []
        
        if not isinstance(resources, list):
            return []
            
        # --- URL Verification Layer ---
        verification_tasks = [_verify_url(res.get("url", "")) for res in resources]
        verification_results = await asyncio.gather(*verification_tasks)
        
        # Filter only verified resources
        verified_resources = [
            res for res, is_valid in zip(resources, verification_results) 
            if is_valid and res.get("url")
        ]
        
        # Add a unique ID to each verified resource
        for res in verified_resources:
            if "id" not in res:
                res["id"] = str(uuid.uuid4())
        
        return verified_resources
    except Exception as e:
        logger.error(f"Gemini practice generation failed: {e}")
        return []

@router.post("/session", response_model=PracticeSessionRead)
async def get_or_create_session(data: PracticeSessionCreate, current_user: User = Depends(get_current_user)):
    logger.info(f"User {current_user.email} requesting practice session for: {data.topic_name} ({data.subject})")
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    
    # Check for existing session
    existing = (
        sb.table("practice_sessions")
        .select("*")
        .eq("user_id", uid)
        .eq("subtopic_id", str(data.subtopic_id))
        .execute()
    )
        
    if existing.data:
        return existing.data[0]
        
    # Generate new resources
    resources = await _generate_practice_resources(data.topic_name, data.subject, data.goal)
    
    if not resources:
        # We still create the session but with empty resources and has_more=false
        pass

    new_session = {
        "user_id": uid,
        "roadmap_id": data.roadmap_id,
        "subtopic_id": str(data.subtopic_id),
        "resources": resources,
        "has_more": len(resources) > 0
    }
    
    result = sb.table("practice_sessions").insert(new_session).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create practice session")
        
    return result.data[0]

@router.post("/session/{session_id}/more", response_model=PracticeSessionRead)
async def load_more_resources(session_id: uuid.UUID, data: PracticeSessionCreate, current_user: User = Depends(get_current_user)):
    logger.info(f"User {current_user.email} loading more practice for: {data.topic_name}")
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    
    # Fetch current session
    session_res = (
        sb.table("practice_sessions")
        .select("*")
        .eq("id", str(session_id))
        .eq("user_id", uid)
        .execute()
    )
        
    if not session_res.data:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = session_res.data[0]
    existing_resources = session.get("resources", [])
    generation_count = session.get("generation_count", 0)
    
    if generation_count >= 3:
        # Extra safety check, though frontend should hide button
        update_data = {
            "has_more": False,
            "updated_at": datetime.now().isoformat()
        }
        sb.table("practice_sessions").update(update_data).eq("id", str(session_id)).execute()
        return {**session, "has_more": False}
    
    # Generate more
    new_resources = await _generate_practice_resources(data.topic_name, data.subject, data.goal, existing=existing_resources)
    
    new_count = generation_count + 1
    # has_more is true if we found new resources AND we haven't hit the count limit
    has_more = len(new_resources) > 0 and new_count < 3
    updated_resources = existing_resources + new_resources
    
    update_data = {
        "resources": updated_resources,
        "has_more": has_more,
        "generation_count": new_count,
        "updated_at": datetime.now().isoformat()
    }
    
    result = sb.table("practice_sessions").update(update_data).eq("id", str(session_id)).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update session")
        
    return result.data[0]

@router.post("/session/{session_id}/retry", response_model=PracticeSessionRead)
async def retry_generation(session_id: uuid.UUID, data: PracticeSessionCreate, current_user: User = Depends(get_current_user)):
    logger.info(f"User {current_user.email} retrying practice generation for: {data.topic_name}")
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    
    # Verify session
    session_res = (
        sb.table("practice_sessions")
        .select("*")
        .eq("id", str(session_id))
        .eq("user_id", uid)
        .execute()
    )
    
    if not session_res.data:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Generate fresh resources (replacing the old empty/failed list)
    resources = await _generate_practice_resources(data.topic_name, data.subject, data.goal)
    
    update_data = {
        "resources": resources,
        "has_more": len(resources) > 0,
        "updated_at": datetime.now().isoformat()
    }
    
    result = sb.table("practice_sessions").update(update_data).eq("id", str(session_id)).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to retry generation")
        
    return result.data[0]

async def _generate_mcq_questions(topic: str, subject: str, week: int, num_questions: int) -> List[dict]:
    """Call Gemini to generate conceptual and MCQ questions."""
    
    prompt = f"""
    You are a subject matter expert in "{subject}".
    Generate {num_questions} Multiple Choice Questions (MCQs) for a learner currently in Week {week} studying the specific topic: "{topic}".
    
    CRITICAL QUALITY STANDARDS:
    - Questions must be CONCEPTUAL and SITUATIONAL. Avoid simple recall or rote memorization.
    - Focus on application of principles and "what would happen if" scenarios.
    - Each question must have exactly 4 options.
    - Only one option must be clearly correct.
    - Options should be plausible but distinct.
    - Do not generate questions that can be answered by simply recalling a definition. Every question must require the learner to think, apply, or reason.
    - Provide a detailed explanation for why the correct answer is right.
    
    Return ONLY a JSON array of objects. Each object must have:
    - id: a unique string ID for the question (e.g. "q1", "q2")
    - question: string
    - options: array of 4 strings
    - correct_answer_index: integer (0-3)
    - explanation: a concise one-line explanation of the correct choice
    """
    
    try:
        response_text = await generate_text(prompt, model=settings.GEMINI_MODEL, response_mime_type="application/json")
        cleaned_json = clean_json_string(response_text)
        questions = json.loads(cleaned_json)
        
        if not isinstance(questions, list):
            return []
            
        # Basic validation of the structure
        validated = []
        for q in questions:
            if all(k in q for k in ["question", "options", "correct_answer_index", "explanation"]):
                if len(q["options"]) == 4:
                    validated.append(q)
                    
        return validated[:num_questions]
    except Exception as e:
        logger.error(f"Gemini MCQ generation failed: {e}")
        return []

@router.post("/mcq/generate", response_model=MCQSessionRead)
async def generate_mcq_session(data: MCQSessionCreate, current_user: User = Depends(get_current_user)):
    logger.info(f"User {current_user.email} requesting MCQ session for: {data.topic_name}")
    sb = get_supabase_client()
    uid = current_user.supabase_uid

    # 1. Fetch full profile to check Pro and Credits
    profile_res = sb.table("profiles").select("roadmap_credits, is_pro").eq("supabase_uid", uid).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    profile = profile_res.data[0]
    if not profile.get("is_pro"):
        raise HTTPException(status_code=403, detail="MCQ Assessments are a Pro-only feature.")

    # 1b. Check if an active session already exists for this subtopic to avoid duplicate credit deduction
    active_res = sb.table("mcq_sessions") \
        .select("*") \
        .eq("user_id", uid) \
        .eq("subtopic_id", str(data.subtopic_id)) \
        .eq("status", "active") \
        .execute()

    if active_res.data:
        logger.info(f"Active MCQ session already exists for user {uid} on subtopic {data.subtopic_id}. Returning existing session.")
        return active_res.data[0]

    current_credits = float(profile.get("roadmap_credits") or 0.0)
    credit_cost = float(data.num_questions) * 0.01

    if current_credits < credit_cost:
        raise HTTPException(status_code=402, detail=f"Insufficient credits. This session costs {credit_cost} credits.")

    # 2. Deduct credits first (Fail-safe: Refund if Gemini fails)
    new_credit_balance = round(current_credits - credit_cost, 2)
    sb.table("profiles").update({"roadmap_credits": new_credit_balance}).eq("supabase_uid", uid).execute()

    try:
        # 3. Generate Questions
        questions = await _generate_mcq_questions(data.topic_name, data.subject, data.week_number, data.num_questions)

        if not questions:
            # Refund credits
            sb.table("profiles").update({"roadmap_credits": current_credits}).eq("supabase_uid", uid).execute()
            raise HTTPException(status_code=500, detail="Failed to generate high-quality questions. Credits have been refunded.")

        # 4. Save Session
        new_session = {
            "user_id": uid,
            "roadmap_id": data.roadmap_id,
            "subtopic_id": str(data.subtopic_id),
            "topic_name": data.topic_name,
            "subject": data.subject,
            "week_number": data.week_number,
            "questions": questions,
            "credit_cost": credit_cost,
            "status": "active"
        }

        result = sb.table("mcq_sessions").insert(new_session).execute()
        if not result.data:
            # Refund credits
            sb.table("profiles").update({"roadmap_credits": current_credits}).eq("supabase_uid", uid).execute()
            raise HTTPException(status_code=500, detail="Failed to save MCQ session. Credits have been refunded.")

        return result.data[0]

    except Exception as e:
        # Final safety refund
        sb.table("profiles").update({"roadmap_credits": current_credits}).eq("supabase_uid", uid).execute()
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"MCQ generation flow failed: {e}")
        raise HTTPException(status_code=500, detail="Generation failed. Credits refunded.")

@router.get("/mcq/incomplete/{subtopic_id}", response_model=Optional[MCQSessionRead])
async def get_incomplete_mcq_session(subtopic_id: uuid.UUID, current_user: User = Depends(get_current_user)):
    """Check for an active MCQ session for a specific subtopic."""
    sb = get_supabase_client()
    uid = current_user.supabase_uid

    result = sb.table("mcq_sessions") \
        .select("*") \
        .eq("user_id", uid) \
        .eq("subtopic_id", str(subtopic_id)) \
        .eq("status", "active") \
        .order("created_at", desc=True) \
        .execute()

    if not result.data:
        return None

    return result.data[0]

@router.get("/mcq/history/{subtopic_id}", response_model=List[MCQSessionRead])
async def get_mcq_history(subtopic_id: uuid.UUID, current_user: User = Depends(get_current_user)):
    """Get completed MCQ assessments for a specific subtopic."""
    sb = get_supabase_client()
    uid = current_user.supabase_uid

    result = sb.table("mcq_sessions") \
        .select("*") \
        .eq("user_id", uid) \
        .eq("subtopic_id", str(subtopic_id)) \
        .eq("status", "completed") \
        .order("created_at", desc=True) \
        .execute()

    return result.data or []

@router.post("/mcq/{session_id}/abandon")
async def abandon_mcq_session(session_id: uuid.UUID, current_user: User = Depends(get_current_user)):
    """Mark an active MCQ session as abandoned."""
    sb = get_supabase_client()
    uid = current_user.supabase_uid

    # 1. Verify ownership and status
    session_res = sb.table("mcq_sessions").select("status").eq("id", str(session_id)).eq("user_id", uid).execute()
    if not session_res.data:
        raise HTTPException(status_code=404, detail="Session not found")

    if session_res.data[0]["status"] != "active":
        raise HTTPException(status_code=400, detail="Only active sessions can be abandoned")

    # 2. Update status
    result = sb.table("mcq_sessions").update({"status": "abandoned"}).eq("id", str(session_id)).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to abandon session")

    return {"status": "success", "message": "Session abandoned"}

@router.get("/mcq/session/{session_id}", response_model=MCQSessionRead)
async def get_mcq_session(session_id: uuid.UUID, current_user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    
    result = sb.table("mcq_sessions").select("*").eq("id", str(session_id)).eq("user_id", uid).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return result.data[0]

@router.post("/mcq/{session_id}/submit", response_model=MCQSessionRead)
async def submit_mcq_session(
    session_id: uuid.UUID, 
    submission: MCQSubmitAnswer, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    
    # 1. Fetch session
    session_res = sb.table("mcq_sessions").select("*").eq("id", str(session_id)).eq("user_id", uid).execute()
    if not session_res.data:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = session_res.data[0]
    if session.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Session already completed")
        
    questions = session.get("questions", [])
    if len(submission.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Missing answers for some questions")
        
    # 2. Calculate score
    correct_count = 0
    for i, q in enumerate(questions):
        if submission.answers[i] == q.get("correct_answer_index"):
            correct_count += 1
            
    score = correct_count / len(questions) if questions else 0.0
    
    # 3. Update session
    update_data = {
        "user_answers": submission.answers,
        "score": score,
        "status": "completed",
        "updated_at": datetime.now().isoformat()
    }
    
    result = sb.table("mcq_sessions").update(update_data).eq("id", str(session_id)).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update session results")
    
    # 4. Trigger background updates
    # A. Recalculate skill scores
    background_tasks.add_task(calculate_user_skill_scores_for_roadmap, int(session["roadmap_id"]), uid)
    
    # B. Award EulerCoins (1 per correct answer)
    if correct_count > 0:
        background_tasks.add_task(
            award_coins, 
            user_email=current_user.email, 
            amount=correct_count, 
            reason=f"MCQ Assessment Points: {session['topic_name']}",
            roadmap_id=int(session["roadmap_id"])
        )
        
    return result.data[0]

@router.patch("/session/{session_id}/progress", response_model=PracticeProgressRead)
async def update_practice_progress(
    session_id: uuid.UUID, 
    progress: PracticeProgressUpdate, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    
    # Verify session exists and belongs to user
    session_check = (
        sb.table("practice_sessions")
        .select("roadmap_id")
        .eq("id", str(session_id))
        .eq("user_id", uid)
        .execute()
    )
        
    if not session_check.data:
        raise HTTPException(status_code=404, detail="Session not found or unauthorized")
    
    roadmap_id = session_check.data[0]["roadmap_id"]

    # Upsert progress
    progress_data = {
        "user_id": uid,
        "session_id": str(session_id),
        "resource_id": str(progress.resource_id),
        "completed": progress.completed,
        "updated_at": datetime.now().isoformat()
    }
    
    result = sb.table("practice_progress").upsert(progress_data, on_conflict="user_id,session_id,resource_id").execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update progress")
        
    # Award coins and recalculate skills if completed
    if progress.completed:
        if roadmap_id:
            background_tasks.add_task(calculate_user_skill_scores_for_roadmap, roadmap_id, uid)
        
        await award_coins(
            user_email=current_user.email,
            amount=EulerCoins.COMPLETE_PRACTICE,
            reason=f"Practice Completed: {progress.resource_id}",
            roadmap_id=roadmap_id
        )
        
    return result.data[0]

@router.get("/session/{session_id}/progress", response_model=List[PracticeProgressRead])
async def get_session_progress(session_id: uuid.UUID, current_user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    
    result = (
        sb.table("practice_progress")
        .select("*")
        .eq("session_id", str(session_id))
        .eq("user_id", uid)
        .execute()
    )
        
    return result.data if result.data else []
