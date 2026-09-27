import asyncio
import logging
import os
from datetime import datetime, date, timedelta, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Header, Query, status
from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.routers.roadmaps import _parse_roadmap_dict
from app.utils.emails.reengagement import send_reengagement_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/checkins", tags=["checkins"])

def verify_cron_key(authorization: Optional[str] = Header(None), key: Optional[str] = Query(None)):
    expected_key = settings.CHECKIN_RUN_KEY or os.getenv("CHECKIN_RUN_KEY")
    if not expected_key:
        logger.warning("CHECKIN_RUN_KEY is not configured in environment")
        return True
        
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
    elif key:
        token = key.strip()
        
    if not token or token != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing cron authorization key"
        )
    return True

async def process_inactivity_checkins(
    min_days_inactive: int = 3,
    max_days_inactive: int = 30,
    cooldown_days: int = 14,
    dry_run: bool = False
) -> Dict[str, Any]:
    """
    Scans for learners who have signed up and started learning, but have gone inactive.
    Dispatches a friendly, zero-guilt re-engagement email with their active roadmap and next incomplete topic.
    """
    sb = get_supabase_client()
    now_utc = datetime.now(timezone.utc)
    today = date.today()

    try:
        # Fetch profiles of eligible users (not unsubscribed)
        res = sb.table("profiles").select(
            "id, email, display_name, username, last_active_date, created_at, unsubscribed, metadata"
        ).execute()
        
        profiles = res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch profiles for inactivity checkins: {e}")
        return {
            "status": "error",
            "detail": f"Database query failed: {str(e)}",
            "checked_profiles": 0,
            "eligible_candidates": 0,
            "sent_emails": 0,
            "candidates": []
        }

    results = []
    sent_count = 0
    skipped_count = 0

    for p in profiles:
        email = p.get("email")
        if not email or p.get("unsubscribed") is True:
            continue

        # Check last active date (or creation date as fallback)
        last_active_str = p.get("last_active_date") or p.get("created_at")
        if not last_active_str:
            continue

        try:
            if "T" in str(last_active_str):
                last_active_dt = datetime.fromisoformat(str(last_active_str).replace("Z", "+00:00"))
                last_active_d = last_active_dt.date()
            else:
                last_active_d = date.fromisoformat(str(last_active_str))
        except Exception:
            continue

        days_inactive = (today - last_active_d).days
        if days_inactive < min_days_inactive or days_inactive > max_days_inactive:
            continue

        # Check cooldown from metadata
        metadata = p.get("metadata") or {}
        if not isinstance(metadata, dict):
            metadata = {}

        last_sent_str = metadata.get("last_reengagement_email_sent_at")
        if last_sent_str:
            try:
                last_sent_dt = datetime.fromisoformat(str(last_sent_str).replace("Z", "+00:00"))
                diff_days = (now_utc - last_sent_dt).total_seconds() / 86400.0
                if diff_days < cooldown_days:
                    skipped_count += 1
                    continue
            except Exception:
                pass

        # Check user's roadmaps to confirm they have learning content
        try:
            roadmaps_res = sb.table("roadmaps").select(
                "id, title, subject, slug, roadmap_plan, updated_at"
            ).eq("email", email).order("updated_at", desc=True).limit(3).execute()
            user_roadmaps = roadmaps_res.data or []
        except Exception as e:
            logger.warning(f"Error fetching roadmaps for {email}: {e}")
            user_roadmaps = []

        if not user_roadmaps:
            continue

        primary_r = user_roadmaps[0]
        roadmap_title = primary_r.get("title") or primary_r.get("subject") or "Your Learning Path"
        roadmap_slug = primary_r.get("slug") or str(primary_r.get("id"))
        
        # Determine next topic
        next_topic = None
        plan = _parse_roadmap_dict(primary_r.get("roadmap_plan", {}))
        modules = plan.get("modules") or []
        
        # Check module progress if available
        try:
            mp_res = sb.table("module_progress").select(
                "module_number, topic_index, completed"
            ).eq("roadmap_id", primary_r.get("id")).eq("user_email", email).execute()
            completed_set = {
                (row.get("module_number"), row.get("topic_index"))
                for row in (mp_res.data or [])
                if row.get("completed")
            }
        except Exception:
            completed_set = set()

        for m_idx, mod in enumerate(modules, start=1):
            topics = mod.get("topics") or mod.get("lessons") or []
            for t_idx, top in enumerate(topics):
                if (m_idx, t_idx) not in completed_set:
                    t_title = top.get("topic") or top.get("title")
                    if t_title:
                        next_topic = t_title
                        break
            if next_topic:
                break

        candidate_info = {
            "email": email,
            "display_name": p.get("display_name") or p.get("username"),
            "days_inactive": days_inactive,
            "roadmap_title": roadmap_title,
            "roadmap_slug": roadmap_slug,
            "next_topic": next_topic,
        }

        if not dry_run:
            try:
                await send_reengagement_email(
                    to=email,
                    display_name=p.get("display_name") or p.get("username"),
                    roadmap_title=roadmap_title,
                    roadmap_slug=roadmap_slug,
                    next_topic=next_topic,
                    days_inactive=days_inactive,
                    unsubscribe_link=f"https://www.eulerfold.com/unsubscribe?email={email}"
                )
                
                metadata["last_reengagement_email_sent_at"] = now_utc.isoformat()
                sb.table("profiles").update({"metadata": metadata}).eq("email", email).execute()
                
                candidate_info["status"] = "sent"
                sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send reengagement email to {email}: {e}")
                candidate_info["status"] = f"error: {str(e)}"
        else:
            candidate_info["status"] = "dry_run"

        results.append(candidate_info)

    return {
        "status": "success",
        "dry_run": dry_run,
        "checked_profiles": len(profiles),
        "eligible_candidates": len(results),
        "sent_emails": sent_count,
        "cooldown_skipped": skipped_count,
        "candidates": results
    }

@router.post("/run_due")
async def run_due_inactivity_checkins(
    min_days_inactive: int = Query(3, ge=1, le=60, description="Minimum days of inactivity"),
    max_days_inactive: int = Query(30, ge=1, le=120, description="Maximum days of inactivity"),
    cooldown_days: int = Query(14, ge=1, le=90, description="Minimum days between re-engagement emails"),
    dry_run: bool = Query(False, description="Preview candidates without sending emails"),
    _authorized: bool = Depends(verify_cron_key)
):
    """
    HTTP endpoint to trigger inactivity checkins manually or via external cron.
    """
    res = await process_inactivity_checkins(
        min_days_inactive=min_days_inactive,
        max_days_inactive=max_days_inactive,
        cooldown_days=cooldown_days,
        dry_run=dry_run
    )
    if res.get("status") == "error":
        raise HTTPException(status_code=500, detail=res.get("detail", "Processing error"))
    return res

async def start_inactivity_scheduler():
    """
    Background worker loop that runs inside FastAPI.
    Wakes up once every 24 hours to automatically check and send re-engagement emails.
    """
    logger.info("Inactivity scheduler: Background task started. Initial delay: 60s.")
    try:
        await asyncio.sleep(60)
    except asyncio.CancelledError:
        logger.info("Inactivity scheduler cancelled during initial sleep.")
        return

    while True:
        try:
            logger.info("Inactivity scheduler: Running scheduled daily check...")
            res = await process_inactivity_checkins()
            logger.info(
                f"Inactivity scheduler completed pass: checked {res.get('checked_profiles', 0)} learners, "
                f"sent {res.get('sent_emails', 0)} re-engagement emails, "
                f"{res.get('cooldown_skipped', 0)} skipped on cooldown."
            )
        except asyncio.CancelledError:
            logger.info("Inactivity scheduler received cancellation. Exiting loop.")
            break
        except Exception as e:
            logger.error(f"Inactivity scheduler error during daily check: {e}")

        # Sleep 24 hours (86,400 seconds)
        try:
            await asyncio.sleep(86400)
        except asyncio.CancelledError:
            logger.info("Inactivity scheduler cancelled during sleep. Exiting.")
            break
