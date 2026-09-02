import logging
import json
import asyncio
import uuid
import urllib.parse
from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Optional, Any
from pydantic import BaseModel

from fastapi import APIRouter, HTTPException, Depends, Body
from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.core.auth import get_current_user
from app.schemas import User
from app.utils.ai_client import generate_text, robust_json_loads, call_openrouter_with_tools
from app.utils.youtube_client import search_youtube_videos, TRUSTED_CHANNELS, BANNED_CHANNELS

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/goldfish", tags=["goldfish-agent"])

from app.services.goldfish import (
    ScoutReadingRequest,
    ChatMessageItem,
    ChatAssistantRequest,
    AlternateVideoRequest,
    ScheduleSyncRequest,
    check_and_track_agent_quota,
    run_video_search_tool,
    run_scout_reading_tool,
    run_web_search_tool,
    generate_autonomous_daily_briefing,
    FREE_AGENT_LIMIT_MONTHLY
)

_check_and_track_agent_quota = check_and_track_agent_quota


@router.get("/status")
async def get_agent_status(current_user: User = Depends(get_current_user)):
    """Check agent quota and integration connections for the current user."""
    sb = get_supabase_client()

    profile_res = sb.table("profiles").select("roadmap_credits, is_pro").eq("email", current_user.email).execute()
    profile_data = profile_res.data[0] if profile_res.data else {}

    is_pro = bool(profile_data.get("is_pro") or current_user.is_pro)
    roadmap_credits = profile_data.get("roadmap_credits", 5) if not is_pro else 999

    return {
        "is_pro": is_pro,
        "monthly_limit": 5 if not is_pro else "unlimited",
        "used_this_month": max(0, 5 - roadmap_credits) if not is_pro else 0,
        "remaining_credits": roadmap_credits if not is_pro else 999,
        "connections": {
            "google_calendar": True,
            "notion": True,
            "todoist": True
        }
    }


@router.post("/scout-reading")
async def scout_reading_materials(
    payload: ScoutReadingRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Goldfish Agent Role 1: Reading & Research Scout.
    Discovers high-quality, verified documentation, technical articles, or lecture PDFs.
    Updates the module resources directly in Supabase if requested.
    """
    sb = get_supabase_client()
    quota_info = _check_and_track_agent_quota(current_user, sb)

    # 1. Fetch the target roadmap
    res = sb.table("roadmaps").select("*").eq("id", payload.roadmap_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap = res.data[0]
    is_owner = (roadmap.get("email") or "").lower() == (current_user.email or "").lower()
    is_public = bool(roadmap.get("is_public", False))
    is_admin = getattr(current_user, "is_admin", False)

    if not is_owner and not is_public and not is_admin:
        try:
            has_prog = sb.table("topic_progress").select("id").eq("roadmap_id", payload.roadmap_id).eq("user_email", current_user.email).limit(1).execute()
            if not has_prog.data:
                raise HTTPException(status_code=403, detail="You do not have permission to modify this roadmap.")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=403, detail="You do not have permission to modify this roadmap.")

    plan = roadmap.get("roadmap_plan")
    if isinstance(plan, str):
        plan = json.loads(plan)

    modules = plan.get("modules", [])
    if payload.module_index < 0 or payload.module_index >= len(modules):
        raise HTTPException(status_code=400, detail="Invalid module index")

    target_module = modules[payload.module_index]
    module_title = target_module.get("title", "")
    topics = target_module.get("topics", [])
    topic_title = ""
    if payload.topic_index is not None and 0 <= payload.topic_index < len(topics):
        topic_title = topics[payload.topic_index].get("title", "")
    
    target_subject = topic_title or module_title
    roadmap_subject = roadmap.get("subject") or roadmap.get("title", "")

    # 2. Use OpenRouter native tool calling to formulate exact search queries prioritizing topic PDFs
    tools = [
        {
            "type": "function",
            "function": {
                "name": "scout_reading_materials",
                "description": f"Searches exact lecture note PDFs, university slides, student guides for {target_subject}",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "search_queries": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": f"2 clean search queries targeting exact lecture PDFs or guides for {target_subject}"
                        }
                    },
                    "required": ["search_queries"]
                }
            }
        }
    ]

    search_queries = [f"{target_subject} lecture notes pdf", f"{target_subject} complete guide tutorial"]
    try:
        messages = [
            {"role": "system", "content": f"You are Goldfish, an expert AI educational scout. Subject: '{roadmap_subject}', Module: '{module_title}', Topic: '{target_subject}'."},
            {"role": "user", "content": f"The learner wants reading material: '{payload.prompt}'. Prioritize exact university lecture note PDFs or guides for '{target_subject}'. Call scout_reading_materials."}
        ]
        tool_res = await call_openrouter_with_tools(messages, tools, model="openrouter/free")
        tool_calls = tool_res.get("tool_calls", [])
        if tool_calls and tool_calls[0].get("function"):
            fn_args = json.loads(tool_calls[0]["function"].get("arguments", "{}"))
            if fn_args.get("search_queries"):
                search_queries = [str(q) for q in fn_args["search_queries"] if q][:2]
    except Exception as e:
        logger.warning(f"OpenRouter tool call fallback for Goldfish scout: {e}")

    # 3. Execute live web search (excluding video sites)
    def fetch_web_resources():
        found = []
        seen_urls = set()
        try:
            from ddgs import DDGS
            with DDGS() as ddgs:
                for q in search_queries:
                    clean_q = f"{q} -site:youtube.com -site:youtu.be -site:vimeo.com -site:tiktok.com -site:dailymotion.com"
                    results = list(ddgs.text(clean_q, max_results=5))
                    for r in results:
                        href = r.get("href", "")
                        href_lower = href.lower()
                        if href and href not in seen_urls and not any(v in href_lower for v in ["youtube.com", "youtu.be", "vimeo.com"]):
                            seen_urls.add(href)
                            res_type = "pdf" if href_lower.endswith(".pdf") or "pdf" in href_lower else "article"
                            found.append({
                                "title": r.get("title", "Reference Material"),
                                "url": href,
                                "type": res_type,
                                "snippet": r.get("body", "")
                            })
                            if len(found) >= 5:
                                break
        except Exception as err:
            logger.error(f"DDG scout failed in Goldfish: {err}")
        return found

    discovered = await asyncio.to_thread(fetch_web_resources)
    if not discovered:
        # Fallback search
        search_queries = [f"{target_subject} lecture notes pdf", f"{target_subject} tutorial"]
        discovered = await asyncio.to_thread(fetch_web_resources)

    def get_resource_rank(item: dict) -> int:
        url = item.get("url", "").lower()
        title = item.get("title", "").lower()
        is_pdf = item.get("type") == "pdf" or url.endswith(".pdf") or "pdf" in url

        # Priority 1: Top university / open academic domains (.edu, .ac.uk, mit.edu, stanford, berkeley, harvard, cmu, arxiv, libretexts)
        academic_domains = [
            ".edu", ".ac.uk", ".ac.in", ".edu.au", "mit.edu", "stanford.edu",
            "berkeley.edu", "cmu.edu", "harvard.edu", "ox.ac.uk", "cam.ac.uk",
            "arxiv.org", "libretexts.org", "springer.com", "openstax.org"
        ]
        is_university = any(domain in url for domain in academic_domains) or any(term in title for term in ["university", "lecture notes", "course notes"])

        if is_university and is_pdf:
            return 0  # Highest: University PDF lecture notes
        elif is_university:
            return 1  # High: University web tutorial / syllabus
        elif is_pdf:
            return 2  # Standard PDF
        elif any(doc_site in url for doc_site in ["scribd.com", "coursehero.com", "studocu.com"]):
            return 4  # Lower priority for doc aggregators
        return 3      # Standard technical articles / docs

    # Sort discovered to prioritize university resources and direct PDFs first
    discovered.sort(key=get_resource_rank)

    # 4. Format resources and update roadmap in Supabase
    formatted_new_resources = [
        {
            "title": d["title"],
            "url": d["url"],
            "type": d["type"]
        } for d in discovered[:4]
    ]

    current_resources = target_module.get("resources", [])
    if payload.action == "replace":
        target_module["resources"] = formatted_new_resources
    else:
        # Add without duplicates
        existing_urls = {r.get("url") for r in current_resources if isinstance(r, dict)}
        for item in formatted_new_resources:
            if item["url"] not in existing_urls:
                current_resources.append(item)
        target_module["resources"] = current_resources

    # Save to database
    sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", payload.roadmap_id).execute()

    return {
        "status": "success",
        "agent": "Goldfish",
        "action": payload.action,
        "module_title": module_title,
        "added_resources": formatted_new_resources,
        "total_module_resources": target_module["resources"],
        "quota": quota_info,
        "summary": f"Goldfish scouted {len(formatted_new_resources)} curated materials matching your request and updated Module {payload.module_index + 1}."
    }


@router.post("/alternate-video")
async def find_alternate_video(
    payload: AlternateVideoRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Goldfish Agent Role 2: Alternate Video / Lecture Finder.
    Uses OpenRouter native tool calling to decide the exact targeted educational YouTube video.
    """
    sb = get_supabase_client()
    quota_info = _check_and_track_agent_quota(current_user, sb)

    # 1. Fetch roadmap
    res = sb.table("roadmaps").select("*").eq("id", payload.roadmap_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap = res.data[0]
    is_owner = (roadmap.get("email") or "").lower() == (current_user.email or "").lower()
    is_public = bool(roadmap.get("is_public", False))
    is_admin = getattr(current_user, "is_admin", False)

    if not is_owner and not is_public and not is_admin:
        try:
            has_prog = sb.table("topic_progress").select("id").eq("roadmap_id", payload.roadmap_id).eq("user_email", current_user.email).limit(1).execute()
            if not has_prog.data:
                raise HTTPException(status_code=403, detail="You do not have permission to modify this roadmap.")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=403, detail="You do not have permission to modify this roadmap.")

    plan = roadmap.get("roadmap_plan")
    if isinstance(plan, str):
        plan = json.loads(plan)

    modules = plan.get("modules", [])
    if payload.module_index < 0 or payload.module_index >= len(modules):
        raise HTTPException(status_code=400, detail="Invalid module index")

    topics = modules[payload.module_index].get("topics", [])
    if payload.topic_index < 0 or payload.topic_index >= len(topics):
        raise HTTPException(status_code=400, detail="Invalid topic index")

    target_topic = topics[payload.topic_index]
    topic_title = target_topic.get("title", "")
    current_video_id = target_topic.get("youtube_video_id")
    current_video_title = target_topic.get("youtube_video_title", "")
    module_title = modules[payload.module_index].get("title", "")
    roadmap_subject = roadmap.get("subject") or roadmap.get("title", "")
    exclude_ids = {current_video_id} if current_video_id else set()
    user_prompt = payload.prompt or "Find a high quality alternative lecture for this topic."

    # 2. OpenRouter native tool calling for video search decision
    video_tools = [
        {
            "type": "function",
            "function": {
                "name": "search_youtube_lecture",
                "description": f"Searches YouTube for the best educational lecture for {topic_title} from top reputable educators",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "exact_youtube_query": {
                            "type": "string",
                            "description": f"The exact targeted YouTube search query (e.g. '{topic_title} freeCodeCamp' or '{topic_title} Traversy Media')"
                        },
                        "preferred_reputed_channel": {
                            "type": "string",
                            "description": "Top reputed educator channel name (e.g. freeCodeCamp, Programming with Mosh, Traversy Media, CS50, Corey Schafer, MIT OpenCourseWare)"
                        },
                        "explanation": {
                            "type": "string",
                            "description": "Brief 1-line reason why this video matches what the user asked for"
                        }
                    },
                    "required": ["exact_youtube_query"]
                }
            }
        }
    ]

    search_q = f"{topic_title} {user_prompt}"
    preferred_channel = payload.preferred_channel or ""
    reason = f"Selected lecture for {topic_title}."

    try:
        messages = [
            {"role": "system", "content": f"You are Goldfish, an expert AI educational assistant. Subject: '{roadmap_subject}', Module: '{module_title}', Topic: '{topic_title}'."},
            {"role": "user", "content": f"The learner asks: '{user_prompt}'. Select the best educational lecture for '{topic_title}' from a top reputed educator by calling search_youtube_lecture."}
        ]
        tool_res = await call_openrouter_with_tools(messages, video_tools, model="openrouter/free")
        tool_calls = tool_res.get("tool_calls", [])
        if tool_calls and tool_calls[0].get("function"):
            fn_args = json.loads(tool_calls[0]["function"].get("arguments", "{}"))
            if fn_args.get("exact_youtube_query"):
                search_q = fn_args["exact_youtube_query"]
                reason = fn_args.get("explanation", reason)
                if fn_args.get("preferred_reputed_channel"):
                    preferred_channel = fn_args["preferred_reputed_channel"]
        elif tool_res.get("content"):
            parsed = robust_json_loads(tool_res["content"])
            if isinstance(parsed, dict) and parsed.get("exact_youtube_query"):
                search_q = parsed["exact_youtube_query"]
                reason = parsed.get("explanation", reason)
                if parsed.get("preferred_reputed_channel"):
                    preferred_channel = parsed["preferred_reputed_channel"]
    except Exception as e:
        logger.warning(f"OpenRouter tool call error in find_alternate_video: {e}")

    # Fallback to direct generate_text if search_q wasn't customized
    if search_q == f"{topic_title} {user_prompt}":
        try:
            fallback_res = await generate_text(
                f"Topic: '{topic_title}' ({roadmap_subject}). Learner request: '{user_prompt}'. Output ONLY a JSON object with 'exact_youtube_query' and 'preferred_reputed_channel' from top educator.",
                response_mime_type="application/json"
            )
            parsed_fb = robust_json_loads(fallback_res)
            if isinstance(parsed_fb, dict) and parsed_fb.get("exact_youtube_query"):
                search_q = parsed_fb["exact_youtube_query"]
                if parsed_fb.get("preferred_reputed_channel"):
                    preferred_channel = parsed_fb["preferred_reputed_channel"]
        except Exception as err:
            logger.warning(f"Fallback generation error: {err}")

    # Append preferred channel to search query if not present
    if preferred_channel and preferred_channel.lower() not in search_q.lower():
        search_q = f"{search_q} {preferred_channel}"

    # 3. Perform the exact search on YouTube prioritizing trusted/official educational channels
    candidates = await search_youtube_videos(
        query=search_q,
        max_results=3,
        topic_title=topic_title,
        strict_official_sources=True,
        preferred_channel=preferred_channel,
        exclude_video_ids=exclude_ids
    )

    if not candidates:
        # Retry with general search against trusted channels
        candidates = await search_youtube_videos(
            query=search_q,
            max_results=3,
            topic_title=topic_title,
            strict_official_sources=False,
            preferred_channel=preferred_channel,
            exclude_video_ids=exclude_ids
        )

    if not candidates:
        # Fallback to broad topic search
        candidates = await search_youtube_videos(
            query=f"{topic_title} tutorial",
            max_results=3,
            topic_title=topic_title,
            strict_official_sources=False,
            exclude_video_ids=exclude_ids
        )

    if not candidates:
        raise HTTPException(status_code=404, detail="No suitable lecture found matching criteria.")

    chosen_candidate = candidates[0]
    channel_name = chosen_candidate.get("channel_name") or chosen_candidate.get("channel_title") or "Verified Educator"
    chosen_candidate["channel_name"] = channel_name
    chosen_candidate["channel_title"] = channel_name

    if payload.action == "replace":
        target_topic["youtube_video_id"] = chosen_candidate["video_id"]
        target_topic["youtube_video_title"] = chosen_candidate["video_title"]
        target_topic["duration"] = chosen_candidate.get("duration_minutes", 15)

        # Update in Supabase
        sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", payload.roadmap_id).execute()

    return {
        "status": "success",
        "agent": "Goldfish",
        "topic_title": topic_title,
        "selected_video": chosen_candidate,
        "all_candidates": candidates,
        "replaced": payload.action == "replace",
        "quota": quota_info,
        "summary": f"Goldfish found: {chosen_candidate['video_title']} by {channel_name}."
    }


@router.post("/generate-schedule")
async def generate_schedule(
    payload: ScheduleSyncRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Goldfish Agent Role 3: Calendar & Weekly Schedule Planner.
    Generates structured study tasks for the current/next week, inserts into study_tasks table,
    produces direct Google Calendar URL events and .ics export data.
    """
    sb = get_supabase_client()
    quota_info = _check_and_track_agent_quota(current_user, sb)

    # 1. Fetch target roadmap
    res = sb.table("roadmaps").select("*").eq("id", payload.roadmap_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap = res.data[0]
    plan = roadmap.get("roadmap_plan")
    if isinstance(plan, str):
        plan = json.loads(plan)

    modules = plan.get("modules", [])
    roadmap_title = roadmap.get("title") or roadmap.get("subject")
    roadmap_slug = roadmap.get("slug") or str(roadmap.get("id"))

    # Determine which module/week to schedule
    week_idx = (payload.week_number - 1) if payload.week_number and payload.week_number > 0 else 0
    if week_idx >= len(modules):
        week_idx = 0

    target_module = modules[week_idx]
    module_title = target_module.get("title", f"Module {week_idx + 1}")
    topics = target_module.get("topics", [])

    # 2. Fetch User Progress for Context Awareness
    completed_topic_indices = set()
    try:
        prog_res = sb.table("topic_progress").select("topic_index, completed")\
            .eq("roadmap_id", payload.roadmap_id)\
            .eq("module_number", week_idx + 1)\
            .eq("user_email", current_user.email)\
            .execute()
        for p in prog_res.data or []:
            if p.get("completed"):
                completed_topic_indices.add(p.get("topic_index", 0))
    except Exception:
        pass

    completed_topic_titles = [topics[idx].get("title", "") for idx in completed_topic_indices if 0 <= idx < len(topics)]
    remaining_topics = [t for idx, t in enumerate(topics) if idx not in completed_topic_indices]
    if not remaining_topics:
        remaining_topics = topics  # Review mode if all completed

    # Start date calculation (default to today)
    today = date.today()
    if payload.start_date:
        try:
            start_d = datetime.strptime(payload.start_date, "%Y-%m-%d").date()
        except Exception:
            start_d = today
    else:
        start_d = today

    next_monday = today + timedelta(days=(7 - today.weekday()))
    now_datetime_str = datetime.now().strftime("%A, %B %d, %Y")

    # 3. AI Intelligent Pacing & Pedagogical Grouping
    strategy_advice = ""
    scheduled_slots = []
    
    schedule_prompt = f"""You are Goldfish, an expert AI educational planner on EulerFold.
CURRENT CALENDAR CONTEXT:
- Today's Date: {now_datetime_str} ({today.isoformat()})
- Upcoming Next Monday: {next_monday.strftime("%A, %B %d, %Y")} ({next_monday.isoformat()})
- Roadmap: "{roadmap_title}"
- Active Module ({week_idx + 1}/{len(modules)}): "{module_title}"
- Completed Topics in this Module: {json.dumps(completed_topic_titles) if completed_topic_titles else "None yet (Starting fresh)"}
- Remaining Topics to Schedule: {json.dumps([t.get('title', '') for t in remaining_topics])}
- User Intensity: "{payload.intensity or 'balanced'}" (casual = 2-3 sessions/week, balanced = daily paced, intense = daily + checkpoints)
- User Preferences / Time Constraints: "{payload.custom_notes or 'none'}"

INSTRUCTIONS:
1. Pay close attention to relative time requests in User Preferences:
   * If the user mentions "next week", schedule sessions starting next week (from {next_monday.strftime('%a, %b %d')}, {next_monday.isoformat()}).
   * If the user mentions "this weekend", "starting tomorrow", or "in 2 days", calculate the exact target date (YYYY-MM-DD).
   * If the user specifies topic counts (e.g. "3 topics"), strictly select that many topics.
2. Only schedule from remaining uncompleted topics unless the user explicitly requested revision.
3. Group related prerequisite topics together when appropriate.
4. For each session, return the EXACT "scheduled_date" as "YYYY-MM-DD" (or "day_offset" from today).

Return ONLY a JSON object matching this schema:
{{
  "strategy_note": "A concise 1-2 sentence explanation of the schedule and how it accommodates the learner's constraints and active progress",
  "sessions": [
    {{
      "scheduled_date": "{today.isoformat()}",
      "topic_title": "exact title of topic",
      "focus_hint": "key concept to master during this session",
      "duration_mins": 25
    }}
  ]
}}
"""
    try:
        ai_resp = await generate_text(schedule_prompt, response_mime_type="application/json")
        parsed_schedule = robust_json_loads(ai_resp)
        if isinstance(parsed_schedule, dict) and parsed_schedule.get("sessions"):
            scheduled_slots = parsed_schedule.get("sessions", [])
            strategy_advice = parsed_schedule.get("strategy_note", "")
    except Exception as e:
        logger.warning(f"AI schedule pacing fallback: {e}")

    # Fallback to deterministic slots if AI failed
    if not scheduled_slots:
        day_offset = 0
        for t_idx, topic in enumerate(remaining_topics[:5]):
            topic_title = topic.get("title", f"Topic {t_idx + 1}")
            duration_mins = topic.get("duration", 25)
            scheduled_slots.append({
                "scheduled_date": (start_d + timedelta(days=day_offset)).isoformat(),
                "topic_title": topic_title,
                "focus_hint": f"Master core concepts of {topic_title}",
                "duration_mins": duration_mins
            })
            day_offset += 2 if payload.intensity == "casual" else 1

    # 3. Build structured daily sessions from AI planned slots
    created_tasks = []
    gcal_events = []
    ics_events = []
    last_scheduled_date = start_d

    for s_idx, slot in enumerate(scheduled_slots):
        topic_title = slot.get("topic_title", f"Topic {s_idx + 1}")
        duration_mins = slot.get("duration_mins", 25)
        focus_hint = slot.get("focus_hint", "")
        
        # Parse exact target date from AI
        date_str = slot.get("scheduled_date")
        if date_str:
            try:
                task_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except Exception:
                task_date = start_d + timedelta(days=int(slot.get("day_offset", s_idx)))
        else:
            task_date = start_d + timedelta(days=int(slot.get("day_offset", s_idx)))

        if task_date > last_scheduled_date:
            last_scheduled_date = task_date

        # Module / Topic Study Session
        task_obj = {
            "user_email": current_user.email,
            "roadmap_id": payload.roadmap_id,
            "module_number": week_idx + 1,
            "task_type": "module",
            "title": f"Study: {topic_title}",
            "scheduled_date": task_date.isoformat(),
            "metadata": {
                "roadmap_title": roadmap_title,
                "roadmap_slug": roadmap_slug,
                "topic_title": topic_title,
                "duration": duration_mins,
                "focus_hint": focus_hint,
                "learn_url": f"https://www.eulerfold.com/roadmap/{roadmap_slug}/learn"
            }
        }
        created_tasks.append(task_obj)

        # Google Calendar quick-add URL
        start_dt_str = task_date.strftime("%Y%m%d") + "T140000Z"
        end_dt_str = task_date.strftime("%Y%m%d") + "T144500Z"
        gcal_title = urllib.parse.quote(f"EulerFold: {topic_title}")
        gcal_details = urllib.parse.quote(f"Study session for {roadmap_title}\nFocus: {focus_hint}\nLearn Link: https://www.eulerfold.com/roadmap/{roadmap_slug}/learn")
        gcal_url = f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={gcal_title}&dates={start_dt_str}/{end_dt_str}&details={gcal_details}"

        # Formatted day and date label (e.g. "Wed, Sep 3")
        day_label = task_date.strftime("%a, %b %d")

        gcal_events.append({
            "day": day_label,
            "title": f"Study: {topic_title}",
            "date": task_date.isoformat(),
            "formatted_date": task_date.strftime("%B %d, %Y"),
            "duration": duration_mins,
            "focus_hint": focus_hint,
            "google_calendar_url": gcal_url
        })

        # iCalendar VEVENT snippet
        uid_str = str(uuid.uuid4())
        ics_events.append(f"""BEGIN:VEVENT
UID:{uid_str}@eulerfold.com
DTSTAMP:{datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")}
DTSTART:{task_date.strftime("%Y%m%d")}T140000Z
DTEND:{task_date.strftime("%Y%m%d")}T144500Z
SUMMARY:EulerFold: {topic_title}
DESCRIPTION:Study session for {roadmap_title} - {focus_hint} - https://www.eulerfold.com/roadmap/{roadmap_slug}/learn
STATUS:CONFIRMED
END:VEVENT""")

    # Add Practice & Checkpoint Tasks
    practice_date = last_scheduled_date + timedelta(days=1)
    created_tasks.append({
        "user_email": current_user.email,
        "roadmap_id": payload.roadmap_id,
        "module_number": week_idx + 1,
        "task_type": "practice",
        "title": f"Practice & Quiz: {module_title}",
        "scheduled_date": practice_date.isoformat(),
        "metadata": {
            "roadmap_title": roadmap_title,
            "roadmap_slug": roadmap_slug,
            "learn_url": f"https://www.eulerfold.com/roadmap/{roadmap_slug}/learn"
        }
    })

    # 3. Batch insert into Supabase study_tasks table
    if created_tasks:
        try:
            sb.table("study_tasks").delete()\
                .eq("user_email", current_user.email)\
                .eq("roadmap_id", payload.roadmap_id)\
                .eq("module_number", week_idx + 1)\
                .execute()

            sb.table("study_tasks").insert(created_tasks).execute()
        except Exception as db_err:
            logger.error(f"Failed inserting study_tasks in Goldfish schedule: {db_err}")

    # Build full .ics calendar file content
    full_ics = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EulerFold//Goldfish Study Agent//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:EulerFold: {roadmap_title}
X-WR-TIMEZONE:UTC
{chr(10).join(ics_events)}
END:VCALENDAR"""

    return {
        "status": "success",
        "agent": "Goldfish",
        "roadmap_id": payload.roadmap_id,
        "week_number": week_idx + 1,
        "module_title": module_title,
        "tasks_count": len(created_tasks),
        "tasks_created_count": len(created_tasks),
        "strategy_note": strategy_advice,
        "schedule": gcal_events,
        "ics_data": full_ics,
        "quota": quota_info,
        "connected_services": {
            "google_calendar": True,
            "notion": True,
            "todoist": True
        },
        "summary": f"Goldfish scheduled {len(created_tasks)} study sessions for Week {week_idx + 1} ({module_title})."
    }


@router.post("/chat")
async def chat_with_goldfish(
    payload: ChatAssistantRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Goldfish Conversational AI Co-Pilot.
    Provides contextual explanations, answers questions, assists with problem solving,
    tracks progress, and guides the learner based on full user profile and roadmap state.
    """
    sb = get_supabase_client()
    quota_info = _check_and_track_agent_quota(current_user, sb)

    # 1. Fetch roadmap and progress
    res = sb.table("roadmaps").select("*").eq("id", payload.roadmap_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap = res.data[0]
    is_owner = (roadmap.get("email") or "").lower() == (current_user.email or "").lower()
    is_public = bool(roadmap.get("is_public", False))
    is_admin = getattr(current_user, "is_admin", False)

    if not is_owner and not is_public and not is_admin:
        # Also verify if learner has cloned or has progress records on this roadmap
        try:
            has_prog = sb.table("topic_progress").select("id").eq("roadmap_id", payload.roadmap_id).eq("user_email", current_user.email).limit(1).execute()
            if not has_prog.data:
                raise HTTPException(status_code=403, detail="You do not have permission to access this roadmap.")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=403, detail="You do not have permission to access this roadmap.")

    plan = roadmap.get("roadmap_plan")
    if isinstance(plan, str):
        plan = json.loads(plan)

    modules = plan.get("modules", [])
    if payload.module_index < 0 or payload.module_index >= len(modules):
        raise HTTPException(status_code=400, detail="Invalid module index")

    topics = modules[payload.module_index].get("topics", [])
    if payload.topic_index < 0 or payload.topic_index >= len(topics):
        raise HTTPException(status_code=400, detail="Invalid topic index")

    target_topic = topics[payload.topic_index]
    topic_title = target_topic.get("title", "")
    current_video_title = target_topic.get("youtube_video_title", "")
    module_title = modules[payload.module_index].get("title", "")
    roadmap_subject = roadmap.get("subject") or roadmap.get("title", "")

    # Calculate overall roadmap progress
    total_topics = sum(len(m.get("topics", [])) for m in modules)
    completed_keys = set()
    completed_names = []
    try:
        prog_res = sb.table("topic_progress").select("module_number, topic_index, completed").eq("roadmap_id", payload.roadmap_id).eq("user_email", current_user.email).execute()
        for p in prog_res.data or []:
            if p.get("completed"):
                m_num = p.get("module_number", 1) - 1
                t_num = p.get("topic_index", 0)
                completed_keys.add(f"{m_num + 1}-{t_num}")
                if 0 <= m_num < len(modules):
                    mod_topics = modules[m_num].get("topics", [])
                    if 0 <= t_num < len(mod_topics):
                        completed_names.append(mod_topics[t_num].get("title", ""))
    except Exception:
        pass

    completed_count = len(completed_keys)
    progress_pct = round((completed_count / total_topics * 100)) if total_topics > 0 else 0

    # Fetch user profile stats
    profile_res = sb.table("profiles").select("display_name, current_streak, eulercoins").eq("email", current_user.email).execute()
    profile = profile_res.data[0] if profile_res.data else {}
    display_name = profile.get("display_name") or current_user.email.split("@")[0]
    streak_days = profile.get("current_streak", 0)
    total_coins = profile.get("eulercoins", 0)

    # 2. Build system context
    system_prompt = f"""You are Goldfish, an expert personal AI study tutor and co-pilot on EulerFold.
You are directly assisting {display_name} master "{roadmap_subject}".

CURRENT LEARNER CONTEXT:
- Roadmap: {roadmap_subject}
- Active Module ({payload.module_index + 1}/{len(modules)}): "{module_title}"
- Active Topic ({payload.topic_index + 1}/{len(topics)}): "{topic_title}"
- Current Topic Lecture: "{current_video_title}"
- Overall Progress: {completed_count}/{total_topics} topics completed ({progress_pct}%)
- Current Study Streak: {streak_days} days | Coins Earned: {total_coins}
- Completed Topics: {', '.join(completed_names[:6]) if completed_names else 'Beginning of roadmap'}

TUTORING INSTRUCTIONS:
- Adapt directly to the learner's intent:
  * If they ask for an analogy, provide one concise, grounded analogy without excessive text.
  * If they ask for code, provide clean, commented code with a brief explanation.
  * If they ask for math or derivations, show step-by-step logic using KaTeX/LaTeX math or clear notation.
  * If they ask a direct technical question, conceptual explanation, or how topics connect to each other, answer directly from your knowledge base.
- Tool Usage Guidelines:
  * Do NOT call tools for standard conceptual questions, explanations, analogies, connections, or math derivations that you can explain directly.
  * ONLY invoke tools when explicitly asked to look up external reading materials, find video lectures, or search for live/recent external references.
- The learner has full access to this roadmap, module, and topic. Never output access disclaimers, permission warnings, or claims about not being able to access the roadmap.
- Keep answers tight and dense: aim for 1-3 focused paragraphs or structured bullet points. Avoid filler introductions and repetitive conclusions.
- Clean formatting rules:
  * Do NOT use decorative emojis in headings (e.g. avoid "### 🗺️ ..."). Use clean titles like "### Intuition", "### Step 1", or "### Code Example".
  * Use Markdown properly with line breaks: headers (###) and bullet items (-) MUST each start on their own line.
  * Put code, variables, and formulas in backticks or code blocks.
- Reference their active topic ("{topic_title}") or module ("{module_title}") when relevant to build continuity.
- Strictly adhere to EulerFold style: plain, clear English. No fluffy marketing language. Never use the words "high" or "highly" (use "multidimensional", "large-scale", "deep", etc. instead).
"""

    messages = [{"role": "system", "content": system_prompt}]
    for msg in (payload.chat_history or [])[-6:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": payload.message})

    # 3. Define multi-capability tool suite so Goldfish can autonomously invoke any assistant capabilities
    chat_tools = [
        {
            "type": "function",
            "function": {
                "name": "web_search",
                "description": "Searches the live web for authoritative definitions, math formulas, documentation, libraries, or academic papers when you need fresh or precise technical context.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Targeted technical search query"
                        }
                    },
                    "required": ["query"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "scout_reading_materials",
                "description": "Scouts high quality reading materials, university lecture PDFs, cheat sheets, or documentation for the current topic.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "search_queries": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Targeted search queries for university PDFs, lecture notes, cheat sheets"
                        }
                    },
                    "required": ["search_queries"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_youtube_lecture",
                "description": "Searches for an alternative top educator video lecture for the active topic when the user asks for a video or visual explanation.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "exact_youtube_query": {
                            "type": "string",
                            "description": "Optimized YouTube search query"
                        },
                        "preferred_reputed_channel": {
                            "type": "string",
                            "description": "Top reputed educator channel (e.g. 3Blue1Brown, MIT OpenCourseWare, StatQuest, freeCodeCamp)"
                        }
                    },
                    "required": ["exact_youtube_query"]
                }
            }
        }
    ]

    def run_live_web_search(query: str) -> str:
        try:
            from ddgs import DDGS
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=3))
                if not results:
                    return "No search results found."
                snippets = []
                for r in results:
                    snippets.append(f"Title: {r.get('title', '')}\nSnippet: {r.get('body', '')}\nURL: {r.get('href', '')}")
                return "\n\n".join(snippets)
        except Exception as err:
            logger.warning(f"Goldfish chat web search failed: {err}")
            return f"Search error: {err}"

    async def run_scout_reading_tool(queries: list) -> str:
        all_res = []
        for q in queries[:2]:
            try:
                from ddgs import DDGS
                with DDGS() as ddgs:
                    for r in ddgs.text(q, max_results=2):
                        all_res.append(f"- [{r.get('title', '')}]({r.get('href', '')}): {r.get('body', '')[:120]}...")
            except Exception:
                pass
        return "\n".join(all_res) if all_res else "No reading materials found."

    async def run_video_search_tool(query: str, preferred_channel: str = "") -> str:
        try:
            videos = await search_youtube_videos(query=query, max_results=2, topic_title=topic_title, preferred_channel=preferred_channel)
            if not videos:
                return "No matching video lectures found."
            snippets = []
            for v in videos:
                snippets.append(f"- Video: '{v.get('video_title')}' by {v.get('channel_name')} (Duration: {v.get('duration_minutes', 0)} mins, URL: https://www.youtube.com/watch?v={v.get('video_id')})")
            return "\n".join(snippets)
        except Exception as e:
            return f"Video search error: {e}"

    tools_used = []
    # 4. Call OpenRouter with tool-calling capabilities
    reply = ""
    try:
        tool_res = await call_openrouter_with_tools(messages, chat_tools, model="openrouter/free")
        tool_calls = tool_res.get("tool_calls", [])
        
        if tool_calls:
            for tc in tool_calls:
                fn_name = tc.get("function", {}).get("name")
                try:
                    fn_args = json.loads(tc.get("function", {}).get("arguments", "{}"))
                except Exception:
                    fn_args = {}

                if fn_name == "web_search":
                    search_q = fn_args.get("query") or payload.message
                    logger.info(f"Goldfish chat triggered live web search: {search_q}")
                    tools_used.append({"tool": "web_search", "label": f"Searched: {search_q[:40]}..." if len(search_q) > 40 else f"Searched: {search_q}"})
                    search_result = await asyncio.to_thread(run_live_web_search, search_q)
                elif fn_name == "scout_reading_materials":
                    q_list = fn_args.get("search_queries") or [f"{topic_title} lecture notes PDF"]
                    tools_used.append({"tool": "scout_reading", "label": f"Found Reading: {q_list[0][:30]}..." if len(q_list[0]) > 30 else f"Found Reading: {q_list[0]}"})
                    search_result = await run_scout_reading_tool(q_list)
                elif fn_name == "search_youtube_lecture":
                    vid_q = fn_args.get("exact_youtube_query") or f"{topic_title} lecture"
                    pref_ch = fn_args.get("preferred_reputed_channel") or ""
                    tools_used.append({"tool": "find_video", "label": f"Found Lecture: {pref_ch or vid_q[:30]}"})
                    search_result = await run_video_search_tool(vid_q, pref_ch)
                else:
                    search_result = "Tool completed."

                # Append assistant tool call and tool response to conversation
                messages.append({
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [tc]
                })
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.get("id", f"call_{len(tools_used)}"),
                    "name": fn_name,
                    "content": search_result
                })
                    
            # Request final answer incorporating all tool execution results
            final_res = await call_openrouter_with_tools(messages, [], model="openrouter/free")
            reply = final_res.get("content") or ""
        else:
            reply = tool_res.get("content") or ""
    except Exception as e:
        logger.warning(f"OpenRouter chat tool execution error: {e}")

    if not reply:
        prompt = f"{system_prompt}\n\nUser Question: {payload.message}\n\nAnswer directly and clearly:"
        reply = await generate_text(prompt)

    return {
        "status": "success",
        "agent": "Goldfish",
        "reply": reply,
        "tools_used": tools_used,
        "quota": quota_info,
        "context": {
            "topic_title": topic_title,
            "module_title": module_title,
            "progress_percent": progress_pct
        }
    }


@router.get("/daily-briefing")
async def get_daily_study_briefing(current_user: User = Depends(get_current_user)):
    """
    Goldfish Autonomous Daily Study Briefing.
    Aggregates comprehensive learner history across learning sessions, recent roadmaps,
    incomplete topic checkpoints, practice quiz scores, and active study pacing.
    The LLM reasons over the entire activity history to suggest the next best course of action.
    """
    sb = get_supabase_client()
    from app.services.goldfish import generate_autonomous_daily_briefing
    return await generate_autonomous_daily_briefing(current_user, sb)

