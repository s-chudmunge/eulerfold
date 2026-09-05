import logging
import json
from datetime import datetime, date, timedelta, timezone
from app.schemas import User
from app.utils.ai_client import generate_text, robust_json_loads

logger = logging.getLogger(__name__)


async def generate_autonomous_daily_briefing(current_user: User, sb) -> dict:
    """
    Aggregates comprehensive learner history across learning sessions, recent roadmaps,
    incomplete topic checkpoints, practice quiz scores, and active study pacing.
    Saves and returns the briefing payload from user profile metadata.
    """
    uid = current_user.supabase_uid
    email = (current_user.email or "").lower()

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

    today_str = date.today().isoformat()
    existing_briefing = meta.get("daily_briefing") if isinstance(meta, dict) else None

    # If already generated today in DB, serve immediately from DB
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
        r_id = r["id"]
        plan = r.get("roadmap_plan")
        if isinstance(plan, str):
            try:
                plan = json.loads(plan)
            except Exception:
                plan = {}
        
        modules = plan.get("modules", []) if isinstance(plan, dict) else []
        total_topics = sum(len(m.get("topics", [])) for m in modules)

        # Get topic progress for this roadmap
        completed_set = set()
        try:
            p_res = sb.table("topic_progress").select("module_number, topic_index, completed").eq("roadmap_id", r_id).eq("user_email", email).execute()
            for p in p_res.data or []:
                if p.get("completed"):
                    completed_set.add(f"{p.get('module_number', 1)}-{p.get('topic_index', 0)}")
        except Exception:
            pass

        # Identify next incomplete topic
        first_incomplete = None
        for m_i, mod in enumerate(modules):
            for t_i, top in enumerate(mod.get("topics", [])):
                if f"{m_i + 1}-{t_i}" not in completed_set and not first_incomplete:
                    first_incomplete = {
                        "module_index": m_i,
                        "topic_index": t_i,
                        "topic_title": top.get("title", ""),
                        "module_title": mod.get("title", f"Module {m_i + 1}")
                    }

        summary_item = {
            "title": r.get("title") or r.get("subject"),
            "subject": r.get("subject"),
            "completed_count": len(completed_set),
            "total_topics": total_topics,
            "next_incomplete": first_incomplete,
            "last_updated": r.get("updated_at")
        }
        roadmap_summaries.append(summary_item)

        if not primary_roadmap and first_incomplete:
            primary_roadmap = r
            next_action_topic = first_incomplete
            primary_roadmap_slug = r.get("slug") or str(r.get("id"))

    # Fallback primary roadmap if all completed
    if not primary_roadmap and roadmaps:
        primary_roadmap = roadmaps[0]
        primary_roadmap_slug = primary_roadmap.get("slug") or str(primary_roadmap.get("id"))

    # 8. Synthesize comprehensive AI prompt with full activity data
    today_formatted = datetime.now().strftime("%A, %B %d, %Y")
    
    prompt = f"""You are Goldfish, the personal AI study tutor and co-pilot on EulerFold.
Generate a concise, insightful, personalized Daily Study Briefing for {display_name}.
Current Date: {today_formatted}

LEARNER 360 PROFILE & COMPLETE DATA:
- Study Streak: {streak_days} days | EulerCoins: {profile.get('eulercoins', 0)}
- Learning Sessions Logged (Last 7 Days): {sessions_last_7_days} sessions ({len(recent_sessions)} in last 14 days)
- Active Roadmaps Created/Studied ({len(roadmaps)} total):
{json.dumps(roadmap_summaries, indent=2)}

- Upcoming Scheduled Study Tasks (Calendar):
{json.dumps(scheduled_tasks, indent=2)}

- Recent Practice Quiz Scores (MCQs):
{json.dumps(recent_quizzes, indent=2)}

- Evaluated Homework & Proof-of-Work Submissions:
{json.dumps(recent_submissions, indent=2)}

- Current Verified Skill Levels:
{json.dumps(top_skills, indent=2)}

INSTRUCTIONS:
1. Reason holistically across all tables and activities:
   - Recognize overarching learning paths or goals across active roadmaps.
   - Recognize recent consistency vs inactivity gaps over the past 14 days.
   - Reference scheduled calendar tasks, homework feedback, or the next unfinished topic.
2. How to talk about metrics & skill levels:
   - Be helpful, conversational, and encouraging. Never regurgitate raw internal floats, decimals (e.g. never write "0.015 to 0.12"), or bureaucratic stats dumps.
   - If mentioning skill progress or quiz scores, frame them naturally in terms of learning stages (e.g., "early stages", "getting comfortable with fundamentals", "ready for practice") or rounded percentages if truly helpful.
3. Be genuinely helpful:
   - Avoid generic robotic critique (such as scolding the user for opening multiple roadmaps or logging sessions without completions).
   - Instead, give practical perspective: highlight what's next, what will give them the cleanest learning win today, or how finishing their current step builds into their bigger goals.
4. Keep the message concise (2-3 sentences).
5. Choose a short 1-2 word highlight badge reflecting their focus (e.g., "PYTHON", "FOUNDATIONS", "REVISION", "MOMENTUM", "PRACTICE").
6. Tone: Direct, honest, encouraging, and clear. Avoid fluffy buzzwords (never use the words "high" or "highly"). NEVER use em dashes (—) or en dashes (–); use standard commas, periods, or parentheses instead.
7. Output ONLY a valid JSON object matching this schema:
{{
  "briefing": "2-3 sentences of helpful, personalized guidance and recommended focus",
  "highlight_badge": "PYTHON",
  "suggested_action_label": "Continue: [Topic Name]"
}}"""

    fallback_briefing = f"Welcome back! Continue with your next topic to maintain your {streak_days}-day study streak."
    fallback_badge = "STUDY PLAN"
    fallback_label = f"Continue: {next_action_topic.get('topic_title')}" if next_action_topic else "Continue Learning"

    try:
        from app.utils.ai_client import current_ai_subject
        current_ai_subject.set("Goldfish Daily Briefing")
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

    # Sanitize any accidental em dashes or en dashes
    briefing_text = briefing_text.replace(" — ", ", ").replace("—", ", ").replace(" – ", ", ").replace("–", "-")
    label_text = label_text.replace(" — ", " - ").replace("—", " - ").replace(" – ", " - ")

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
