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


def _parse_datetime(val) -> datetime | None:
    """Parse various date/datetime formats from Supabase into UTC datetime."""
    if not val:
        return None
    if isinstance(val, datetime):
        return val if val.tzinfo else val.replace(tzinfo=timezone.utc)
    if isinstance(val, date):
        return datetime.combine(val, datetime.min.time(), tzinfo=timezone.utc)
    if isinstance(val, str):
        val = val.strip()
        try:
            if val.endswith("Z"):
                val = val[:-1] + "+00:00"
            dt = datetime.fromisoformat(val)
            if not dt.tzinfo:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except Exception:
            try:
                d = date.fromisoformat(val[:10])
                return datetime.combine(d, datetime.min.time(), tzinfo=timezone.utc)
            except Exception:
                return None
    return None


def _format_relative_time(val, now_utc: datetime) -> str:
    """Return a human-friendly relative time string for LLM contextual awareness."""
    dt = _parse_datetime(val)
    if not dt:
        return "Unknown date"
    diff_days = (now_utc.date() - dt.date()).days
    if diff_days <= 0:
        return "today"
    elif diff_days == 1:
        return "yesterday (1 day ago)"
    else:
        return f"{diff_days} days ago ({dt.strftime('%Y-%m-%d')})"


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
        now_utc = datetime.now(timezone.utc)
        today_date = now_utc.date()
        today_str = today_date.isoformat()

        # 1. Fetch user profile stats & existing briefing from DB metadata
        profile_res = sb.table("profiles").select("display_name, current_streak, eulercoins, metadata, last_active_date").eq("email", email).execute()
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

        # 3. Fetch learning sessions (retrieve recent sessions for history and pacing)
        try:
            sessions_res = sb.table("learning_sessions").select("duration_seconds, created_at").eq("user_id", uid).order("created_at", desc=True).limit(50).execute()
            recent_sessions = sessions_res.data or []
        except Exception as e:
            logger.warning(f"Error fetching learning_sessions for briefing: {e}")
            recent_sessions = []

        seven_days_ago_iso = (now_utc - timedelta(days=7)).isoformat()
        sessions_last_7_days = sum(1 for s in recent_sessions if s.get("created_at", "") >= seven_days_ago_iso)

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

        # Format quizzes and submissions with explicit relative times so LLM knows their exact age
        formatted_quizzes = []
        for q in recent_quizzes:
            created = q.get("created_at")
            formatted_quizzes.append({
                "topic": q.get("topic_name") or "Practice Topic",
                "score": q.get("score"),
                "status": q.get("status"),
                "when": _format_relative_time(created, now_utc)
            })

        formatted_submissions = []
        for s in recent_submissions:
            submitted = s.get("submitted_at")
            eval_text = (s.get("evaluation") or "").strip()
            if len(eval_text) > 120:
                eval_text = eval_text[:117] + "..."
            formatted_submissions.append({
                "evaluation_level": s.get("evaluation_level"),
                "summary": eval_text,
                "when": _format_relative_time(submitted, now_utc)
            })

        # Calculate user activity chronology across all tables
        activity_timestamps = []

        if profile.get("last_active_date"):
            dt = _parse_datetime(profile.get("last_active_date"))
            if dt:
                activity_timestamps.append(dt)

        for s in recent_sessions:
            dt = _parse_datetime(s.get("created_at"))
            if dt:
                activity_timestamps.append(dt)

        for q in recent_quizzes:
            dt = _parse_datetime(q.get("created_at"))
            if dt:
                activity_timestamps.append(dt)

        for sub in recent_submissions:
            dt = _parse_datetime(sub.get("submitted_at"))
            if dt:
                activity_timestamps.append(dt)

        for r in roadmaps:
            dt = _parse_datetime(r.get("updated_at"))
            if dt:
                activity_timestamps.append(dt)

        days_since_activity = None
        days_since_prior = None
        activity_context = "New learner or no prior activity recorded"

        if activity_timestamps:
            latest_activity_dt = max(activity_timestamps)
            days_since_activity = max(0, (today_date - latest_activity_dt.date()).days)
            last_active_date_str = latest_activity_dt.strftime("%Y-%m-%d")

            prior_activities = [dt for dt in activity_timestamps if dt.date() < today_date]
            if prior_activities:
                latest_prior_dt = max(prior_activities)
                days_since_prior = max(1, (today_date - latest_prior_dt.date()).days)
                prior_date_str = latest_prior_dt.strftime("%Y-%m-%d")
            else:
                latest_prior_dt = None
                days_since_prior = None
                prior_date_str = None

            if days_since_activity == 0:
                if days_since_prior and days_since_prior > 1:
                    activity_context = f"Active today. Prior activity before today was {days_since_prior} days ago on {prior_date_str} (learner is returning after a break)."
                elif days_since_prior == 1:
                    activity_context = "Active today and yesterday (consistent study streak)."
                else:
                    activity_context = "Active today (first recorded session)."
            elif days_since_activity == 1:
                activity_context = "Active yesterday (1 day ago, consistent study rhythm)."
            else:
                activity_context = f"Returning after a break: {days_since_activity} days since last activity (last active on {last_active_date_str})."

        # 6. Fetch upcoming / scheduled study tasks
        today_iso = today_str
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
                "last_updated": _format_relative_time(r.get("updated_at"), now_utc),
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

        # Fallback values tailored to returning vs daily active learners
        is_returning = False
        if days_since_activity is not None and days_since_activity > 1:
            is_returning = True
        elif days_since_prior is not None and days_since_prior > 1:
            is_returning = True

        if is_returning:
            fallback_briefing = f"Welcome back, {display_name}. Great to see you back. Pick up right where you left off by advancing through your study goals."
            fallback_badge = "WELCOME BACK"
            fallback_label = "Resume Learning"
        else:
            fallback_briefing = f"Welcome back, {display_name}. Keep your momentum going today by advancing through your study goals."
            fallback_badge = "PROGRESS"
            fallback_label = "Continue Learning"

        if next_action_topic:
            t_name = next_action_topic["topic"]
            if is_returning:
                fallback_briefing = f"Welcome back, {display_name}. Great to see you back. Ease back into your routine by tackling '{t_name}' today."
                fallback_badge = (t_name.split()[0] if t_name else "RESUME").upper()[:12]
                fallback_label = f"Resume: {t_name}"[:36]
            else:
                fallback_briefing = f"Welcome back, {display_name}. Ready to dive back in? You're on track to master '{t_name}' next. Keep your momentum going and tackle your next milestone today."
                fallback_badge = (t_name.split()[0] if t_name else "UP NEXT").upper()[:12]
                fallback_label = f"Continue: {t_name}"[:36]

        # 8. LLM synthesis
        days_since_display = f"{days_since_activity} days" if days_since_activity is not None else "N/A (New learner)"

        prompt = f"""
You are Goldfish, the personal AI study co-pilot on EulerFold.
Analyze the following learner activity dossier and write a concise, motivating, actionable daily study briefing (3-4 sentences maximum).

Learner Name: {display_name}
Current Study Streak: {streak_days} days
Days Since Last Activity: {days_since_display}
Last User Activity Context: {activity_context}
Total Focus Sessions (last 7 days): {sessions_last_7_days}
Active Roadmaps: {json.dumps(roadmap_summaries)}
Recent Practice Quizzes: {json.dumps(formatted_quizzes)}
Top Verified Skills: {json.dumps(top_skills)}
Recent Proof-of-Work Submissions: {json.dumps(formatted_submissions)}
Upcoming Study Tasks: {json.dumps(scheduled_tasks)}
Next Recommended Learning Target: {json.dumps(next_action_topic)}

INSTRUCTIONS:
1. Greet the learner warmly by their first name ({display_name}).
2. TIMING & RETURNING LEARNER AWARENESS (CRITICAL):
   - Pay close attention to 'Days Since Last Activity', 'Last User Activity Context', and the 'when' timing on quizzes and submissions.
   - If the learner is returning after a break (Days Since Last Activity > 1 or prior activity was > 1 day ago): warmly welcome them back into their study rhythm. DO NOT claim that old quizzes, submissions, or milestones "just" happened or that they have active daily momentum. Acknowledge their return, encourage easing back into the groove without guilt, and guide them to their next learning target.
   - If the learner is active today or yesterday (Days Since Last Activity <= 1) with regular momentum, acknowledge their streak and consistency with encouraging directness.
   - NEVER use the word "just" or "recently" to describe an event, quiz, or submission that happened days or weeks ago. Refer to past accomplishments accurately based on the relative age provided.
3. Recommend EXACTLY ONE specific, direct action to take right now (e.g. advance their next topic, review a concept, or test their knowledge).
4. Strictly 3 to 4 sentences. NEVER use bullet points. Write in fluid, natural paragraphs.
5. NEVER sound clinical, robotic, or generic. DO NOT say "According to your logs" or "Dossier indicates". Sound like an attentive, sharp mentor who remembers everything they've studied.
6. Provide a short, uppercase 1-2 word highlight badge (e.g., 'STREAK', 'WELCOME BACK', 'PYTHON', 'CHECKPOINT', 'MILESTONE', 'PRACTICE').
7. Provide a concise button label (e.g., 'Continue: Functions', 'Resume Learning', 'Start Quiz') maximum 35 characters.

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
                "sessions_last_7_days": sessions_last_7_days,
                "days_since_last_activity": days_since_activity
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
