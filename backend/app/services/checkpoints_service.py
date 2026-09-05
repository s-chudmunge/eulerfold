import json
import logging
import uuid
import asyncio
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, timezone

import httpx

from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.utils.ai_client import generate_text, robust_json_loads, log_backend_ai_usage
from app.utils.eulercoins import award_coins
from app.utils.streaks import track_activity
from app.utils.scoring import get_letter_grade

logger = logging.getLogger(__name__)

# Locks for in-flight checkpoint generation to avoid duplicate concurrent AI calls for the same topic
_inflight_generation_locks: Dict[str, asyncio.Lock] = {}
_inflight_dict_lock = asyncio.Lock()

async def fetch_cached_checkpoint(
    sb,
    subject: str,
    topic_title: str,
    roadmap_id: int,
    module_number: int,
    topic_index: int,
    roadmap_slug: Optional[str] = None,
    previous_attempt: Optional[Dict[str, Any]] = None
) -> Optional[Dict[str, Any]]:
    """Look up cached checkpoint by vector embedding of slug/subject, topic title, and remedial attempt if present."""
    if not settings.GEMINI_API_KEY:
        return None

    # Use normalized slug (e.g. "python-programming-basics") or fall back to subject
    prefix = roadmap_slug.replace('-', ' ').strip() if roadmap_slug else subject.strip()
    search_target = f"{prefix} - {topic_title}".strip()

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "model": "models/gemini-embedding-2",
            "outputDimensionality": 768,
            "content": {"parts": [{"text": search_target}]}
        }
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                embedding_vector = res.json().get('embedding', {}).get('values')
                if embedding_vector:
                    rpc_res = sb.rpc(
                        "match_curated_checkpoints",
                        {
                            "query_embedding": embedding_vector,
                            "match_threshold": 0.90,
                            "match_count": 10
                        }
                    ).execute()
                    if rpc_res.data:
                        # Exclude previous question so the learner gets an alternative question from this topic pool
                        prev_q = (previous_attempt.get("question") or "").strip().lower() if previous_attempt else ""
                        candidates = rpc_res.data
                        if prev_q:
                            candidates = [c for c in candidates if (c.get("question_data", {}).get("question") or "").strip().lower() != prev_q]

                        if candidates:
                            cached = candidates[0]
                            q_data = cached.get("question_data", {})
                            logger.info(f"Curated Checkpoint Hit! '{search_target}' -> '{cached['topic_title']}' (similarity: {cached['similarity']:.2f})")
                            return {
                                "id": f"cp_{roadmap_id}_{module_number}_{topic_index}_{uuid.uuid4().hex[:6]}",
                                "archetype": q_data.get("archetype", "concept_application"),
                                "question": q_data.get("question", f"Quick check for {topic_title}"),
                                "code_snippet": q_data.get("code_snippet"),
                                "options": q_data.get("options", ["True", "False"]),
                                "correct_index": q_data.get("correct_index", 0),
                                "explanation": q_data.get("explanation", "Good job checking your understanding."),
                                "concept_key": q_data.get("concept_key", cached.get("concept_key", "core_concept"))
                            }
    except Exception as cache_err:
        logger.warning(f"Checkpoint cache lookup skipped: {cache_err}")

    return None


async def generate_new_checkpoint(
    sb,
    uid: Optional[str],
    roadmap_id: int,
    module_number: int,
    topic_index: int,
    subject: str,
    topic_title: str,
    subtopics: List[str] = [],
    learner_level: Optional[str] = "beginner",
    previous_attempt: Optional[Dict[str, Any]] = None,
    roadmap_slug: Optional[str] = None
) -> Dict[str, Any]:
    """Generate a conceptual micro-checkpoint using AI. Mentions previous wrong answer if learner failed prior attempt."""
    subtopics_text = ", ".join(subtopics) if subtopics else topic_title

    remedial_context = ""
    if previous_attempt:
        prev_q = previous_attempt.get("question", "")
        prev_wrong_choice = previous_attempt.get("selected_choice", "")
        prev_explanation = previous_attempt.get("explanation", "")
        remedial_context = f"""
CRITICAL REMEDIATION OBJECTIVE:
The student failed their prior question on "{topic_title}".
- Question asked: "{prev_q}"
- Student's INCORRECT answer: "{prev_wrong_choice}"
- Correct principle / takeaway: "{prev_explanation}"

YOUR TASK:
Diagnose the exact misconception behind choosing "{prev_wrong_choice}".
Do NOT repeat the old question or generate a generic True/False quiz.
Craft a targeted, practical diagnostic question that directly addresses and repairs this specific misunderstanding.
For example, if they confused a string with an integer, present a minimal snippet demonstrating that exact type distinction or conversion.
"""

    prompt = f"""
You are an expert technical tutor in "{subject}".
The learner is currently studying: "{topic_title}"
Topic details: {subtopics_text}
{remedial_context}

Generate ONE focused, 30-second understanding check.
Choose the archetype that best reveals the concept:
1. "predict_output": 2-4 lines of code demonstrating the principle. Ask what it evaluates to or prints.
2. "spot_bug": 2-4 lines with the exact common misconception. Ask what error occurs or why it fails.
3. "concept_application": A practical technical scenario testing cause-and-effect.

STRICT REQUIREMENTS:
- Output valid JSON ONLY matching the schema.
- "question" must be specific, contextual, and directly related to the concept (never generic placeholders).
- Provide 3 or 4 clear, plausible options (NEVER generic True/False unless the question is inherently a boolean statement).
- "correct_index" must point to the single correct option.
- "explanation" must clearly explain why the correct choice works and why the misconception fails.

Output JSON format:
{{
  "archetype": "predict_output | spot_bug | concept_application",
  "question": "Specific question testing the misconception",
  "code_snippet": "code snippet or null",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 0,
  "explanation": "Clear explanation reinforcing the principle.",
  "concept_key": "snake_case_concept_identifier"
}}
"""
    prefix = roadmap_slug.replace('-', ' ').strip() if roadmap_slug else subject.strip()
    search_target = f"{prefix} - {topic_title}".strip()

    try:
        # Use OpenRouter/free and the universal multi-provider cascade (OpenRouter -> Groq -> Cohere -> Gemini -> HF)
        model = settings.DEFAULT_FEEDBACK_MODEL or "openrouter/free"
        raw_text, usage = await generate_text(prompt, model=model, response_mime_type="application/json", return_usage=True)

        if uid and usage:
            log_backend_ai_usage(
                sb,
                uid,
                f"Micro-Checkpoint: {topic_title} (Cost: 0 Credits)",
                usage,
                source="backend"
            )

        data = robust_json_loads(raw_text)
        if not isinstance(data, dict):
            raise ValueError("Expected JSON object from model")

        checkpoint_id = f"cp_{roadmap_id}_{module_number}_{topic_index}_{uuid.uuid4().hex[:6]}"
        options = data.get("options", [])
        if len(options) < 2:
            options = ["True", "False"]

        correct_idx = data.get("correct_index", 0)
        if not isinstance(correct_idx, int) or correct_idx < 0 or correct_idx >= len(options):
            correct_idx = 0

        # Cache both normal checkpoints and remedial checkpoints for future learners
        if settings.GEMINI_API_KEY:
            async def cache_checkpoint_in_db():
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={settings.GEMINI_API_KEY}"
                    payload = {
                        "model": "models/gemini-embedding-2",
                        "outputDimensionality": 768,
                        "content": {"parts": [{"text": search_target}]}
                    }
                    async with httpx.AsyncClient(timeout=8.0) as client:
                        emb_r = await client.post(url, json=payload)
                        if emb_r.status_code == 200:
                            emb_vals = emb_r.json().get('embedding', {}).get('values')
                            if emb_vals:
                                sb.table("curated_checkpoints").insert({
                                    "subject": subject,
                                    "topic_title": topic_title,
                                    "concept_key": data.get("concept_key", "core_concept"),
                                    "question_data": data,
                                    "topic_embedding": emb_vals
                                }).execute()
                                logger.info(f"Cached checkpoint with embedding for future users: '{search_target}'")
                except Exception as save_err:
                    logger.warning(f"Failed to cache checkpoint embedding: {save_err}")

            asyncio.create_task(cache_checkpoint_in_db())

        return {
            "id": checkpoint_id,
            "archetype": data.get("archetype", "concept_application"),
            "question": data.get("question", f"Quick check for {topic_title}"),
            "code_snippet": data.get("code_snippet"),
            "options": options,
            "correct_index": correct_idx,
            "explanation": data.get("explanation", "Good job checking your understanding."),
            "concept_key": data.get("concept_key", "core_concept")
        }
    except Exception as e:
        logger.error(f"Failed to generate micro-checkpoint: {e}")
        return {
            "id": f"cp_fallback_{uuid.uuid4().hex[:6]}",
            "archetype": "concept_application",
            "question": f"Which statement best describes the purpose of {topic_title} in {subject}?",
            "code_snippet": None,
            "options": [
                f"It is a core building block used to structure logic and handle data effectively in {subject}.",
                f"It is deprecated and should always be avoided in modern {subject}.",
                "It only works inside external third-party compiled libraries."
            ],
            "correct_index": 0,
            "explanation": f"{topic_title} is fundamental for structuring working programs in {subject}.",
            "concept_key": "fundamentals"
        }


async def adjust_user_skill_for_checkpoint(
    sb,
    user_id: str,
    roadmap_id: int,
    delta: float
):
    """Adjust user confidence score by delta (+0.5 or -0.1)."""
    try:
        us_res = sb.table("user_skills").select("*").eq("user_id", user_id).filter("contributing_roadmap_ids", "cs", f"{{{roadmap_id}}}").execute()
        for us in (us_res.data or []):
            old_score = float(us.get("confidence_score") or 0.0)
            new_score = round(max(min(old_score + delta, 100.0), 0.0), 1)
            sb.table("user_skills").update({
                "confidence_score": new_score,
                "tier": get_letter_grade(new_score),
                "last_updated": datetime.now(timezone.utc).isoformat()
            }).eq("id", us["id"]).execute()
            logger.info(f"Skill Score adjusted via Checkpoint ({delta:+.1f}): {us.get('canonical_skill_id')} | Old: {old_score:.1f} -> New: {new_score:.1f}")
    except Exception as err:
        logger.error(f"Failed to update skill score for checkpoint: {err}")
