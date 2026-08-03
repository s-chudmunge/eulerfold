import logging
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from app.core.supabase_client import get_supabase_client
from app.core.auth import get_current_user
from app.schemas import User, DiagnosticStartRequest, DiagnosticAnswerRequest, DiagnosticSkipRequest
from app.utils.ai_client import generate_text, clean_json_string, robust_json_loads, log_backend_ai_usage
from app.database.monitor import monitor_query
from app.core.config import settings
from app.utils.diagnostic_scorer import build_knowledge_profile
import uuid
import random
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])

DOMAINS = [
    # Core Tech & CS
    "probability-statistics", "linear-algebra", "calculus", "python-programming",
    "data-structures-algorithms", "databases-sql", "ml-fundamentals", "deep-learning",
    "systems-design", "devops-infra", "web-development", "networking",
    "os-fundamentals", "discrete-math", "cybersecurity", "cloud-computing",
    "mobile-development", "game-development", "blockchain-crypto",
    # Hard Sciences
    "physics-fundamentals", "chemistry-fundamentals", "biology-fundamentals",
    "organic-chemistry", "genetics", "quantum-mechanics", "astronomy",
    # Engineering
    "electrical-engineering", "mechanical-engineering", "civil-engineering",
    "chemical-engineering", "robotics", "materials-science",
    # Business & Humanities
    "economics-macro", "economics-micro", "finance-accounting",
    "marketing-fundamentals", "psychology-fundamentals", "sociology",
    "history-world", "philosophy"
]


def _enrich_question(question: dict, domain_names: dict) -> dict:
    """Add domain_name to a question dict for frontend display."""
    if not question:
        return question
    slug = question.get("domain_slug", "")
    question["domain_name"] = domain_names.get(slug, slug.replace("-", " ").title())
    return question


def _get_domain_names(sb) -> dict:
    """Fetch slug -> name mapping from diagnostic_domains table."""
    res = sb.table("diagnostic_domains").select("slug, name").execute()
    if res.data:
        return {d["slug"]: d["name"] for d in res.data}
    return {}


@router.post("/start")
@monitor_query("diagnostics_start")
async def start_diagnostic(request: DiagnosticStartRequest, user: User = Depends(get_current_user)):
    sb = get_supabase_client()

    # Map topic to prerequisite domains using AI
    prompt = f"""Given this learning topic, identify the 3-4 most relevant prerequisite domains from this list: {DOMAINS}.
Assign weights (0.0-1.0) indicating how important each prerequisite is for learning this topic.
Return JSON array only: [{{"domain_slug": "...", "weight": 0.9}}]
Topic: "{request.topic}" """

    generated_text, usage = await generate_text(
        prompt,
        model=settings.DEFAULT_ROADMAP_MODEL,
        response_mime_type="application/json",
        return_usage=True
    )

    log_backend_ai_usage(sb, user.supabase_uid, "Diagnostic Domain Mapping", usage, source="backend")

    mapped_domains = robust_json_loads(generated_text)
    if not isinstance(mapped_domains, list):
        mapped_domains = []

    # Filter to valid domains only
    mapped_domains = [d for d in mapped_domains if d.get("domain_slug") in DOMAINS]
    mapped_domains.sort(key=lambda x: x.get("weight", 0), reverse=True)

    if not mapped_domains:
        raise HTTPException(status_code=400, detail="Could not map topic to any prerequisite domains.")

    # Fetch domain display names
    domain_names = _get_domain_names(sb)
    for dm in mapped_domains:
        dm["domain_name"] = domain_names.get(dm["domain_slug"], dm["domain_slug"].replace("-", " ").title())

    session_id = str(uuid.uuid4())

    session_data = {
        "id": session_id,
        "user_id": user.supabase_uid,
        "topic": request.topic,
        "mapped_domains": mapped_domains,
        "status": "in_progress",
        "created_at": datetime.utcnow().isoformat()
    }

    sb.table("diagnostic_sessions").insert(session_data).execute()

    # Find the first question (Tier 1 from top-weighted domain)
    first_question = None
    for domain_map in mapped_domains:
        domain = domain_map.get("domain_slug")
        result = sb.table("diagnostic_questions").select("*").eq("domain_slug", domain).eq("tier", 1).execute()
        questions = result.data
        if questions:
            first_question = _enrich_question(random.choice(questions), domain_names)
            break

    total_questions = len(mapped_domains) * 3  # Up to 3 tiers per domain (adaptive, so actual may be fewer)

    return {
        "session_id": session_id,
        "mapped_domains": mapped_domains,
        "first_question": first_question,
        "total_questions": total_questions
    }


@router.post("/answer")
@monitor_query("diagnostics_answer")
async def answer_diagnostic(request: DiagnosticAnswerRequest, user: User = Depends(get_current_user)):
    sb = get_supabase_client()

    # Validate session
    session_res = sb.table("diagnostic_sessions").select("*").eq("id", request.session_id).eq("user_id", user.supabase_uid).execute()
    if not session_res.data:
        raise HTTPException(status_code=404, detail="Session not found")

    session = session_res.data[0]
    if session["status"] != "in_progress":
        raise HTTPException(status_code=400, detail="Session already completed")

    # Fetch the question
    question_res = sb.table("diagnostic_questions").select("*").eq("id", request.question_id).execute()
    if not question_res.data:
        raise HTTPException(status_code=404, detail="Question not found")

    question = question_res.data[0]
    is_correct = (request.selected_index == question["correct_index"])

    # Detect misconception
    misconception_detected = None
    if not is_correct and question.get("misconceptions_detected"):
        misconception_dict = question.get("misconceptions_detected", {})
        misconception_detected = misconception_dict.get(str(request.selected_index))

    # Record the response
    response_data = {
        "session_id": request.session_id,
        "question_id": request.question_id,
        "selected_index": request.selected_index,
        "is_correct": is_correct,
        "misconception_detected": misconception_detected,
        "time_taken_ms": request.time_taken_ms
    }
    sb.table("diagnostic_responses").insert(response_data).execute()

    # Fetch all responses so far (with joined question data)
    responses_res = sb.table("diagnostic_responses").select("*, diagnostic_questions(*)").eq("session_id", request.session_id).execute()
    all_responses = responses_res.data
    answered_q_ids = [r["question_id"] for r in all_responses]

    mapped_domains = session["mapped_domains"]
    current_domain = question["domain_slug"]
    current_tier = question["tier"]

    domain_names = _get_domain_names(sb)
    domain_idx = next((i for i, d in enumerate(mapped_domains) if d["domain_slug"] == current_domain), -1)

    next_question = None

    # Adaptive logic: correct → go deeper; wrong → move to next domain
    if is_correct and current_tier < 3:
        next_tier = current_tier + 1
        q_res = sb.table("diagnostic_questions").select("*").eq("domain_slug", current_domain).eq("tier", next_tier).execute()
        avail = [q for q in q_res.data if q["id"] not in answered_q_ids]
        if avail:
            next_question = _enrich_question(random.choice(avail), domain_names)

    # If no next question in current domain (wrong answer, or exhausted tiers), move to next domain
    if not next_question:
        for i in range(domain_idx + 1, len(mapped_domains)):
            next_domain = mapped_domains[i]["domain_slug"]
            q_res = sb.table("diagnostic_questions").select("*").eq("domain_slug", next_domain).eq("tier", 1).execute()
            avail = [q for q in q_res.data if q["id"] not in answered_q_ids]
            if avail:
                next_question = _enrich_question(random.choice(avail), domain_names)
                break

    # Calculate progress
    domains_completed = 0
    answered_domains = set()
    for r in all_responses:
        if r.get("diagnostic_questions"):
            answered_domains.add(r["diagnostic_questions"]["domain_slug"])

    # A domain is "completed" if we've moved past it
    if next_question:
        next_domain_slug = next_question.get("domain_slug", "")
        for i, dm in enumerate(mapped_domains):
            if dm["domain_slug"] == next_domain_slug:
                domains_completed = i
                break
    else:
        domains_completed = len(mapped_domains)

    is_complete = next_question is None
    knowledge_profile = None
    prompt_context = None

    if is_complete:
        # Build the knowledge profile
        merged_responses = []
        for r in all_responses:
            merged = {**r}
            if r.get("diagnostic_questions"):
                merged.update({
                    "domain_slug": r["diagnostic_questions"]["domain_slug"],
                    "tier": r["diagnostic_questions"]["tier"],
                    "concepts_tested": r["diagnostic_questions"]["concepts_tested"]
                })
            merged_responses.append(merged)

        kp_result = build_knowledge_profile(request.session_id, mapped_domains, merged_responses)

        sb.table("diagnostic_sessions").update({
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "knowledge_profile": kp_result
        }).eq("id", request.session_id).execute()

        knowledge_profile = kp_result.get("profile", {})
        prompt_context = kp_result.get("prompt_context", "")

    return {
        "is_correct": is_correct,
        "misconception_detected": misconception_detected,
        "next_question": next_question,
        "progress": {
            "answered": len(answered_q_ids),
            "total_estimated": len(mapped_domains) * 3,
            "domains_completed": domains_completed,
            "total_domains": len(mapped_domains)
        },
        "is_complete": is_complete,
        "knowledge_profile": knowledge_profile,
        "prompt_context": prompt_context
    }


@router.get("/session/{session_id}")
@monitor_query("diagnostics_get_session")
async def get_session(session_id: str, user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    res = sb.table("diagnostic_sessions").select("*").eq("id", session_id).eq("user_id", user.supabase_uid).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return res.data[0]


@router.post("/skip")
@monitor_query("diagnostics_skip")
async def skip_diagnostic(request: DiagnosticSkipRequest, user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    sb.table("diagnostic_sessions").update({
        "status": "skipped",
        "knowledge_profile": {"profile": {}, "prompt_context": "The learner skipped the diagnostic assessment. No prior knowledge is assumed."}
    }).eq("id", request.session_id).eq("user_id", user.supabase_uid).execute()
    return {"status": "skipped"}
