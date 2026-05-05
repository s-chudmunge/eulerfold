import json
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict

import httpx
from fastapi import APIRouter, HTTPException, Request, Body, Depends, BackgroundTasks
from app.services.skills_service import calculate_user_skill_scores_for_roadmap

from app.core.supabase_client import get_supabase_client
from app.utils.gemini_client import generate_text, clean_json_string
from app.core.config import settings
from app.core.coins import EulerCoins
from app.utils.eulercoins import award_coins
from app.utils.streaks import track_activity
from app.core.auth import get_current_user
from app.schemas import User

logger = logging.getLogger(__name__)
router = APIRouter()


async def _scrape_with_jina(link: str) -> Optional[str]:
    if not link or not isinstance(link, str) or not link.startswith("http"):
        return None

    from urllib.parse import quote
    encoded = quote(link, safe="")
    
    # Use g.jina.ai for GitHub links to get better repository snapshots
    # g.jina.ai is specifically optimized for code/GitHub
    if "github.com" in link:
        jina_url = f"https://g.jina.ai/{encoded}"
    else:
        jina_url = f"https://r.jina.ai/{encoded}"

    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                r = await client.get(jina_url)
                if r.status_code == 200 and r.text:
                    text = r.text.strip()
                    if len(text) < 50: continue
                    # Increased limit to 10,000 for better code context
                    return text[:10000]
        except Exception as e:
            logger.error(f"Scraping attempt {attempt} failed for {link}: {e}")
            continue
    return None


@router.get("/submissions")
async def get_submissions(roadmap_id: int, current_user: User = Depends(get_current_user)):
    """Retrieve all submissions for a roadmap (by the current user)"""
    sb = get_supabase_client()
    
    # Verify user owns this roadmap or it is public
    roadmap_res = sb.table("roadmaps").select("email, is_public").eq("id", roadmap_id).execute()
    if not roadmap_res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    is_owner = roadmap_res.data[0]["email"].lower() == current_user.email.lower()
    is_public = roadmap_res.data[0].get("is_public", False)
    
    if not is_owner and not is_public:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Fetch all submissions for this roadmap, ordered by submission date descending
    submissions_res = sb.table("submissions").select("*").eq("roadmap_id", roadmap_id).eq("user_email", current_user.email).order("submitted_at", desc=True).execute()
    
    submissions = submissions_res.data or []
    
    return {"submissions": submissions}


from collections import Counter

async def call_auditor(persona: str, context: dict, multimodal_parts: list) -> dict:
    """Calls a specific auditor persona with a focused lens."""
    module_title = context.get("module_title")
    roadmap_subject = context.get("roadmap_subject")
    topics_text = context.get("topics_text")
    expected_deliverable = context.get("expected_deliverable")
    description = context.get("description")
    files_summary = context.get("files_summary")
    link_context = context.get("link_context")
    dispute_context = context.get("dispute_context", "")

    base_prompt = f"""You are evaluating a Proof of Work submission for: {module_title}.
ROADMAP SUBJECT: {roadmap_subject}
MODULE OBJECTIVES: {topics_text}
EXPECTED DELIVERABLE: {expected_deliverable}

USER SUBMISSION:
Description: {description}
{files_summary}
{link_context}
"""
    if dispute_context:
        base_prompt += f'\nUSER DISPUTE REASONING: "{dispute_context}"\n'

    persona_prompts = {
        "technician": """
You are THE TECHNICIAN. Evaluate ONLY the technical quality, code correctness, depth, and production-readiness.
Ignore whether it matches the assigned task topic. 
INDEPENDENCE RULE: Do not consider what other auditors might think. Make your judgment independently based solely on this lens.
Output one word only on the first line: Solid, Developing, or Beginner.
Then explain your reasoning in 2-3 sentences.
""",
        "educator": """
You are THE EDUCATOR. Your ONLY job is to assess whether this person genuinely understands what they built.
Ask yourself: Does their description show they can explain WHY, not just WHAT? Are there signs of genuine debugging, iteration, or problem-solving? 
Does the explanation feel like someone who built it, or someone who simply followed a tutorial?
You are NOT checking if objectives were met or if the code is production-ready. You are checking for authentic evidence of learning.
INDEPENDENCE RULE: Do not consider what other auditors might think. Make your judgment independently based solely on this lens.
Output one word only on the first line: Solid, Developing, or Beginner.
Then explain your reasoning in 2-3 sentences.
""",
        "relevance_judge": """
You are THE RELEVANCE JUDGE. Evaluate ONLY how well this submission covers the module objectives.
Apply THE "SUBJECT MASTER" RULE: Topic deviation is acceptable if the learner demonstrates mastery of the "ROADMAP SUBJECT" and "MODULE OBJECTIVES".
INDEPENDENCE RULE: Do not consider what other auditors might think. Make your judgment independently based solely on this lens.
Output one word only on the first line: Solid, Developing, or Beginner.
Then explain your reasoning in 2-3 sentences.
"""
    }


    full_prompt = base_prompt + persona_prompts[persona] + "\nRespond as JSON: {\"level\": \"...\", \"reasoning\": \"...\"}"
    
    try:
        gen_raw = await generate_text([full_prompt] + multimodal_parts, model=settings.GEMINI_MODEL, response_mime_type="application/json")
        return json.loads(clean_json_string(gen_raw))
    except Exception as e:
        logger.error(f"Auditor {persona} failed: {e}")
        return {"level": "Developing", "reasoning": "Evaluation error, defaulted to Developing."}

def resolve_senate_verdict(votes: list) -> tuple:
    """Resolves the 3-auditor consensus."""
    tally = Counter(votes)
    most_common_level, count = tally.most_common(1)[0]
    
    if count == 3:
        return most_common_level, 3, None
    
    if count == 2:
        dissenter_val = [v for v in votes if v != most_common_level][0]
        note = f"Two auditors rated this {most_common_level}. One auditor felt the work was closer to {dissenter_val} level."
        return most_common_level, 2, note
    
    note = "Auditors were divided. The work shows promise but gaps remain across technical depth, learning evidence, or subject alignment."
    return "Developing", 1, note

@router.post("/submissions")
async def create_submission(background_tasks: BackgroundTasks, payload: dict = Body(...), current_user: User = Depends(get_current_user)):
    roadmap_id = payload.get("roadmap_id")
    module_number = payload.get("module_number")
    link = payload.get("link")
    description = payload.get("description")
    files = payload.get("files", [])

    if not roadmap_id or not module_number:
        logger.warning(f"Submission rejected: Missing roadmap_id ({roadmap_id}) or module_number ({module_number})")
        raise HTTPException(status_code=400, detail="Missing roadmap_id or module_number")

    email = current_user.email
    sb = get_supabase_client()
    
    # 0. Backend File Size Guard
    if files:
        total_size = 0
        for f in files:
            size = f.get("size", 0)
            content = f.get("content", "")
            if size > 5 * 1024 * 1024 or len(content) > 7 * 1024 * 1024:
                logger.warning(f"Submission rejected for {email}: File {f.get('name')} too large.")
                raise HTTPException(status_code=400, detail=f"File {f.get('name')} exceeds 5MB.")
            total_size += size
        if total_size > 5 * 1024 * 1024:
            logger.warning(f"Submission rejected for {email}: Total size {total_size} exceeds 5MB.")
            raise HTTPException(status_code=400, detail="Total attachments exceed 5MB.")

    r_res = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
    if not r_res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    roadmap = r_res.data[0]
    
    is_owner = roadmap.get("email", "").lower() == email.lower()
    is_public = roadmap.get("is_public", False)
    
    if not is_owner and not is_public:
        raise HTTPException(status_code=403, detail="Not authorized")

    roadmap_plan = roadmap.get("roadmap_plan") or {}
    if isinstance(roadmap_plan, str):
        try: roadmap_plan = json.loads(roadmap_plan)
        except: roadmap_plan = {}

    modules = roadmap_plan.get("modules", [])
    module_idx = max(0, int(module_number) - 1)
    module_ctx = modules[module_idx] if 0 <= module_idx < len(modules) else {}
    module_title = module_ctx.get("title") or f"Module {module_number}"
    module_topics = module_ctx.get("topics", [])

    # Cooldown
    recent_subs_res = sb.table("submissions").select("evaluation_level, submitted_at").eq("roadmap_id", roadmap_id).eq("module_number", module_number).eq("user_email", email).order("submitted_at", desc=True).limit(1).execute()
    if recent_subs_res.data:
        last_sub = recent_subs_res.data[0]
        if last_sub.get("evaluation_level") == "Beginner":
            last_time = datetime.fromisoformat(last_sub.get("submitted_at").replace("Z", "+00:00"))
            wait_time = datetime.now(timezone.utc) - last_time
            if wait_time < timedelta(minutes=10):
                remaining = 10 - int(wait_time.total_seconds() / 60)
                logger.warning(f"Submission rejected for {email}: Cooldown active ({wait_time.total_seconds():.0f}s since last fail)")
                raise HTTPException(status_code=429, detail=f"The Senate is cooling down. Please refine your work and try again in {remaining} minutes.")

    # Scrape and Prepare Content
    scraped_text = await _scrape_with_jina(link) if link else None
    link_context = f"\n\nLink Content Preview:\n{scraped_text}" if scraped_text else ""
    
    files_summary = ""
    multimodal_parts = []
    if files:
        file_details = []
        for f in files:
            name, content = f.get("name", "unknown"), f.get("content", "")
            ext = name.split(".")[-1].lower() if "." in name else ""
            if ext in ["py", "js", "ts", "java", "cpp", "c", "jsx", "tsx", "html", "css", "txt", "md"]:
                limit = 2000 if ext not in ["txt", "md"] else 500
                file_details.append(f"- {name} ({f.get('size', 0)//1024}KB)\nContent Snippet:\n{content[:limit]}")
            elif content.startswith("data:"):
                try:
                    header, base64_data = content.split(",", 1)
                    mime_type = header.split(";")[0].split(":", 1)[1]
                    multimodal_parts.append({"mime_type": mime_type, "data": base64_data})
                    file_details.append(f"- {name} ({f.get('size', 0)//1024}KB) [Attached]")
                except Exception: pass
            else:
                file_details.append(f"- {name} ({f.get('size', 0)//1024}KB)")
        files_summary = "\n\nAttached Files:\n" + "\n".join(file_details)

    topics_text = ", ".join([f"{t.get('title') or t}" if isinstance(t, dict) else f"{t}" for t in module_topics[:3]])
    pow_instr = module_ctx.get("proof_of_work_instructions", {})
    expected_deliverable = f"BUILD: {pow_instr.get('what_to_build')}\nEVAL: {', '.join(pow_instr.get('eval_criteria', []))}"

    context = {
        "module_title": module_title,
        "roadmap_subject": roadmap.get('subject', 'General Technical'),
        "topics_text": topics_text,
        "expected_deliverable": expected_deliverable,
        "description": description,
        "files_summary": files_summary,
        "link_context": link_context
    }

    # CONVENE THE SENATE (Parallel Execution)
    results = await asyncio.gather(
        call_auditor("technician", context, multimodal_parts),
        call_auditor("educator", context, multimodal_parts),
        call_auditor("relevance_judge", context, multimodal_parts)
    )

    votes = [r["level"] for r in results]
    reasoning = {
        "technician": results[0]["reasoning"],
        "educator": results[1]["reasoning"],
        "relevance_judge": results[2]["reasoning"],
    }
    
    final_level, agreement, dissent = resolve_senate_verdict(votes)
    
    # SENATE CLERK: Generate a high-impact, 1-sentence summary
    clerk_prompt = f"""
Summarize these 3 audit findings into ONE SHORT, HIGH-IMPACT SENTENCE for the user (Max 20 words).
Focus on why they got {final_level}.

1. Technician: {reasoning["technician"]}
2. Educator: {reasoning["educator"]}
3. Relevance: {reasoning["relevance_judge"]}

Respond as JSON: {{"summary": "..."}}
"""
    senate_summary = "Awaiting final summary."
    try:
        clerk_raw = await generate_text(clerk_prompt, model=settings.GEMINI_MODEL, response_mime_type="application/json")
        clerk_parsed = json.loads(clean_json_string(clerk_raw))
        senate_summary = clerk_parsed.get("summary", "Verified by the Audit Senate.")
    except Exception as e:
        logger.error(f"Senate Clerk failed: {e}")

    follow_up = "What was the most challenging part of this module for you?" # Default

    sub_data = {
        "roadmap_id": roadmap_id, "module_number": module_number, "link": link, "description": description,
        "scraped_content": scraped_text, "evaluation": reasoning["technician"], # For legacy compatibility
        "evaluation_level": final_level, "follow_up_question": follow_up, "user_email": email,
        "submitted_at": datetime.now(timezone.utc).isoformat(), "files": files,
        "senate_votes": votes, "senate_reasoning": reasoning, "senate_agreement": agreement,
        "dissent_note": dissent, "is_senate_eval": True, "senate_summary": senate_summary
    }

    ins = sb.table("submissions").insert(sub_data).execute()
    created = ins.data[0] if ins.data else None

    if final_level in ["Solid", "Developing"]:
        # Mark module completed
        plan = roadmap.get("roadmap_plan")
        if isinstance(plan, str): plan = json.loads(plan)
        modules = plan.get("modules", [])
        m_idx = int(module_number) - 1
        if 0 <= m_idx < len(modules):
            topics = modules[m_idx].get("topics", [])
            for t_idx in range(len(topics)):
                sb.table("module_progress").upsert({
                    "roadmap_id": roadmap_id, "user_email": email, "module_number": module_number, "topic_index": t_idx,
                    "completed": True, "completed_at": datetime.now(timezone.utc).isoformat()
                }, on_conflict="roadmap_id,user_email,module_number,topic_index").execute()

        await track_activity(email)
        await award_coins(email, EulerCoins.COMPLETE_MODULE, f"Completed module {module_number}", roadmap_id=roadmap_id)
        if current_user.supabase_uid:
            if not roadmap.get("skills_extracted"):
                from app.services.skills_service import extract_skills_from_roadmap
                background_tasks.add_task(extract_skills_from_roadmap, roadmap_id, current_user.supabase_uid)
            background_tasks.add_task(calculate_user_skill_scores_for_roadmap, roadmap_id, current_user.supabase_uid)

    return {"status": "ok", "submission": created, "evaluation": {"evaluation_level": final_level, "senate_reasoning": reasoning, "dissent_note": dissent}}

@router.post("/submissions/{submission_id}/re-evaluate")
async def request_re_evaluation(background_tasks: BackgroundTasks, submission_id: int, payload: Dict = Body(...), current_user: User = Depends(get_current_user)):
    dispute_context = payload.get("dispute_context")
    if not dispute_context or len(dispute_context) < 20:
        raise HTTPException(status_code=400, detail="Context too short (min 20 chars).")

    sb = get_supabase_client()
    s_res = sb.table("submissions").select("*").eq("id", submission_id).single().execute()
    if not s_res.data: raise HTTPException(status_code=404, detail="Not found")
    sub = s_res.data
    if sub["user_email"].lower() != current_user.email.lower(): raise HTTPException(status_code=403, detail="Denied")
    
    count = sub.get("re_eval_count", 0)
    if count >= 1: # One dispute limit for Senate model
        raise HTTPException(status_code=400, detail="Dispute limit reached for this submission.")

    # Prepare Context
    topics_text = "Module objectives"
    expected_deliverable = "Standard proof of work evidence."
    roadmap_data = {}
    r_res = sb.table("roadmaps").select("*").eq("id", sub["roadmap_id"]).execute()
    if r_res.data:
        roadmap_data = r_res.data[0]
        plan = roadmap_data.get("roadmap_plan")
        if isinstance(plan, str): plan = json.loads(plan)
        modules = plan.get("modules", [])
        m_idx = sub["module_number"] - 1
        if 0 <= m_idx < len(modules):
            m_ctx = modules[m_idx]
            topics = m_ctx.get("topics", [])
            topics_text = ", ".join([f"{t.get('title') or t}" if isinstance(t, dict) else f"{t}" for t in topics[:3]])
            pow_instr = m_ctx.get("proof_of_work_instructions", {})
            expected_deliverable = f"BUILD: {pow_instr.get('what_to_build')}\nEVAL: {', '.join(pow_instr.get('eval_criteria', []))}"

    multimodal_parts = []
    files = sub.get("files", [])
    if files:
        for f in files:
            content = f.get("content", "")
            if content.startswith("data:"):
                try:
                    header, base64_data = content.split(",", 1)
                    mime_type = header.split(";")[0].split(":", 1)[1]
                    multimodal_parts.append({"mime_type": mime_type, "data": base64_data})
                except Exception: pass

    context = {
        "module_title": f"Module {sub['module_number']}",
        "roadmap_subject": roadmap_data.get('subject', 'General Technical'),
        "topics_text": topics_text,
        "expected_deliverable": expected_deliverable,
        "description": sub['description'],
        "files_summary": "Files attached in original submission.",
        "link_context": f"Original Link: {sub.get('link')}\nPreview: {sub.get('scraped_content', 'None')}",
        "dispute_context": dispute_context
    }

    # RECONVENE SENATE
    results = await asyncio.gather(
        call_auditor("technician", context, multimodal_parts),
        call_auditor("educator", context, multimodal_parts),
        call_auditor("relevance_judge", context, multimodal_parts)
    )

    votes = [r["level"] for r in results]
    reasoning = {
        "technician": results[0]["reasoning"],
        "educator": results[1]["reasoning"],
        "relevance_judge": results[2]["reasoning"],
    }
    final_level, agreement, dissent = resolve_senate_verdict(votes)

    # SENATE CLERK: Summary for dispute
    clerk_prompt = f"Summarize these 3 audit findings into ONE SHORT, HIGH-IMPACT SENTENCE for the user (Max 20 words). Focus on why they got {final_level}.\n1. Tech: {reasoning['technician']}\n2. Edu: {reasoning['educator']}\n3. Rel: {reasoning['relevance_judge']}\nRespond as JSON: {{\"summary\": \"...\"}}"
    senate_summary = "Re-evaluation complete."
    try:
        clerk_raw = await generate_text(clerk_prompt, model=settings.GEMINI_MODEL, response_mime_type="application/json")
        senate_summary = json.loads(clean_json_string(clerk_raw)).get("summary", "Verified by Audit.")
    except Exception: pass

    update_data = {
        "evaluation_level": final_level,
        "senate_votes": votes,
        "senate_reasoning": reasoning,
        "senate_agreement": agreement,
        "dissent_note": dissent,
        "re_eval_count": count + 1,
        "dispute_context": dispute_context,
        "is_senate_eval": True,
        "senate_summary": senate_summary
    }

    sb.table("submissions").update(update_data).eq("id", submission_id).execute()

    if final_level in ["Solid", "Developing"]:
        # Complete module
        sb.table("module_progress").upsert({
            "roadmap_id": sub["roadmap_id"], "user_email": sub["user_email"], "module_number": sub["module_number"], "topic_index": 0,
            "completed": True, "completed_at": datetime.now(timezone.utc).isoformat()
        }, on_conflict="roadmap_id,user_email,module_number,topic_index").execute()
        if current_user.supabase_uid:
            background_tasks.add_task(calculate_user_skill_scores_for_roadmap, sub["roadmap_id"], current_user.supabase_uid)

    return {"status": "ok", "evaluation": {"evaluation_level": final_level, "senate_reasoning": reasoning, "dissent_note": dissent}}



@router.post("/submissions/{submission_id}/answer")
async def submit_followup_answer(submission_id: int, payload: dict = Body(...), current_user: User = Depends(get_current_user)):
    answer = payload.get("answer")
    if not answer: raise HTTPException(status_code=400, detail="Missing answer")
    sb = get_supabase_client()
    s_res = sb.table("submissions").select("*").eq("id", submission_id).single().execute()
    if not s_res.data: raise HTTPException(status_code=404, detail="Not found")
    sub = s_res.data
    if sub.get("user_email", "").lower() != current_user.email.lower(): raise HTTPException(status_code=403, detail="Denied")

    eval_prompt = f"Learner answer to '{sub.get('follow_up_question')}': {answer}\nModule: {sub.get('module_number')}\n1-2 sentence response, acknowledge correct parts, correct misconceptions, be encouraging. Plain text only."
    try:
        follow_up_eval = await generate_text(eval_prompt, model=settings.GEMINI_MODEL)
        sb.table("submissions").update({"follow_up_answer": answer, "follow_up_evaluation": follow_up_eval}).eq("id", submission_id).execute()
        return {"status": "ok", "follow_up_evaluation": follow_up_eval}
    except Exception:
        return {"status": "ok", "follow_up_evaluation": "Good effort on the reflection!"}
