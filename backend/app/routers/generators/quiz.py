import json
import os
import random
import re
import uuid
import logging
import asyncio
import hashlib
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any, Dict



from fastapi import APIRouter, HTTPException, Request, Depends, BackgroundTasks, UploadFile, File
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.schemas import RoadmapCreate, RoadmapMe, RoadmapRead, RoadmapSave, User, ProgressUpdate, RoadmapExtend, RoadmapStatusUpdate, ManualBuildRequest, JobRoadmapCreate, ExternalRoadmapCreate, SyncSkillsRequest, UrlRoadmapCreate, SyllabusRoadmapCreate, SkillGapRoadmapCreate, DiagnosticQuizCreate, DiagnosticQuizEvaluate
from app.utils.ai_client import generate_text, generate_text_stream, clean_json_string, robust_json_loads, log_backend_ai_usage
from app.utils.resend_client import send_onboarding_email
from app.utils.youtube_client import search_youtube_videos, find_module_playlist, match_playlist_video_to_topic
from app.core.coins import EulerCoins
from app.utils.eulercoins import award_coins
from app.utils.streaks import track_activity
from app.core.auth import get_current_user
from app.routers.certificates import generate_and_store_certificate
from app.routers.optional_auth import get_optional_current_user
from app.services.skills_service import extract_skills_from_roadmap, calculate_user_skill_scores_for_roadmap, cleanup_skills_after_roadmap_deletion, process_extracted_skills
from app.routers.payments import check_and_revoke_pro_if_no_credits

from app.database.monitor import monitor_query

logger = logging.getLogger(__name__)
router = APIRouter(tags=['roadmaps-generate'])

def extract_core_subject(title: str) -> str:
    """Extract a concise subject from a potentially long generated title for search queries."""
    fluff_patterns = [
        r"(?i)^the complete guide to\s+",
        r"(?i)^mastering\s+",
        r"(?i)^advanced\s+",
        r"(?i)^basics of\s+",
        r"(?i)^introduction to\s+",
        r"(?i)^become a\s+",
        r"(?i)^how to become an?\s+",
        r"(?i)^comprehensive guide to\s+"
    ]
    core = title
    for p in fluff_patterns:
        core = re.sub(p, "", core)
    
    # Take up to the first colon or dash
    core = re.split(r'[:\-]', core)[0].strip()
    
    words = core.split()
    if len(words) > 4:
        core = " ".join(words[:4])
        
    return core

async def transition_roadmap_status(roadmap_id: int, new_status: str, user_email: str, user_uid: Optional[str] = None):
    """
    Centralized status transition logic. 
    Handles database updates and side effects (Coins, Skill Extraction).
    """
    try:
        sb = get_supabase_client()
        
        # 1. Fetch current state for idempotency and side-effect checks
        r_res = sb.table("roadmaps").select("status, title, skills_extracted, skills_extraction_error").eq("id", roadmap_id).execute()
        if not r_res.data:
            return
        
        roadmap = r_res.data[0]
        old_status = roadmap.get("status", "active")
        
        if old_status == new_status:
            return # No transition needed

        # 2. Update Database
        sb.table("roadmaps").update({
            "status": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", roadmap_id).execute()
        
        logger.info(f"Roadmap {roadmap_id} transitioned: {old_status} -> {new_status}")

        # 3. Handle Side Effects for COMPLETION
        if new_status == "completed" and old_status == "active":
            # A. Award Coins (50) - award_coins has its own internal idempotency check as well
            await award_coins(
                user_email, 
                EulerCoins.ROADMAP_COMPLETED, 
                f"Completed roadmap: {roadmap.get('title')}", 
                roadmap_id=roadmap_id
            )
            
            # B. Trigger Skill Extraction
            if user_uid and (not roadmap.get("skills_extracted") or roadmap.get("skills_extraction_error")):
                # Since we are already in an async function (possibly background), we can call it directly
                # but to be safe and consistent with other triggers, we keep it as a clean call
                try:
                    await extract_skills_from_roadmap(roadmap_id, user_uid)
                except Exception as e:
                    logger.error(f"Skill extraction failed during transition: {e}")
                    
            # C. Generate Certificate if User is Pro
            if user_uid:
                try:
                    prof_res = sb.table("profiles").select("is_pro").eq("supabase_uid", user_uid).single().execute()
                    if prof_res.data and prof_res.data.get("is_pro"):
                        # Run the sync function in a threadpool to avoid blocking the event loop
                        asyncio.create_task(asyncio.to_thread(generate_and_store_certificate, user_uid, roadmap_id))
                except Exception as e:
                    logger.error(f"Certificate generation trigger failed: {e}")

    except Exception as e:
        logger.error(f"Failed to transition roadmap status for {roadmap_id}: {e}")

def _parse_roadmap_dict(roadmap_val: Any) -> Dict[str, Any]:
    parsed = {}
    if isinstance(roadmap_val, str):
        try:
            parsed = json.loads(roadmap_val)
        except json.JSONDecodeError:
            pass
    elif isinstance(roadmap_val, dict):
        # Create a shallow copy so we don't accidentally modify an in-memory dict
        parsed = roadmap_val.copy()
        
    if "modules" in parsed and isinstance(parsed["modules"], list):
        parsed["modules"] = [m for m in parsed["modules"] if isinstance(m, dict)]
        
    return parsed

def _generate_plan_hash(plan: Dict[str, Any]) -> str:
    """Generate a stable hash for a roadmap plan."""
    plan_str = json.dumps(plan, sort_keys=True)
    return hashlib.sha256(plan_str.encode()).hexdigest()

async def _enrich_roadmap_progress(roadmaps: List[Dict], email: str, uid: str, sb, background_tasks: Optional[BackgroundTasks] = None):
    if not email or not uid:
        return roadmaps

    # Fetch data in bulk in parallel using threads
    import asyncio
    
    roadmap_ids = [r["id"] for r in roadmaps]
    if not roadmap_ids:
        return roadmaps
    
    def fetch_mp():
        return sb.table("module_progress").select("roadmap_id, module_number, topic_index, completed").eq("user_email", email).in_("roadmap_id", roadmap_ids).eq("completed", True).execute()
        
    def fetch_sub():
        return sb.table("submissions").select("roadmap_id, module_number, evaluation_level").eq("user_email", email).in_("roadmap_id", roadmap_ids).order("submitted_at", desc=True).execute()
        
    def fetch_ps():
        return sb.table("practice_sessions").select("id, roadmap_id, resources").eq("user_id", uid).in_("roadmap_id", roadmap_ids).execute()
        
    def fetch_pp():
        return sb.table("practice_progress").select("session_id, resource_id, completed").eq("user_id", uid).eq("completed", True).execute()
        
    def fetch_mcq():
        return sb.table("mcq_sessions").select("id, roadmap_id, subtopic_id").eq("user_id", uid).eq("status", "completed").in_("roadmap_id", roadmap_ids).execute()

    mp_res, sub_res, ps_res, pp_res, mcq_res = await asyncio.gather(
        asyncio.to_thread(fetch_mp),
        asyncio.to_thread(fetch_sub),
        asyncio.to_thread(fetch_ps),
        asyncio.to_thread(fetch_pp),
        asyncio.to_thread(fetch_mcq)
    )

    # Organize data for quick lookup
    mp_map = {} # roadmap_id -> set of (module_number, topic_index)
    for mp in mp_res.data:
        rid = mp["roadmap_id"]
        if rid not in mp_map: mp_map[rid] = set()
        mp_map[rid].add((mp["module_number"], mp["topic_index"]))
    
    sub_map = {} # roadmap_id -> {module_number: evaluation_level}
    for sub in sub_res.data:
        rid = sub["roadmap_id"]
        m_num = sub["module_number"]
        if rid not in sub_map: sub_map[rid] = {}
        # Only take the most recent evaluation for each module
        if m_num not in sub_map[rid]:
            sub_map[rid][m_num] = sub["evaluation_level"]
        
    ps_map = {} # roadmap_id -> list of sessions
    for ps in ps_res.data:
        rid = ps["roadmap_id"]
        if rid not in ps_map: ps_map[rid] = []
        ps_map[rid].append(ps)
        
    pp_set = set() # (session_id, resource_id)
    for pp in pp_res.data:
        pp_set.add((str(pp["session_id"]), str(pp["resource_id"])))

    mcq_map = {} # roadmap_id -> list of sessions
    for mcq in mcq_res.data:
        rid = mcq["roadmap_id"]
        if rid not in mcq_map: mcq_map[rid] = []
        mcq_map[rid].append(mcq)

    for r in roadmaps:
        rid = r["id"]
        plan = _parse_roadmap_dict(r["roadmap_plan"])
        modules = plan.get("modules", [])
        total_modules = len(modules)
        
        module_scores = []
        db_status = r.get("status", "active")
        roadmap_status = db_status
        bottleneck_module = None
        
        # Track counts for the summary object
        total_topics_all = 0
        completed_topics_all = 0
        total_subs_all = total_modules
        completed_subs_all = 0
        completed_practice_sessions = 0

        # Calculate scores per module
        valid_modules = [m for m in modules if isinstance(m, dict)]
        for m_idx, module in enumerate(valid_modules):
            m_num = m_idx + 1
            m_topics = module.get("topics", [])
            m_topic_count = len(m_topics)
            total_topics_all += m_topic_count
            
            # 1. Topic Completion Score
            completed_topics_in_module = 0
            for t_idx, topic in enumerate(m_topics):
                if (m_num, t_idx) in mp_map.get(rid, set()):
                    completed_topics_in_module += 1
            completed_topics_all += completed_topics_in_module
            
            # 2. Submission Score (Technician Evaluation)
            eval_level = sub_map.get(rid, {}).get(m_num)
            if eval_level:
                completed_subs_all += 1
            
            # 3. Practice Score — count fully completed sessions
            m_sessions = [ps for ps in ps_map.get(rid, []) if any(str(topic.get("uuid")) == str(ps.get("subtopic_id")) for topic in m_topics)]
            m_completed_practice = 0
            for ps in m_sessions:
                resources = ps.get("resources", [])
                if not resources:
                    continue
                all_done = all(
                    (str(ps["id"]), str(res["id"])) in pp_set
                    for res in resources
                )
                if all_done:
                    m_completed_practice += 1
                    
            m_mcqs = [mcq for mcq in mcq_map.get(rid, []) if any(str(topic.get("uuid")) == str(mcq.get("subtopic_id")) for topic in m_topics)]
            m_completed_practice += len(m_mcqs)

            if m_completed_practice > 0:
                completed_practice_sessions += 1

            # Status determination logic: 
            # If a module is completed (all topics + solid/developing submission), we move on.
            # If not, it's the bottleneck.
            if bottleneck_module is None:
                if completed_topics_in_module < m_topic_count or not eval_level:
                    bottleneck_module = m_num
                    if eval_level == "Beginner":
                        # Calculated status can be resubmit_required, but if DB is 'completed' or 'archived', we might want to respect that?
                        # Actually 'resubmit_required' is a temporary active state.
                        if roadmap_status == "active":
                            roadmap_status = "resubmit_required"
                    elif eval_level == "Developing" and completed_topics_in_module == m_topic_count:
                         # Good enough to proceed, but not Solid. 
                         # Actually we allow Developing to pass but label as "Needs Improvement"
                         if roadmap_status == "active":
                            roadmap_status = "needs_improvement"

        # Overall Percent Calculation
        # Weights: 40% PoW (Submissions) + 30% Topics + 30% Practice
        # Practice: one completed session per module
        min_expected_sessions = total_modules
        pow_weight = (completed_subs_all / total_subs_all) * 40 if total_subs_all > 0 else 0
        topic_weight = (completed_topics_all / total_topics_all) * 30 if total_topics_all > 0 else 0
        practice_weight = min(1.0, completed_practice_sessions / min_expected_sessions) * 30 if min_expected_sessions > 0 else 0
        
        percent = round(pow_weight + topic_weight + practice_weight)

        # Final Completion Check
        if percent >= 98 and roadmap_status not in ["resubmit_required", "needs_improvement"]:
            if db_status == "active":
                roadmap_status = "completed"
                # Persist completion status to DB in background
                if background_tasks:
                    background_tasks.add_task(transition_roadmap_status, rid, "completed", email, uid)
            
            # Note: Skill extraction is now handled inside transition_roadmap_status if it's the first time
            # However, if it was ALREADY completed but skills haven't been extracted, we still want this trigger:
            elif background_tasks and uid and (not r.get("skills_extracted") or r.get("skills_extraction_error")):
                background_tasks.add_task(extract_skills_from_roadmap, rid, uid)
            
            # Idempotently trigger certificate generation in case it failed previously
            if background_tasks and uid:
                try:
                    prof_res = sb.table("profiles").select("is_pro").eq("supabase_uid", uid).single().execute()
                    if prof_res.data and prof_res.data.get("is_pro"):
                        background_tasks.add_task(generate_and_store_certificate, uid, rid)
                except Exception as e:
                    logger.error(f"Failed to queue certificate generation: {e}")
            
        r["calculated_progress"] = {
            "percent": percent,
            "completed_topics": completed_topics_all,
            "total_topics": total_topics_all,
            "completed_submissions": completed_subs_all,
            "total_submissions": total_subs_all,
            "completed_practice_sessions": completed_practice_sessions,
            "required_practice_sessions": min_expected_sessions,
            "bottleneck_module": bottleneck_module
        }
        # If DB status is terminal (archived, quit), keep it. 
        # Otherwise use calculated (active, completed, resubmit_required, etc.)
        if db_status in ["archived", "quit", "completed"]:
            r["calculated_status"] = db_status
        else:
            r["calculated_status"] = roadmap_status
    
    return roadmaps



@router.post("/roadmaps/generate-diagnostic-quiz")
@monitor_query(query_type="generate_diagnostic_quiz", table="roadmaps")
async def generate_diagnostic_quiz(
    payload: DiagnosticQuizCreate,
    current_user: User = Depends(get_current_user)
):
    """Generate a diagnostic quiz based on known skills to find gaps."""
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
        raise HTTPException(status_code=403, detail="Diagnostic Quiz is a Pro feature.")

    credits = profile_res.data[0].get("roadmap_credits", 0)
    
    if credits < 1:
        if is_pro:
            raise HTTPException(status_code=402, detail="You have run out of roadmap credits.")
        else:
            raise HTTPException(status_code=402, detail="No roadmap credits left. Please upgrade to Pro.")

    prompt = f"""
You are a technical subject matter expert. 
The user is aspiring to be a "{payload.target_role}".
They already know: "{payload.known_skills}".

Your goal is to generate {payload.question_count} Multiple Choice Questions (MCQs) that test their knowledge on ADVANCED or MISSING concepts required for {payload.target_role} that they might NOT know yet. 
Do not test them on what they already know.

CRITICAL QUALITY STANDARDS:
- Questions must be CONCEPTUAL and SITUATIONAL. Avoid simple recall or rote memorization.
- Focus on application of principles and "what would happen if" scenarios.
- Each question must have exactly 4 options.
- Only one option must be clearly correct.
- Options should be plausible but distinct.

Return ONLY a JSON array of objects. Each object must have:
- id: a unique string ID for the question (e.g. "q1", "q2")
- question: string
- options: array of 4 strings
- correct_answer_index: integer (0-3)
- explanation: a concise one-line explanation of the correct choice
"""
    try:
        model_to_use = settings.DEFAULT_ROADMAP_MODEL
        generated_text, usage = await generate_text(prompt, model=model_to_use, response_mime_type="application/json", return_usage=True)
        log_backend_ai_usage(sb, uid, f"Diagnostic Quiz Gen (Cost: 0 Credits)", usage, source="backend")
        quiz_data = robust_json_loads(generated_text)
        
        # We don't deduct credits for the quiz itself, only for the roadmap generation later
        
        return quiz_data

    except Exception as e:
        logger.error(f"Diagnostic Quiz generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")



@router.post("/roadmaps/generate-diagnostic-quiz-stream")
@monitor_query(query_type="generate_diagnostic_quiz_stream", table="roadmaps")
async def generate_diagnostic_quiz_stream(
    payload: DiagnosticQuizCreate,
    current_user: User = Depends(get_current_user)
):
    """Stream diagnostic quiz questions token by token so test can start immediately."""
    email = current_user.email
    if not email:
        raise HTTPException(status_code=401, detail="Could not determine user email")

    sb = get_supabase_client()
    profile_res = sb.table("profiles").select("roadmap_credits, is_pro").eq("email", email).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    is_pro = profile_res.data[0].get("is_pro", False)
    if not is_pro:
        raise HTTPException(status_code=403, detail="Diagnostic Quiz is a Pro feature.")

    credits = profile_res.data[0].get("roadmap_credits", 0)
    if credits < 1:
        if is_pro:
            raise HTTPException(status_code=402, detail="You have run out of roadmap credits.")
        else:
            raise HTTPException(status_code=402, detail="No roadmap credits left. Please upgrade to Pro.")

    prompt = f"""
You are a technical subject matter expert. 
The user is aspiring to be a "{payload.target_role}".
They already know: "{payload.known_skills}".

Your goal is to generate {payload.question_count} Multiple Choice Questions (MCQs) that test their knowledge on ADVANCED or MISSING concepts required for {payload.target_role} that they might NOT know yet. 
Do not test them on what they already know.

CRITICAL QUALITY STANDARDS:
- Questions must be CONCEPTUAL and SITUATIONAL. Avoid simple recall or rote memorization.
- Focus on application of principles and "what would happen if" scenarios.
- Each question must have exactly 4 options.
- Only one option must be clearly correct.
- Options should be plausible but distinct.

Return ONLY a JSON array of objects. Each object must have:
- id: a unique string ID for the question (e.g. "q1", "q2")
- question: string
- options: array of 4 strings
- correct_answer_index: integer (0-3)
- explanation: a concise one-line explanation of the correct choice
"""
    model_to_use = settings.DEFAULT_ROADMAP_MODEL
    return StreamingResponse(
        generate_text_stream(prompt, model=model_to_use, response_mime_type="application/json"),
        media_type="text/event-stream"
    )



@router.post("/roadmaps/evaluate-diagnostic-quiz")
@monitor_query(query_type="evaluate_diagnostic_quiz", table="roadmaps")
async def evaluate_diagnostic_quiz(
    payload: DiagnosticQuizEvaluate,
    current_user: User = Depends(get_current_user)
):
    """Evaluate diagnostic quiz results to decide if more probing is needed or to proceed to roadmap generation."""
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
        raise HTTPException(status_code=403, detail="Diagnostic Quiz is a Pro feature.")

    prompt = f"""
You are a technical subject matter expert evaluating a learner's diagnostic test for the role of "{payload.target_role}".
Stated prior experience: "{payload.known_skills}".
Current Assessment Round: {payload.round_number}.

Test Results:
{json.dumps(payload.questions_and_answers, indent=2)}

Determine if deeper diagnostic probing is required or if you have sufficient evidence to build their custom gap-filling roadmap.

RULES:
1. If round_number == 1 AND user answered between 1 and 4 questions incorrectly, AND those incorrect answers point to specific sub-topics that require deeper diagnosis:
   Set "decision": "DEEPER_DIAGNOSIS".
   Generate 2 or 3 targeted follow-up MCQs in "follow_up_questions" that probe those exact weak spots at a deeper level.
2. If round_number >= 2 OR user got 0 incorrect (passed all) OR user got all 5 incorrect (failed all):
   Set "decision": "GENERATE_ROADMAP".

Return ONLY a JSON object matching this schema:
{{
  "decision": "DEEPER_DIAGNOSIS" | "GENERATE_ROADMAP",
  "reason": "Concise explanation of the decision",
  "weak_skills": "Concise summary of missing competencies and knowledge gaps identified",
  "follow_up_questions": [
    {{
      "id": "f1",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer_index": 0,
      "explanation": "string"
    }}
  ]
}}
"""
    try:
        model_to_use = settings.DEFAULT_ROADMAP_MODEL
        generated_text, usage = await generate_text(prompt, model=model_to_use, response_mime_type="application/json", return_usage=True)
        log_backend_ai_usage(sb, uid, f"Diagnostic Quiz Evaluation", usage, source="backend")
        return robust_json_loads(generated_text)
    except Exception as e:
        logger.error(f"Diagnostic Quiz evaluation failed: {e}")
        return {
            "decision": "GENERATE_ROADMAP",
            "reason": "Proceeding to roadmap generation.",
            "weak_skills": "User struggled with diagnostic questions."
        }


