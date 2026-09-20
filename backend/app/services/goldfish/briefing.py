import logging
import json
import re
import asyncio
from datetime import datetime, date, timedelta, timezone
from app.schemas import User
from app.utils.ai_client import generate_text, robust_json_loads

logger = logging.getLogger(__name__)

_briefing_user_locks = {}
_briefing_meta_lock = asyncio.Lock()


async def generate_autonomous_daily_briefing(current_user: User, sb) -> dict:
    """
    Aggregates comprehensive learner history across learning sessions, recent roadmaps,
    incomplete topic checkpoints, practice quiz scores, and active study pacing.
    Saves and returns the briefing payload from user profile metadata.
    """
    uid = current_user.supabase_uid
    email = (current_user.email or "").lower()

    # Per-user concurrency lock: prevents simultaneous requests on login from firing multiple LLM calls
    async with _briefing_meta_lock:
        if email not in _briefing_user_locks:
            _briefing_user_locks[email] = asyncio.Lock()
        user_lock = _briefing_user_locks[email]

    async with user_lock:
        today_str = date.today().isoformat()

        # 1. Fetch user profile stats & existing briefing from DB metadata
        profile_res = sb.table("profiles").select("display_name, current_streak, eulercoins, metadata").eq("email", email).execute()
        profile = profile_res.data[0] if profile_res.data else {}
        display_name = profile.get("display_name") or email.split("@")[0]
        streak_days = profile.get("current_streak", 0)
        meta = profile.get("metadata") or {}
        if isinstance(meta, str):
            try:
                meta = json.loads(meta)
            except Exception:
                meta = {}

        existing_briefing = meta.get("daily_briefing") if isinstance(meta, dict) else None

        # If already generated today in DB, serve immediately without calling the LLM
        if isinstance(existing_briefing, dict) and existing_briefing.get("date") == today_str and existing_briefing.get("data"):
            return existing_briefing["data"]

        # 2. Fetch all roadmaps created or cloned by the user in recent weeks
        roadmaps_res = sb.table("roadmaps").select("id, title, subject, goal, updated_at, slug, roadmap_plan, last_position").eq("email", email).order("updated_at", desc=True).limit(5).execute()
        roadmaps = roadmaps_res.data or []

        # 3. Fetch learning sessions (last 14 days)
        fourteen_days_ago = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()
        try:
            sessions_res = sb.table("learning_sessions").select("duration_seconds, created_at").eq("user_id", uid).gte("created_at", fourteen_days_ago).order("created_at", desc=True).limit(50).execute()
            recent_sessions = sessions_res.data or []
        except Exception as e:
            logger.warning(f"Error fetching learning_sessions for briefing: {e}")
            recent_sessions = []

        sessions_last_7_days = sum(1 for s in recent_sessions if s.get("created_at", "") >= (datetime.now(timezone.utc) - timedelta(days=7)).isoformat())

        # 4. Fetch recent MCQ / practice quiz performances
        try:
            quiz_res = sb.table("mcq_sessions").select("score, status, topic_name, created_at, roadmap_id").eq("user_id", uid).order("created_at", desc=True).limit(5).execute()
            recent_quizzes = quiz_res.data or []
        except Exception as e:
            logger.warning(f"Error fetching mcq_sessions for briefing: {e}")
            recent_quizzes = []

        # 5. Fetch skill summary & proof-of-work submissions
        try:
            skills_res = sb.table("user_skill_summary").select("skill_name, mastery_score, evidence_count").eq("user_id", uid).order("mastery_score", desc=True).limit(5).execute()
            raw_skills = skills_res.data or []
            top_skills = []
            for s in raw_skills:
                score = float(s.get("mastery_score") or 0.0)
                # Convert 0.0-1.0 or 0-100 scale into clean display percentages and intuitive stages
                pct = round(score * 100 if score <= 1.0 else score)
                tier = "Advanced" if pct >= 75 else "Proficient" if pct >= 50 else "Developing" if pct >= 25 else "Introductory"
                top_skills.append({
                    "skill": s.get("skill_name"),
                    "level": f"{tier} ({pct}%)",
                    "verified_checks": s.get("evidence_count", 0)
                })
        except Exception as e:
            logger.warning(f"Error fetching user_skill_summary for briefing: {e}")
            top_skills = []

        try:
            submissions_res = sb.table("submissions").select("evaluation_level, evaluation, submitted_at").eq("user_email", email).order("submitted_at", desc=True).limit(3).execute()
            recent_submissions = submissions_res.data or []
        except Exception as e:
            logger.warning(f"Error fetching submissions for briefing: {e}")
            recent_submissions = []

        # 6. Fetch upcoming / scheduled study tasks
        today_iso = date.today().isoformat()
        try:
            tasks_res = sb.table("study_tasks").select("title, scheduled_date, is_completed").eq("user_email", email).gte("scheduled_date", today_iso).order("scheduled_date").limit(5).execute()
            scheduled_tasks = tasks_res.data or []
        except Exception as e:
            logger.warning(f"Error fetching study_tasks for briefing: {e}")
            scheduled_tasks = []

        # 7. Extract active roadmap details, incomplete topics, and next recommended checkpoints
        roadmap_summaries = []
        primary_roadmap = None
        next_action_topic = None
        primary_roadmap_slug = None

        for r in roadmaps:
            plan = r.get("roadmap_plan")
            if isinstance(plan, str):
                try:
                    plan = json.loads(plan)
                except Exception:
                    plan = {}
            if not isinstance(plan, dict):
                plan = {}

            modules = plan.get("modules") or []
            total_topics = 0
            completed_count = 0
            pending_topics = []

            for m_idx, m in enumerate(modules):
                m_title = m.get("title", f"Module {m_idx + 1}")
                topics = m.get("topics") or []
                for t_idx, t in enumerate(topics):
                    total_topics += 1
                    t_title = t.get("title", f"Topic {t_idx + 1}")
                    is_completed = bool(t.get("completed") or t.get("is_completed"))
                    if is_completed:
                        completed_count += 1
                    else:
                        pending_topics.append({
                            "module": m_title,
                            "module_number": m_idx + 1,
                            "topic": t_title,
                            "topic_index": t_idx
                        })

            r_title = r.get("title") or r.get("subject") or "Untitled Track"
            r_slug = r.get("slug") or str(r.get("id"))
            pct = round((completed_count / total_topics * 100)) if total_topics > 0 else 0

            summary_item = {
                "roadmap_id": r.get("id"),
                "title": r_title,
                "progress_percent": pct,
                "next_up": pending_topics[0] if pending_topics else None
            }
            roadmap_summaries.append(summary_item)

            if not primary_roadmap and pending_topics:
                primary_roadmap = r_title
                primary_roadmap_slug = r_slug
                next_action_topic = pending_topics[0]

        if not primary_roadmap and roadmaps:
            first_r = roadmaps[0]
            primary_roadmap = first_r.get("title") or first_r.get("subject") or "Current Subject"
            primary_roadmap_slug = first_r.get("slug") or str(first_r.get("id"))

        # Fallback values
        fallback_briefing = f"Welcome back, {display_name}. Keep your momentum going today by advancing through your study goals."
        fallback_badge = "PROGRESS"
        fallback_label = "Continue Learning"

        if next_action_topic:
            t_name = next_action_topic["topic"]
            fallback_briefing = f"Welcome back, {display_name}. Ready to dive back in? You're on track to master '{t_name}' next. Keep your momentum going and tackle your next milestone today."
            fallback_badge = (t_name.split()[0] if t_name else "UP NEXT").upper()[:12]
            fallback_label = f"Continue: {t_name}"[:36]

        # 8. LLM synthesis
        prompt = f"""
You are Goldfish, the personal AI study co-pilot on EulerFold.
Analyze the following learner activity dossier and write a concise, motivating, highly actionable daily study briefing (3-4 sentences maximum).

Learner Name: {display_name}
Current Study Streak: {streak_days} days
Total Focus Sessions (last 7 days): {sessions_last_7_days}
Active Roadmaps: {json.dumps(roadmap_summaries)}
Recent Practice Quizzes: {json.dumps(recent_quizzes)}
Top Verified Skills: {json.dumps(top_skills)}
Recent Proof-of-Work Submissions: {json.dumps(recent_submissions)}
Upcoming Study Tasks: {json.dumps(scheduled_tasks)}
Next Recommended Learning Target: {json.dumps(next_action_topic)}

INSTRUCTIONS:
1. Greet the learner warmly by their first name ({display_name}).
2. Acknowledge their real recent progress, streak, or current status with encouraging directness.
3. Recommend EXACTLY ONE specific, high-leverage action to take right now (e.g. advance their next topic, review a concept, or test their knowledge).
4. Strictly 3 to 4 sentences. NEVER use bullet points. Write in fluid, natural paragraphs.
5. NEVER sound clinical, robotic, or generic. DO NOT say "According to your logs" or "Dossier indicates". Sound like an attentive, sharp mentor who remembers everything they've studied.
6. Provide a short, uppercase 1-2 word highlight badge (e.g., 'STREAK', 'PYTHON', 'CHECKPOINT', 'MILESTONE', 'PRACTICE').
7. Provide a concise button label (e.g., 'Continue: Functions', 'Review Neural Operators', 'Start Quiz') maximum 35 characters.

Return valid JSON ONLY with this exact schema:
{{
  "briefing": "string (3-4 motivating sentences)",
  "highlight_badge": "UPPERCASE_WORD (max 12 chars)",
  "suggested_action_label": "string (max 35 chars)"
}}
"""

        try:
            ai_resp = await generate_text(prompt, response_mime_type="application/json")
            parsed = robust_json_loads(ai_resp)
            if isinstance(parsed, dict) and parsed.get("briefing"):
                briefing_text = parsed["briefing"]
                badge_text = parsed.get("highlight_badge", fallback_badge)
                label_text = parsed.get("suggested_action_label", fallback_label)
            else:
                briefing_text = fallback_briefing
                badge_text = fallback_badge
                label_text = fallback_label
        except Exception as err:
            logger.warning(f"Failed to generate daily study briefing: {err}")
            briefing_text = fallback_briefing
            badge_text = fallback_badge
            label_text = fallback_label

        # Sanitize formatting
        briefing_text = briefing_text.replace(" — ", ", ").replace("—", ", ").replace(" – ", ", ").replace("–", "-")
        briefing_text = re.sub(r'[\s,]*\.\.\.\s*$', '.', briefing_text.strip())
        label_text = label_text.replace(" — ", " - ").replace("—", " - ").replace(" – ", " - ")
        label_text = re.sub(r'[\s,]*\.\.\.\s*$', '', label_text.strip())

        action_url = f"/roadmap/{primary_roadmap_slug}/learn" if primary_roadmap_slug else "/dashboard"

        briefing_payload = {
            "status": "success",
            "briefing": briefing_text,
            "highlight_badge": badge_text,
            "action_cta": {
                "label": label_text,
                "url": action_url
            },
            "stats": {
                "streak_days": streak_days,
                "active_roadmaps_count": len(roadmaps),
                "sessions_last_7_days": sessions_last_7_days
            }
        }

        # Save to database metadata to enforce once-per-day generation and persistent retrieval
        try:
            updated_metadata = dict(meta) if isinstance(meta, dict) else {}
            updated_metadata["daily_briefing"] = {
                "date": today_str,
                "data": briefing_payload,
                "briefing": briefing_text
            }
            sb.table("profiles").update({"metadata": updated_metadata}).eq("email", email).execute()
        except Exception as e:
            logger.warning(f"Failed to persist daily briefing to database: {e}")

        return briefing_payload
