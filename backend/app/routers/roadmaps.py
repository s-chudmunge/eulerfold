import json
import os
import random
import re
import uuid
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any, Dict



from fastapi import APIRouter, HTTPException, Request, Depends, BackgroundTasks

from app.core.config import settings
from app.core.supabase_client import supabase, get_supabase_client
from app.schemas import RoadmapCreate, RoadmapMe, RoadmapRead, RoadmapSave, User, ProgressUpdate, ReengagementRebuild
from app.utils.gemini_client import generate_text, clean_json_string
from app.utils.resend_client import send_onboarding_email
from app.utils.youtube_client import search_youtube_videos
from app.core.coins import EulerCoins
from app.utils.eulercoins import award_coins
from app.utils.streaks import track_activity
from app.core.auth import get_current_user
from app.routers.optional_auth import get_optional_current_user
from app.services.skills_service import extract_skills_from_roadmap

logger = logging.getLogger(__name__)
router = APIRouter()

def _parse_roadmap_dict(roadmap_val: Any) -> Dict[str, Any]:
    if isinstance(roadmap_val, str):
        try:
            return json.loads(roadmap_val)
        except json.JSONDecodeError:
            return {}
    if isinstance(roadmap_val, dict):
        return roadmap_val
    return {}

async def _enrich_roadmap_progress(roadmaps: List[Dict], email: str, uid: str, sb, background_tasks: Optional[BackgroundTasks] = None):
    if not email or not uid:
        return roadmaps

    # Fetch data in bulk
    roadmap_ids = [r["id"] for r in roadmaps]
    if not roadmap_ids:
        return roadmaps

    # 1. Fetch module_progress (completed topics)
    mp_res = sb.table("module_progress").select("roadmap_id, module_number, topic_index, completed").eq("user_email", email).in_("roadmap_id", roadmap_ids).eq("completed", True).execute()
    
    # 2. Fetch submissions (ordered by latest first)
    sub_res = sb.table("submissions").select("roadmap_id, module_number, evaluation_level").eq("user_email", email).in_("roadmap_id", roadmap_ids).order("submitted_at", desc=True).execute()
    
    # 3. Fetch practice sessions & progress
    ps_res = sb.table("practice_sessions").select("id, roadmap_id, resources").eq("user_id", uid).in_("roadmap_id", roadmap_ids).execute()
    pp_res = sb.table("practice_progress").select("session_id, resource_id, completed").eq("user_id", uid).eq("completed", True).execute()

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

    for r in roadmaps:
        rid = r["id"]
        plan = _parse_roadmap_dict(r["roadmap_plan"])
        modules = plan.get("modules", [])
        total_modules = len(modules)
        
        module_scores = []
        roadmap_status = "active"
        bottleneck_module = None
        
        # Track counts for the summary object
        total_topics_all = 0
        completed_topics_all = 0
        total_subs_all = total_modules
        completed_subs_all = 0
        total_practice_all = 0
        completed_practice_all = 0

        # Status Priority (Highest to lowest)
        # 1. resubmit_required
        # 2. action_required
        # 3. pending_review
        # 4. active
        current_priority = 0
        status_map = {"active": 0, "pending_review": 1, "action_required": 2, "resubmit_required": 3, "needs_improvement": 4}

        for m_idx, m in enumerate(modules):
            m_num = m_idx + 1
            m_topics = m.get("topics", [])
            total_topics_m = len(m_topics)
            total_topics_all += total_topics_m
            
            # 1. Topic Progress
            m_completed_topics = 0
            for t_idx, _ in enumerate(m_topics):
                if (m_num, t_idx) in mp_map.get(rid, set()):
                    m_completed_topics += 1
                    completed_topics_all += 1
            topic_ratio = (m_completed_topics / total_topics_m) if total_topics_m > 0 else 1.0

            # 2. Submission Progress
            m_eval = sub_map.get(rid, {}).get(m_num, "missing")
            sub_score = 0.0
            if m_eval in ["Solid", "Developing"]:
                sub_score = 1.0
                completed_subs_all += 1
            elif m_eval == "Needs Improvement":
                sub_score = 0.9 # Prevents 100% Mastery
                completed_subs_all += 1
            elif m_eval is None: # Pending Review
                sub_score = 0.5
            elif m_eval == "Beginner":
                sub_score = 0.0 # Must resubmit

            # 3. Practice Progress
            # Check if practice session exists for ANY topic in this module
            # (Note: In current schema, sessions are linked to subtopics, but we'll aggregate to module)
            m_total_practice = 0
            m_completed_practice = 0
            has_practice = False
            
            for ps in ps_map.get(rid, []):
                # We need to know if this session belongs to THIS module
                # Let's check resources to see if it has content
                resources = ps.get("resources", [])
                if not resources:
                    continue
                
                # Check if subtopic_id (which is topic uuid) belongs to this module
                topic_uuids = {t.get("uuid") for t in m_topics if t.get("uuid")}
                # ps["subtopic_id"] in practice_sessions is actually the topic uuid
                if str(ps.get("subtopic_id")) in topic_uuids:
                    has_practice = True
                    m_total_practice += len(resources)
                    total_practice_all += len(resources)
                    for res in resources:
                        if (str(ps["id"]), str(res.get("id"))) in pp_set:
                            m_completed_practice += 1
                            completed_practice_all += 1
            
            practice_ratio = (m_completed_practice / m_total_practice) if m_total_practice > 0 else 0.0

            # Weighting Logic
            if has_practice:
                # 40% Topics, 40% Submission, 20% Practice
                m_score = (topic_ratio * 0.4) + (sub_score * 0.4) + (practice_ratio * 0.2)
            else:
                # 50% Topics, 50% Submission
                m_score = (topic_ratio * 0.5) + (sub_score * 0.5)
            
            module_scores.append(m_score)

            # Status Update for this module
            m_status = "active"
            if total_topics_m > 0 and m_completed_topics == total_topics_m:
                if m_eval == "missing":
                    m_status = "action_required"
                elif m_eval is None:
                    m_status = "pending_review"
                elif m_eval == "Beginner":
                    m_status = "resubmit_required"
                elif m_eval == "Needs Improvement":
                    m_status = "needs_improvement"
            
            if status_map.get(m_status, 0) > current_priority:
                current_priority = status_map[m_status]
                roadmap_status = m_status
                if m_status in ["resubmit_required", "needs_improvement", "action_required"]:
                    bottleneck_module = m_num

        # Calculate Overall Percent
        avg_score = sum(module_scores) / total_modules if total_modules > 0 else 0
        percent = round(avg_score * 100)
        
        # Final Completion Check
        if percent >= 100 and roadmap_status not in ["resubmit_required", "needs_improvement"]:
            roadmap_status = "completed"
            # Trigger extraction if never done OR if it previously failed (retry trigger)
            if background_tasks and uid and (not r.get("skills_extracted") or r.get("skills_extraction_error")):
                background_tasks.add_task(extract_skills_from_roadmap, rid, uid)
            
        r["calculated_progress"] = {
            "percent": percent,
            "completed_topics": completed_topics_all,
            "total_topics": total_topics_all,
            "completed_submissions": completed_subs_all,
            "total_submissions": total_subs_all,
            "completed_resources": completed_practice_all,
            "total_resources": total_practice_all,
            "bottleneck_module": bottleneck_module
        }
        r["calculated_status"] = roadmap_status
    
    return roadmaps

@router.get("/roadmaps/me", response_model=List[RoadmapMe])
async def get_my_roadmaps(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    email = current_user.email
    uid = current_user.supabase_uid

    if not email:
        raise HTTPException(status_code=401, detail="Could not determine user email")

    sb = get_supabase_client()
    # Fetch roadmaps
    response = sb.table("roadmaps").select("*").eq("email", email).order("updated_at", desc=True).execute()
    
    enriched_data = await _enrich_roadmap_progress(response.data, email, uid, sb, background_tasks)
    
    results = []
    for r in enriched_data:
        results.append(RoadmapMe(
            id=r["id"],
            slug=r.get("slug", ""),
            title=r["title"],
            description=r["description"],
            roadmap_plan=_parse_roadmap_dict(r["roadmap_plan"]),
            subject=r["subject"],
            goal=r["goal"],
            time_value=r["time_value"],
            time_unit=r["time_unit"],
            model=r["model"],
            created_at=r["created_at"],
            updated_at=r["updated_at"],
            last_position=r.get("last_position", {"mIdx": 0, "tIdx": 0}),
            is_public=r.get("is_public", False),
            show_author=r.get("show_author", True),
            clone_count=r.get("clone_count", 0),
            report_count=r.get("report_count", 0),
            average_rating=float(r.get("average_rating") or 0.0),
            rating_count=r.get("rating_count", 0),
            cloned_from=r.get("cloned_from"),
            progress=r.get("calculated_progress"),
            status=r.get("calculated_status", "active")
        ))

    return results


@router.get("/roadmaps/by-slug/{slug}", response_model=RoadmapMe)
async def get_roadmap_by_slug(slug: str, background_tasks: BackgroundTasks, current_user: Optional[User] = Depends(get_optional_current_user)):
    sb = get_supabase_client()
    email = current_user.email if current_user else None
    uid = current_user.supabase_uid if current_user else None

    # Fetch all roadmaps matching this slug
    response = sb.table("roadmaps").select("*, email").eq("slug", slug).execute()

    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    # 1. If logged in, find the user's own version first
    r = None
    if email:
        user_version = next((item for item in response.data if item.get("email", "").lower() == email.lower()), None)
        if user_version:
            r = user_version

    # 2. Fallback: Find the original public version (the one that is public and NOT a clone, or just the first public one)
    if not r:
        public_version = next((item for item in response.data if item.get("is_public")), None)
        if public_version:
            r = public_version

    # 3. Last fallback: just take the first one if we really have to (e.g. searching private by slug while logged in)
    if not r:
        r = response.data[0]

    # Ownership or Public check
    is_owner = email and r["email"].lower() == email.lower()
    is_public = r.get("is_public", False)

    if not is_owner and not is_public:
        raise HTTPException(status_code=403, detail="Not authorized to view this roadmap")

    # Reuse enrichment logic if needed, but for a single roadmap we can simplify
    if uid:
        enriched = await _enrich_roadmap_progress([r], email, uid, sb, background_tasks)
        r = enriched[0]
    else:
        # For public view by crawlers/unauthenticated users, no progress enrichment needed
        pass

    # 4. Check if already cloned by this user
    is_cloned = False
    cloned_id = None
    user_rating = None
    if uid:
        if not is_owner:
            clone_check = sb.table("roadmaps").select("id").eq("email", email).eq("cloned_from", r["id"]).execute()
            if clone_check.data:
                is_cloned = True
                cloned_id = clone_check.data[0]["id"]
        
        # Fetch user's rating
        rating_res = sb.table("roadmap_ratings").select("rating").eq("roadmap_id", r["id"]).eq("user_id", uid).execute()
        if rating_res.data:
            user_rating = rating_res.data[0]["rating"]

    return RoadmapMe(
        id=r["id"],
        user_id=r.get("user_id"),
        title=r["title"],
        slug=r["slug"],
        description=r["description"],
        roadmap_plan=r["roadmap_plan"],
        subject=r.get("subject"),
        goal=r.get("goal"),
        time_value=r.get("time_value"),
        time_unit=r.get("time_unit"),
        model=r.get("model"),
        created_at=r["created_at"],
        updated_at=r["updated_at"],
        last_position=r.get("last_position") or {"mIdx": 0, "tIdx": 0},
        is_public=r.get("is_public", False),
        show_author=r.get("show_author", True),
        clone_count=r.get("clone_count", 0),
        report_count=r.get("report_count", 0),
        average_rating=float(r.get("average_rating") or 0.0),
        rating_count=r.get("rating_count", 0),
        cloned_from=r.get("cloned_from"),
        progress=r.get("calculated_progress"),
        status=r.get("calculated_status", "active"),
        email=r.get("email"),
        is_cloned=is_cloned,
        cloned_id=cloned_id,
        user_rating=user_rating
    )

@router.get("/roadmaps/{roadmap_id}", response_model=RoadmapMe)
async def get_roadmap_by_id(roadmap_id: int, background_tasks: BackgroundTasks, current_user: Optional[User] = Depends(get_optional_current_user)):

    email = current_user.email if current_user else None
    uid = current_user.supabase_uid if current_user else None

    sb = get_supabase_client()
    response = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
    
    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    r = response.data[0]
    
    # Ownership or Public check
    is_owner = email and r["email"].lower() == email.lower()
    is_public = r.get("is_public", False)
    
    if not is_owner and not is_public:
        if not email:
            raise HTTPException(status_code=401, detail="Authentication required to view this private roadmap")
        raise HTTPException(status_code=403, detail="Not authorized to view this roadmap")

    # Reuse enrichment logic if needed
    if uid:
        enriched = await _enrich_roadmap_progress([r], email, uid, sb, background_tasks)
        r = enriched[0]

    # 4. Check if already cloned by this user
    is_cloned = False
    cloned_id = None
    if uid and not is_owner:
        clone_check = sb.table("roadmaps").select("id").eq("email", email).eq("cloned_from", r["id"]).execute()
        if clone_check.data:
            is_cloned = True
            cloned_id = clone_check.data[0]["id"]

    return RoadmapMe(
        id=r["id"],
        slug=r.get("slug", ""),
        user_id=None,
        title=r["title"],
        description=r["description"],
        roadmap_plan=_parse_roadmap_dict(r["roadmap_plan"]),
        subject=r["subject"],
        goal=r["goal"],
        time_value=r["time_value"],
        time_unit=r["time_unit"],
        model=r["model"],
        created_at=r["created_at"],
        updated_at=r["updated_at"],
        last_position=r.get("last_position", {"mIdx": 0, "tIdx": 0}),
        is_public=r.get("is_public", False),
        show_author=r.get("show_author", True),
        clone_count=r.get("clone_count", 0),
        report_count=r.get("report_count", 0),
        cloned_from=r.get("cloned_from"),
        progress=r.get("calculated_progress"),
        status=r.get("calculated_status", "active"),
        email=r.get("email"),
        is_cloned=is_cloned,
        cloned_id=cloned_id
    )

@router.post("/roadmaps/save", response_model=RoadmapRead)
async def save_roadmap(
    roadmap_save: RoadmapSave,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    email = current_user.email
    if not email:
        raise HTTPException(status_code=401, detail="Missing user email")

    sb = get_supabase_client()
    
    # Check if a roadmap with this title and email already exists
    existing = sb.table("roadmaps").select("id").eq("email", email).eq("title", roadmap_save.title).execute()
    if existing.data:
        # Update existing roadmap
        roadmap_id = existing.data[0]["id"]
        response = sb.table("roadmaps").update({
            "description": roadmap_save.description,
            "roadmap_plan": roadmap_save.roadmap_plan,
            "subject": roadmap_save.subject,
            "goal": roadmap_save.goal,
            "time_value": roadmap_save.time_value,
            "time_unit": "weeks",
            "model": roadmap_save.model,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", roadmap_id).execute()
    else:
        # Create new roadmap
        title = roadmap_save.title or roadmap_save.subject or "Untitled Roadmap"
        slug = _generate_unique_slug(title, sb)
        
        response = sb.table("roadmaps").insert({
            "email": email,
            "title": title,
            "slug": slug,
            "description": roadmap_save.description,
            "roadmap_plan": roadmap_save.roadmap_plan,
            "subject": roadmap_save.subject,
            "goal": roadmap_save.goal,
            "time_value": roadmap_save.time_value,
            "time_unit": "weeks",
            "model": roadmap_save.model,
        }).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to save roadmap")
    
    new_roadmap = response.data[0]

    # 3. Send onboarding email (Delayed by 2 hours to avoid interrupting current session)
    async def delayed_onboarding():
        try:
            # Wait 2 hours (7200 seconds)
            await asyncio.sleep(7200)
            base = settings.FRONTEND_URL.rstrip("/")
            await send_onboarding_email(
                to=email,
                subject=roadmap_save.subject,
                goal=roadmap_save.goal,
                modules=roadmap_save.roadmap_plan.get("modules", []),
                unsubscribe_link=f"{base}/dashboard",
                roadmap_slug=new_roadmap["slug"],
                display_name=current_user.display_name
            )
        except Exception as e:
            logger.error(f"Failed to send delayed onboarding email: {e}")

    # Fire and forget the delayed email task
    asyncio.create_task(delayed_onboarding())

    return RoadmapRead(**new_roadmap)


def _generate_unique_slug(title: str, sb) -> str:
    """Generate a URL-friendly slug and ensure it is globally unique."""
    base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', title).lower().strip('-')
    if not base_slug:
        base_slug = "roadmap"

    # Check if slug exists anywhere in the DB
    res = sb.table("roadmaps").select("id").eq("slug", base_slug).execute()
    if not res.data:
        return base_slug

    # If it exists, we MUST append a suffix for NEW generation
    # Clones bypass this function and reuse the original slug directly.
    for _ in range(10):
        suffix = uuid.uuid4().hex[:6]
        new_slug = f"{base_slug}-{suffix}"
        res = sb.table("roadmaps").select("id").eq("slug", new_slug).execute()
        if not res.data:
            return new_slug

    return f"{base_slug}-{uuid.uuid4().hex[:12]}"
@router.post("/roadmaps/generate", response_model=RoadmapRead)
async def generate_roadmap(
    roadmap_create: RoadmapCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    user_email = current_user.email
    logger.info(f"User {user_email} generating roadmap for: {roadmap_create.subject} ({roadmap_create.goal})")
    
    # Validation guard for credits
    sb = get_supabase_client()
    res = sb.table("profiles").select("roadmap_credits").eq("email", user_email).execute()
    if not res.data or res.data[0].get("roadmap_credits", 0) <= 0:
        raise HTTPException(
            status_code=402,
            detail="Insufficient roadmap generation credits. Please purchase a credit."
        )
        
    # Deduct credit
    current_credits = res.data[0].get("roadmap_credits", 0)
    sb.table("profiles").update({"roadmap_credits": current_credits - 1}).eq("email", user_email).execute()

    # Validation guard
    if roadmap_create.time_value < 1 or roadmap_create.time_value > 8:
        raise HTTPException(
            status_code=400,
            detail="Duration must be between 1 and 8 weeks"
        )
    
    # Force 'weeks' as the only valid unit
    roadmap_create.time_unit = "weeks"

    email = current_user.email

    prior_experience_text = (
        f"- **Prior Experience:** \"{roadmap_create.prior_experience}\"\n"
        if roadmap_create.prior_experience
        else ""
    )

    prompt = f"""
You are an expert curriculum designer. Your task is to generate a structured learning roadmap in a specific JSON format.

**Strict Instructions:**
1.  **Output JSON ONLY:** The entire response must be a single, valid JSON object. Do not include any text, explanations, or markdown formatting before or after the JSON.
2.  **Adhere to the Schema:** The JSON structure must follow this exact schema:

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
                "subtopics": [
                  {{ "title": "string" }}
                ]
              }}
            ],
            "resources": [
              {{ "title": "string", "url": "string", "type": "video|docs|article" }}
            ]
          }}
        ]
      }}
    }}

**Roadmap Details:**
- **Subject:** "{roadmap_create.subject}"
- **Primary Goal:** "{roadmap_create.goal}"
{prior_experience_text}- **Target Duration:** {roadmap_create.time_value} {roadmap_create.time_unit}

**Resource Instructions:**
- For each module, include a "resources" array with 2-3 objects.
- Only include real, well-known free resources (e.g., MDN, official docs, freeCodeCamp, YouTube, etc.).
- Only include URLs you are certain exist.
- For each module, include a short `outcome` string that starts with "By the end of this module you will be able to..." describing the concrete skill gained that week.
- For each module, include `proof_of_work_instructions`. 
  - `what_to_build`: A highly concrete technical task (e.g. "Build a REST API with Express that handles GET and POST for a library app").
  - `what_counts_as_evidence`: Specific links or files (e.g. "GitHub repository link, a Loom video walkthrough, or a screenshot of your passing test suite").
  - `eval_criteria`: A list of 2-3 technical checkpoints the AI should look for (e.g. "Proper error handling for 404s", "Correct use of middleware").

Begin the JSON output immediately.
"""

    try:
        model_to_use = roadmap_create.model or settings.GEMINI_MODEL
        if not model_to_use.startswith("models/"):
            model_to_use = f"models/{model_to_use}"
        
        # Retry logic for JSON generation
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Use application/json for more reliable parsing
                generated_text = await generate_text(prompt, model=model_to_use, response_mime_type="application/json")

                # Robust JSON extraction
                cleaned_text = clean_json_string(generated_text)
                roadmap_data = json.loads(cleaned_text)
                break  # Success, exit retry loop
            except json.JSONDecodeError as jde:
                logger.warning(f"Attempt {attempt + 1} failed to parse JSON: {jde}. Text starts with: {generated_text[:200]}")
                if attempt == max_retries - 1:
                    raise Exception(f"Invalid JSON from AI after {max_retries} attempts: {str(jde)}")
                # Wait a bit before retry
                await asyncio.sleep(1)

        # Inject IDs
        for m_idx, module in enumerate(roadmap_data["roadmap_plan"]["modules"]):
            module["id"] = f"module_{m_idx + 1}"
            # Ensure an outcome field exists for frontend display
            if not module.get("outcome"):
                module["outcome"] = "By the end of this module you will be able to apply the listed topics and solve basic related problems."
            for t_idx, topic in enumerate(module.get("topics", [])):
                topic["id"] = f"topic_{m_idx + 1}_{t_idx + 1}"
                topic["uuid"] = str(uuid.uuid4())
                for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                    subtopic["id"] = str(uuid.uuid4())

        # Enriched with YouTube videos for each topic
        if settings.YOUTUBE_API_KEY:
            try:
                used_video_ids = set()
                for module in roadmap_data["roadmap_plan"]["modules"]:
                    for topic in module.get("topics", []):
                        # Fix 1: Better search queries using subtopic context
                        subtopic_context = " ".join([st.get("title", "") for st in topic.get("subtopics", [])[:2]])
                        search_query = f"{roadmap_create.subject} {topic['title']} {subtopic_context} tutorial"
                        results = await search_youtube_videos(search_query, max_results=5)
                        
                        # Fix 2: Deduplication + Relevance Check
                        # Keywords for relevance: topic title + subtopics
                        relevance_keywords = set(re.findall(r'\w+', f"{topic['title']} {subtopic_context}".lower()))
                        
                        chosen_video = None
                        for res in results:
                            # Skip if already used
                            if res["video_id"] in used_video_ids:
                                continue
                                
                            # Check relevance: at least one meaningful keyword in video title
                            video_title_lower = res["video_title"].lower()
                            is_relevant = any(kw in video_title_lower for kw in relevance_keywords if len(kw) >= 4)
                            
                            if is_relevant:
                                chosen_video = res
                                used_video_ids.add(res["video_id"])
                                break
                        
                        if chosen_video:
                            topic["youtube_video_id"] = chosen_video["video_id"]
                            topic["youtube_video_title"] = chosen_video["video_title"]
                            topic["duration"] = chosen_video["duration_minutes"]
                        else:
                            # Fallback if no relevant or unique found (unlikely)
                            if results:
                                topic["youtube_video_id"] = results[0]["video_id"]
                                topic["youtube_video_title"] = results[0]["video_title"]
                                topic["duration"] = results[0]["duration_minutes"]
                            else:
                                topic["youtube_video_id"] = None
                                topic["youtube_video_title"] = None
                                topic["duration"] = None
                        
                        # Sequential search with small delay to avoid hitting quota/rate limits too fast
                        await asyncio.sleep(0.1)
            except Exception as e:
                logger.error(f"Failed to enrich roadmap with YouTube videos: {e}")

    except Exception as e:
        logger.error(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate roadmap")

    # If email available, save and send email
    if email:
        try:
            sb = get_supabase_client()
            # 1. Save to roadmaps
            title = roadmap_data.get("title", roadmap_create.subject)
            slug = _generate_unique_slug(title, sb)
            
            r_res = sb.table("roadmaps").insert({
                "title": title,
                "slug": slug,
                "description": roadmap_data.get("description", ""),
                "depth_score": roadmap_data.get("depth_score", 1.0),
                "roadmap_plan": roadmap_data["roadmap_plan"],
                "subject": roadmap_create.subject,
                "goal": roadmap_create.goal,
                "time_value": roadmap_create.time_value,
                "time_unit": roadmap_create.time_unit,
                "model": roadmap_create.model,
                "email": email
            }).execute()
            
            if r_res.data:
                # 4. Delayed Email (2 hours)
                async def delayed_onboarding_gen():
                    try:
                        await asyncio.sleep(7200)
                        await send_onboarding_email(
                            to=email,
                            subject=roadmap_create.subject,
                            goal=roadmap_create.goal,
                            modules=roadmap_data["roadmap_plan"]["modules"],
                            unsubscribe_link=f"{settings.FRONTEND_URL}/dashboard",
                            roadmap_slug=r_res.data[0]["slug"],
                            display_name=current_user.display_name
                        )
                    except Exception as e:
                        logger.error(f"Failed to send delayed generated onboarding: {e}")

                asyncio.create_task(delayed_onboarding_gen())

                # Return the actual saved record
                return RoadmapRead(**r_res.data[0])
        except Exception as e:
            logger.error(f"Failed to auto-save/email: {e}")

    # Fallback for transient generation (if saving failed or was skipped)
    title = roadmap_data.get("title", roadmap_create.subject)
    return RoadmapRead(
        id=0, # Use 0 to indicate transient
        user_id=None,
        title=title,
        slug=f"transient-{uuid.uuid4().hex[:8]}",
        description=roadmap_data.get("description", ""),
        roadmap_plan=roadmap_data["roadmap_plan"],
        subject=roadmap_create.subject,
        goal=roadmap_create.goal,
        time_value=roadmap_create.time_value,
        time_unit=roadmap_create.time_unit,
        model=roadmap_create.model,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

@router.post("/roadmaps/rebuild", response_model=RoadmapRead)
async def rebuild_roadmap_for_reengagement(
    payload: ReengagementRebuild,
    current_user: User = Depends(get_current_user)
):
    """Rebuild a roadmap with aggressive simplification for long-gap re-engagement."""
    roadmap_id = payload.roadmap_id
    current_module = payload.current_module
    email = current_user.email

    sb = get_supabase_client()
    
    # Verify ownership - only select necessary fields to keep context lean
    r_res = sb.table("roadmaps").select("id, email, subject, goal").eq("id", roadmap_id).execute()
    if not r_res.data or len(r_res.data) == 0 or r_res.data[0]["email"].lower() != email.lower():
        raise HTTPException(status_code=403, detail="Not authorized")

    roadmap = r_res.data[0]
    
    # Prompt for Gemini with long-gap context
    prompt = f"""Regenerate a structured roadmap_plan JSON for the subject '{roadmap.get('subject')}' and goal '{roadmap.get('goal')}'.
CONTEXT: The user is returning after a LONG GAP (21+ days). They were at module {current_module}.
TASK: Produce an AGGRESSIVELY SIMPLIFIED, actionable, and re-scoped 'roadmap_plan' JSON.
STRATEGY: 
1. The first module MUST be a "Quick Win" (completable in 20-30 mins).
2. Focus on core high-impact topics only.
3. Keep the overall plan to 4-5 focused modules.

**Strict Instructions:**
1.  **Output JSON ONLY:** The entire response must be a single, valid JSON object.
2.  **Adhere to this Schema:**
    ```json
    {{
      "roadmap_plan": {{
        "modules": [
          {{
            "title": "string",
            "outcome": "string",
            "timeline": "string",
            "topics": [{{ "title": "string" }}],
            "resources": [{{ "title": "string", "url": "string", "type": "video|docs|article" }}]
          }}
        ]
      }}
    }}
    ```
Begin the JSON output immediately.
"""
    try:
        try:
            generated_text = await generate_text(prompt, model=settings.GEMINI_MODEL, response_mime_type="application/json")
        except Exception:
            # Fallback to lite model if main model fails
            logger.warning(f"{settings.GEMINI_MODEL} failed, falling back to Flash Lite for rebuild.")
            generated_text = await generate_text(prompt, model="models/gemini-flash-lite-latest", response_mime_type="application/json")
        
        # Robust JSON extraction
        roadmap_data = None
        try:
            cleaned_text = clean_json_string(generated_text)
            roadmap_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            match = re.search(r"(\{.*\})", generated_text, re.DOTALL)
            if match:
                try:
                    roadmap_data = json.loads(match.group(1))
                except json.JSONDecodeError:
                    raise Exception("Invalid JSON from AI during rebuild")
            else:
                raise Exception("Invalid JSON from AI during rebuild")

        new_plan = roadmap_data.get("roadmap_plan") or roadmap_data
        
        # Verify and log module count for AI constraint check
        modules_count = len(new_plan.get("modules", []))
        logger.info(f"Gemini rebuild returned {modules_count} modules for roadmap {roadmap_id}")
        
        # Inject IDs
        for m_idx, module in enumerate(new_plan["modules"]):
            module["id"] = f"module_{m_idx + 1}"
            if not module.get("outcome"):
                module["outcome"] = "By the end of this module you will be able to apply the listed topics and solve basic related problems."
            for t_idx, topic in enumerate(module.get("topics", [])):
                topic["id"] = f"topic_{m_idx + 1}_{t_idx + 1}"
                topic["uuid"] = str(uuid.uuid4())
                for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                    if not subtopic.get("id"):
                        subtopic["id"] = str(uuid.uuid4())

        # YouTube enrichment
        if settings.YOUTUBE_API_KEY:
            try:
                used_video_ids = set()
                for module in new_plan["modules"]:
                    for topic in module.get("topics", []):
                        # Fix 1: Better search queries using subtopic context
                        subtopic_context = " ".join([st.get("title", "") for st in topic.get("subtopics", [])[:2]])
                        search_query = f"{roadmap.get('subject')} {topic['title']} {subtopic_context} tutorial"
                        results = await search_youtube_videos(search_query, max_results=5)
                        
                        # Fix 2: Deduplication + Relevance Check
                        relevance_keywords = set(re.findall(r'\w+', f"{topic['title']} {subtopic_context}".lower()))
                        
                        chosen_video = None
                        for res in results:
                            if res["video_id"] in used_video_ids:
                                continue
                                
                            video_title_lower = res["video_title"].lower()
                            is_relevant = any(kw in video_title_lower for kw in relevance_keywords if len(kw) >= 4)
                            
                            if is_relevant:
                                chosen_video = res
                                used_video_ids.add(res["video_id"])
                                break
                        
                        if chosen_video:
                            topic["youtube_video_id"] = chosen_video["video_id"]
                            topic["youtube_video_title"] = chosen_video["video_title"]
                            topic["duration"] = chosen_video["duration_minutes"]
                        else:
                            # Fallback if no relevant or unique found
                            if results:
                                topic["youtube_video_id"] = results[0]["video_id"]
                                topic["youtube_video_title"] = results[0]["video_title"]
                                topic["duration"] = results[0]["duration_minutes"]
                            else:
                                topic["youtube_video_id"] = None
                                topic["youtube_video_title"] = None
                                topic["duration"] = None
                        
                        # Sequential search with small delay
                        await asyncio.sleep(0.1)
            except Exception as e:
                logger.error(f"Failed to enrich rebuilt roadmap with YouTube videos: {e}")
        sb.table("roadmaps").update({
            "roadmap_plan": new_plan,
            "last_position": {"mIdx": 0, "tIdx": 0}, # Reset position to start of new plan
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", roadmap_id).execute()

        # Mark re-engagement as successfully handled in profile metadata
        profile_res = sb.table("profiles").select("metadata").eq("supabase_uid", current_user.supabase_uid).execute()
        if profile_res.data:
            meta = profile_res.data[0].get("metadata") or {}
            meta["reengagement_paused_until"] = (datetime.now(timezone.utc) + timedelta(days=8)).isoformat()
            meta["last_reengagement_seen_at"] = datetime.now(timezone.utc).isoformat()
            sb.table("profiles").update({"metadata": meta}).eq("supabase_uid", current_user.supabase_uid).execute()

        # Fetch fresh record to ensure all fields (including updated_at) are present for RoadmapRead
        updated_res = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
        if not updated_res.data:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated roadmap")
            
        return RoadmapRead(**updated_res.data[0])

    except Exception as e:
        logger.error(f"Rebuild failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to rebuild roadmap")

@router.post("/roadmaps/{roadmap_id}/progress")
async def update_learning_progress(
    roadmap_id: int,
    payload: ProgressUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current position and optionally mark a topic as completed."""
    module_number = payload.module_number
    topic_index = payload.topic_index
    completed = payload.completed
    email = current_user.email

    sb = get_supabase_client()
    
    # Verify ownership or public access
    r_res = sb.table("roadmaps").select("email, roadmap_plan, is_public").eq("id", roadmap_id).execute()
    if not r_res.data or len(r_res.data) == 0:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap_data = r_res.data[0]
    roadmap_owner_email = roadmap_data.get("email") or ""
    is_public = roadmap_data.get("is_public", False)
    is_owner = roadmap_owner_email.lower() == email.lower()

    if not is_owner and not is_public:
        raise HTTPException(status_code=403, detail="Not authorized")

    if is_owner:
        # 1. Update current position in roadmaps (JSONB field)
        sb.table("roadmaps").update({
            "last_position": {"mIdx": module_number - 1, "tIdx": topic_index}
        }).eq("id", roadmap_id).execute()

    # 3. If completed, mark topic as finished in module_progress
    if completed:
        try:
            res = sb.table("module_progress").upsert({
                "roadmap_id": roadmap_id,
                "user_email": email,
                "module_number": module_number,
                "topic_index": topic_index,
                "completed": True,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }, on_conflict="roadmap_id,user_email,module_number,topic_index").execute()
            logger.info(f"Progress upserted for {email}: Road:{roadmap_id} Mod:{module_number} Top:{topic_index}")
        except Exception as e:
            logger.error(f"Failed to upsert module progress for {email}: {e}")
            raise HTTPException(status_code=500, detail="Database update failed")

        # Check if all topics in this module are now complete
        try:
            roadmap = r_res.data[0]
            plan = _parse_roadmap_dict(roadmap.get("roadmap_plan", {}))
            modules = plan.get("modules", [])
            if 0 <= module_number - 1 < len(modules):
                module = modules[module_number - 1]
                total_topics_in_module = len(module.get("topics", []))
                
                # Fetch completed topics for this module
                comp_resp = sb.table("module_progress") \
                    .select("topic_index") \
                    .eq("roadmap_id", roadmap_id) \
                    .eq("user_email", email) \
                    .eq("module_number", module_number) \
                    .eq("completed", True) \
                    .execute()
                
                completed_indices = {r["topic_index"] for r in comp_resp.data}
                if len(completed_indices) >= total_topics_in_module:
                    # Award coins for completing all topics
                    await award_coins(
                        email, 
                        EulerCoins.COMPLETE_ALL_TOPICS, 
                        f"Completed all topics in '{module.get('title')}'", 
                        roadmap_id=roadmap_id
                    )
                    return {"status": "ok", "milestone_reached": "module_completed", "coins_earned": EulerCoins.COMPLETE_ALL_TOPICS}
        except Exception as e:
            logger.error(f"Failed to check all-topics-complete or award coins: {e}")

    return {"status": "ok", "milestone_reached": None, "coins_earned": 0}


@router.get("/roadmaps/{roadmap_id}/progress")
async def get_learning_progress(roadmap_id: int, current_user: User = Depends(get_current_user)):
    """Get all completed topics for this roadmap."""
    sb = get_supabase_client()
    res = sb.table("module_progress").select("module_number, topic_index").eq("roadmap_id", roadmap_id).eq("user_email", current_user.email).eq("completed", True).execute()
    return {"completed_topics": res.data}


@router.post("/roadmaps/{roadmap_id}/progress/reset")
async def reset_learning_progress(roadmap_id: int, current_user: User = Depends(get_current_user)):
    """Reset position and all topic completions for this roadmap."""
    email = current_user.email
    sb = get_supabase_client()
    
    # Verify ownership or public access
    r_res = sb.table("roadmaps").select("email, is_public").eq("id", roadmap_id).execute()
    if not r_res.data or len(r_res.data) == 0:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap_data = r_res.data[0]
    roadmap_owner_email = roadmap_data.get("email") or ""
    is_public = roadmap_data.get("is_public", False)
    is_owner = roadmap_owner_email.lower() == email.lower()

    if not is_owner and not is_public:
        raise HTTPException(status_code=403, detail="Not authorized")

    if is_owner:
        # 1. Reset position in roadmaps
        sb.table("roadmaps").update({
            "last_position": {"mIdx": 0, "tIdx": 0}
        }).eq("id", roadmap_id).execute()

    # 3. Clear module_progress for this user for this roadmap (always done if we allowed them in)
    sb.table("module_progress").delete().eq("roadmap_id", roadmap_id).eq("user_email", email).execute()
    return {"status": "ok"}


@router.delete("/roadmaps/{roadmap_id}")
async def delete_roadmap(roadmap_id: int, current_user: User = Depends(get_current_user)):
    """Delete a roadmap (only the owner can delete)."""
    email = current_user.email
    sb = get_supabase_client()
    
    # Verify roadmap exists and user owns it
    try:
        r_res = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
        if not r_res.data or len(r_res.data) == 0:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        
        roadmap = r_res.data[0]
        if roadmap.get("email", "").lower() != email.lower():
            raise HTTPException(status_code=403, detail="Not authorized to delete this roadmap")
        
        # 1. Cleanup technical identity (recalculate/delete skills) before the cascade wipes the data
        if current_user.supabase_uid:
            from app.services.skills_service import cleanup_skills_after_roadmap_deletion
            await cleanup_skills_after_roadmap_deletion(roadmap_id, current_user.supabase_uid)

        # 2. Delete roadmap (cascade will delete submissions, module_progress, personal_notes)
        sb.table("roadmaps").delete().eq("id", roadmap_id).execute()
        
        return {"status": "ok", "message": "Roadmap deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting roadmap: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete roadmap")
