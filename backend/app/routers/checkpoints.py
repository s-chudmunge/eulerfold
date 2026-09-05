import logging
import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks

from app.core.supabase_client import get_supabase_client
from app.core.auth import get_current_user
from app.schemas import User
from app.checkpoint_schemas import (
    CheckpointRequest,
    CheckpointItem,
    CheckpointEvaluateRequest,
    CheckpointEvaluateResponse,
    UnlockNextTopicRequest,
    UnlockNextTopicResponse
)
from app.services.checkpoints_service import (
    fetch_cached_checkpoint,
    generate_new_checkpoint,
    adjust_user_skill_for_checkpoint
)
from app.utils.eulercoins import award_coins
from app.utils.streaks import track_activity
from app.core.config import settings
from app.utils.ai_client import robust_json_loads

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/checkpoints", tags=["checkpoints"])


@router.post("/get-or-generate", response_model=CheckpointItem)
async def get_or_generate_checkpoint(
    req: CheckpointRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate or retrieve a 30-second conceptual micro-checkpoint for the topic.
    Checks vector cache first unless this is a remedial retry with previous_attempt context.
    """
    sb = get_supabase_client()
    uid = current_user.supabase_uid

    # 1. Return this learner's completed checkpoint when revisiting a topic.
    # It is read-only in the UI and lets them review the exact question answered.
    try:
        completed_res = (
            sb.table("topic_checkpoints")
            .select("id, question_data")
            .eq("roadmap_id", req.roadmap_id)
            .eq("user_email", current_user.email)
            .eq("module_number", req.module_number)
            .eq("topic_index", req.topic_index)
            .eq("is_correct", True)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if completed_res.data:
            saved = completed_res.data[0]
            question_data = saved.get("question_data") or {}
            if question_data.get("question") and question_data.get("options"):
                return CheckpointItem(
                    id=f"review_{saved['id']}",
                    archetype=question_data.get("archetype", "concept_application"),
                    question=question_data["question"],
                    code_snippet=question_data.get("code_snippet"),
                    options=question_data["options"],
                    correct_index=question_data.get("correct_index", 0),
                    explanation=question_data.get("explanation", "") or "Review the correct answer below.",
                    concept_key=question_data.get("concept_key", "core_concept")
                )
    except Exception as review_err:
        logger.warning(f"Completed checkpoint lookup skipped: {review_err}")

    # 2. Check curated vector cache (for normal or remedial attempt)
    cached = await fetch_cached_checkpoint(
        sb=sb,
        subject=req.subject,
        topic_title=req.topic_title,
        roadmap_id=req.roadmap_id,
        module_number=req.module_number,
        topic_index=req.topic_index,
        roadmap_slug=req.roadmap_slug,
        previous_attempt=req.previous_attempt
    )
    if cached:
        return CheckpointItem(**cached)

    # 3. Acquire topic lock to prevent duplicate parallel AI calls
    lock_key = f"{(req.roadmap_slug or req.subject).lower().strip()}::{req.topic_title.lower().strip()}"
    from app.services.checkpoints_service import _inflight_generation_locks, _inflight_dict_lock

    async with _inflight_dict_lock:
        if lock_key not in _inflight_generation_locks:
            _inflight_generation_locks[lock_key] = asyncio.Lock()
        topic_lock = _inflight_generation_locks[lock_key]

    async with topic_lock:
        # Re-check cache inside lock in case parallel request finished generating it
        cached_after_wait = await fetch_cached_checkpoint(
            sb=sb,
            subject=req.subject,
            topic_title=req.topic_title,
            roadmap_id=req.roadmap_id,
            module_number=req.module_number,
            topic_index=req.topic_index,
            roadmap_slug=req.roadmap_slug,
            previous_attempt=req.previous_attempt
        )
        if cached_after_wait:
            return CheckpointItem(**cached_after_wait)

        # 3. Generate via AI (with learner remediation context if previous_attempt provided)
        checkpoint_dict = await generate_new_checkpoint(
            sb=sb,
            uid=uid,
            roadmap_id=req.roadmap_id,
            module_number=req.module_number,
            topic_index=req.topic_index,
            subject=req.subject,
            topic_title=req.topic_title,
            subtopics=req.subtopics,
            learner_level=req.learner_level,
            previous_attempt=req.previous_attempt,
            roadmap_slug=req.roadmap_slug
        )
        return CheckpointItem(**checkpoint_dict)


@router.post("/evaluate-and-adapt", response_model=CheckpointEvaluateResponse)
async def evaluate_and_adapt(
    req: CheckpointEvaluateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Evaluate user's answer:
    - Correct: Award 1 coin, mark topic complete, adjust skill score by +0.5.
    - Incorrect: Reduce skill score by 0.1, generate an adaptive retry checkpoint mentioning the mistake.
    """
    email = current_user.email
    uid = current_user.supabase_uid
    sb = get_supabase_client()

    is_correct = (req.selected_option == req.correct_index)

    if is_correct:
        # 1. Award 1 EulerCoin
        try:
            await award_coins(
                email,
                1,
                f"Topic Checkpoint: {req.topic_title} (Correct)",
                roadmap_id=req.roadmap_id
            )
        except Exception as e:
            logger.warning(f"Failed to award checkpoint coin: {e}")

        # 2. Mark topic completed in module_progress
        try:
            check = sb.table("module_progress").select("id").eq("roadmap_id", req.roadmap_id).eq("user_email", email).eq("module_number", req.module_number).eq("topic_index", req.topic_index).execute()
            if not check.data:
                sb.table("module_progress").insert({
                    "roadmap_id": req.roadmap_id,
                    "user_email": email,
                    "module_number": req.module_number,
                    "topic_index": req.topic_index,
                    "completed": True,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }).execute()
                background_tasks.add_task(track_activity, email)

            # Update last_position on roadmap table if user owns or learns it
            roadmap_res = sb.table("roadmaps").select("email").eq("id", req.roadmap_id).execute()
            if roadmap_res.data and roadmap_res.data[0]["email"].lower() == email.lower():
                sb.table("roadmaps").update({
                    "last_position": {"mIdx": req.module_number - 1, "tIdx": req.topic_index}
                }).eq("id", req.roadmap_id).execute()
        except Exception as prog_err:
            logger.error(f"Error marking topic progress from checkpoint: {prog_err}")

        # Keep the answered checkpoint for read-only review on later visits.
        try:
            sb.table("topic_checkpoints").insert({
                "roadmap_id": req.roadmap_id,
                "user_email": email,
                "module_number": req.module_number,
                "topic_index": req.topic_index,
                "topic_title": req.topic_title,
                "question_data": {
                    "archetype": "concept_application",
                    "question": req.question,
                    "options": req.options,
                    "correct_index": req.correct_index,
                    "explanation": req.explanation,
                    "concept_key": req.concept_key or "core_concept"
                },
                "selected_option": req.selected_option,
                "is_correct": True
            }).execute()
        except Exception as review_save_err:
            logger.warning(f"Failed to save completed checkpoint for review: {review_save_err}")

        # 3. Increment skill score by +0.5
        if uid:
            background_tasks.add_task(adjust_user_skill_for_checkpoint, sb, uid, req.roadmap_id, 0.5)

        return CheckpointEvaluateResponse(
            is_correct=True,
            coins_earned=1,
            feedback="Spot on! You've got this principle down.",
            explanation=req.explanation,
            retry_checkpoint=None
        )
    else:
        # Incorrect answer:
        # 1. Reduce skill score by 0.1
        if uid:
            background_tasks.add_task(adjust_user_skill_for_checkpoint, sb, uid, req.roadmap_id, -0.1)

        # 2. Generate a follow-up retry checkpoint mentioning the earlier wrong answer
        selected_choice = ""
        if 0 <= req.selected_option < len(req.options):
            selected_choice = req.options[req.selected_option]

        prev_attempt_payload = {
            "question": req.question or f"Concept check for {req.topic_title}",
            "selected_choice": selected_choice,
            "explanation": req.explanation
        }

        # Keep unsuccessful attempts so two failed checks can trigger a bridge.
        try:
            sb.table("topic_checkpoints").insert({
                "roadmap_id": req.roadmap_id, "user_email": email,
                "module_number": req.module_number, "topic_index": req.topic_index,
                "topic_title": req.topic_title,
                "question_data": {"question": req.question, "options": req.options,
                                  "correct_index": req.correct_index, "explanation": req.explanation,
                                  "concept_key": req.concept_key or "core_concept"},
                "selected_option": req.selected_option, "is_correct": False,
                "pace_assessment": "standard"
            }).execute()
            failed_res = sb.table("topic_checkpoints").select("id").eq("roadmap_id", req.roadmap_id).eq("user_email", email).eq("module_number", req.module_number).eq("topic_index", req.topic_index).eq("is_correct", False).eq("pace_assessment", "standard").execute()
            failed_attempts = len(failed_res.data or [])
        except Exception as attempt_err:
            logger.warning(f"Failed to record checkpoint attempt: {attempt_err}")
            failed_attempts = 0

        if failed_attempts >= 2:
            from app.utils.youtube_client import search_youtube_videos
            try:
                roadmap_res = sb.table("roadmaps").select("roadmap_plan, subject, title").eq("id", req.roadmap_id).execute()
                roadmap_plan = (roadmap_res.data or [{}])[0].get("roadmap_plan", {})
                if isinstance(roadmap_plan, str):
                    roadmap_plan = robust_json_loads(roadmap_plan)
                modules = roadmap_plan.get("modules", [])
                module = modules[req.module_number - 1]
                
                # Prevent bridge recursion: don't create a bridge for a bridge
                current_topic = module.get("topics", [])[req.topic_index] if 0 <= req.topic_index < len(module.get("topics", [])) else {}
                if not current_topic.get("is_bridge"):
                    existing_bridge_index = next((index for index, topic in enumerate(module.get("topics", [])) if topic.get("is_bridge") and topic.get("bridge_for", {}).get("module_number") == req.module_number and topic.get("bridge_for", {}).get("topic_index") == req.topic_index), None)
                    if existing_bridge_index is not None:
                        return CheckpointEvaluateResponse(is_correct=False, coins_earned=0, feedback="Return to your foundation review before retrying this concept.", explanation=req.explanation, bridge_topic=module["topics"][existing_bridge_index], bridge_module_number=req.module_number, bridge_topic_index=existing_bridge_index)
                    bridge_title = f"Bridge: {req.topic_title} Foundations"
                    bridge_search_q = f"{req.topic_title} basics"
                    bridge_topic = {
                        "title": bridge_title,
                        "subtopics": ["Review the idea behind the missed concept before retrying it."],
                        "youtube_search_query": bridge_search_q,
                        "resources": [],
                        "is_bridge": True,
                        "bridge_for": {"module_number": req.module_number, "topic_index": req.topic_index, "topic_title": req.topic_title}
                    }
                    # Search with clean topic title so 'Bridge:' prefix doesn't penalize educational matching
                    results = await search_youtube_videos(bridge_search_q, max_results=1, topic_title=req.topic_title, subject_context=req.subject)
                    if not results:
                        results = await search_youtube_videos(f"{req.subject} {req.topic_title}", max_results=1, topic_title=req.topic_title, subject_context=req.subject)
                    if results:
                        bridge_topic.update({"youtube_video_id": results[0]["video_id"], "youtube_video_title": results[0]["video_title"], "duration": results[0]["duration_minutes"]})
                    module.setdefault("topics", []).append(bridge_topic)
                    bridge_topic_index = len(module["topics"]) - 1
                    sb.table("roadmaps").update({"roadmap_plan": roadmap_plan}).eq("id", req.roadmap_id).execute()
                    sb.table("topic_checkpoints").update({"pace_assessment": "bridge_assigned"}).eq("roadmap_id", req.roadmap_id).eq("user_email", email).eq("module_number", req.module_number).eq("topic_index", req.topic_index).eq("is_correct", False).eq("pace_assessment", "standard").execute()
                    return CheckpointEvaluateResponse(is_correct=False, coins_earned=0, feedback="This concept needs a short foundation review before you retry it.", explanation=req.explanation, bridge_topic=bridge_topic, bridge_module_number=req.module_number, bridge_topic_index=bridge_topic_index)
            except Exception as bridge_err:
                logger.error(f"Failed to create checkpoint bridge: {bridge_err}")

        # A retry must respond to this learner's specific wrong answer, so do
        # not substitute a general cached question here.
        retry_dict = await generate_new_checkpoint(
            sb=sb, uid=uid, roadmap_id=req.roadmap_id,
            module_number=req.module_number, topic_index=req.topic_index,
            subject=req.subject, topic_title=req.topic_title,
            previous_attempt=prev_attempt_payload, roadmap_slug=req.roadmap_slug
        )
        retry_item = CheckpointItem(**retry_dict)

        return CheckpointEvaluateResponse(
            is_correct=False,
            coins_earned=0,
            feedback=f"Not quite. {req.explanation}",
            explanation=req.explanation,
            retry_checkpoint=retry_item
        )


@router.post("/unlock-next-topic", response_model=UnlockNextTopicResponse)
async def unlock_next_topic(
    req: UnlockNextTopicRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Just-in-time topic unlock and video curation as the learner advances.
    Ensures the next topic has a vetted video and provides warm human tutor context.
    """
    from app.utils.youtube_client import search_youtube_videos
    sb = get_supabase_client()

    roadmap_res = sb.table("roadmaps").select("roadmap_plan, subject, title").eq("id", req.roadmap_id).execute()
    if not roadmap_res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap_data = roadmap_res.data[0]
    roadmap_plan = roadmap_data.get("roadmap_plan", {})
    if isinstance(roadmap_plan, str):
        roadmap_plan = robust_json_loads(roadmap_plan)

    modules = roadmap_plan.get("modules", [])

    if req.target_module_number is not None and req.target_topic_index is not None:
        next_m_idx = req.target_module_number - 1
        next_t_idx = req.target_topic_index
    else:
        current_m_idx = req.module_number - 1
        current_t_idx = req.topic_index

        next_m_idx = current_m_idx
        next_t_idx = current_t_idx + 1

        current_module = modules[current_m_idx] if 0 <= current_m_idx < len(modules) else None
        if not current_module:
            return UnlockNextTopicResponse(has_next=False, module_number=req.module_number, topic_index=req.topic_index, tutor_note="You have completed all lessons in this course.")

        topics = current_module.get("topics", [])
        if next_t_idx >= len(topics):
            next_m_idx += 1
            next_t_idx = 0

    if next_m_idx >= len(modules) or next_m_idx < 0:
        return UnlockNextTopicResponse(
            has_next=False,
            module_number=req.module_number,
            topic_index=req.topic_index,
            tutor_note="Congratulations! You have completed every milestone in this roadmap."
        )

    target_module = modules[next_m_idx]
    target_topics = target_module.get("topics", [])
    if next_t_idx >= len(target_topics) or next_t_idx < 0:
        return UnlockNextTopicResponse(
            has_next=False,
            module_number=req.module_number,
            topic_index=req.topic_index,
            tutor_note="Topic not found."
        )

    next_topic = target_topics[next_t_idx]

    # Just-In-Time video curation
    if not next_topic.get("youtube_video_id") and settings.YOUTUBE_API_KEY:
        try:
            core_subject = req.subject or roadmap_data.get("subject", "") or roadmap_data.get("title", "")
            raw_q = next_topic.get("youtube_search_query") or next_topic.get("title", "")
            search_q = f"{core_subject} {raw_q}" if core_subject.lower() not in raw_q.lower() else raw_q

            results = await search_youtube_videos(
                search_q,
                max_results=1,
                topic_title=next_topic.get("title", ""),
                subject_context=core_subject
            )
            if results:
                next_topic["youtube_video_id"] = results[0]["video_id"]
                next_topic["youtube_video_title"] = results[0]["video_title"]
                next_topic["duration"] = results[0]["duration_minutes"]

                sb.table("roadmaps").update({"roadmap_plan": roadmap_plan}).eq("id", req.roadmap_id).execute()
        except Exception as yt_err:
            logger.error(f"JIT video curation failed for next topic: {yt_err}")

    return UnlockNextTopicResponse(
        has_next=True,
        module_number=next_m_idx + 1,
        topic_index=next_t_idx,
        topic=next_topic,
        tutor_note="Nice work. Here is your next lesson.",
        is_bridge=False
    )
