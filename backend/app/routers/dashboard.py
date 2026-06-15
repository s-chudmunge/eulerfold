import asyncio
import logging
from typing import Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException
from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.schemas import User
from app.core.auth import get_current_user
from app.routers.profiles import get_public_profile
from app.routers.roadmaps import _enrich_roadmap_progress, _parse_roadmap_dict

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard", tags=["dashboard"])

def run_sync(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

@router.get("/overview")
async def get_dashboard_overview(current_user: User = Depends(get_current_user)):
    """
    Unified endpoint to fetch all dashboard data concurrently.
    """
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    email = current_user.email.lower()
    
    async def fetch_profile():
        def _fetch():
            p_res = sb.table("profiles").select("*").eq("supabase_uid", uid).maybe_single().execute()
            if not p_res or not p_res.data:
                return {"error": "Profile not found", "needs_onboarding": True}
            
            prof_data = p_res.data
            username = prof_data.get("username")
            if not username or username.startswith("user_") or not prof_data.get("onboarding_completed"):
                return {"error": "Needs onboarding", "needs_onboarding": True, "raw_profile": prof_data}
            return username, prof_data
        
        res = await asyncio.to_thread(_fetch)
        if isinstance(res, dict):
            return res
        username, prof_data = res

        try:
            profile_model = await asyncio.to_thread(run_sync, get_public_profile(username))
            return profile_model.dict() if hasattr(profile_model, "dict") else profile_model
        except Exception as e:
            logger.error(f"Failed to fetch public profile in overview: {e}")
            return {"error": str(e), "needs_onboarding": False, "raw_profile": prof_data}

    async def fetch_roadmaps():
        def _fetch():
            r_res = sb.table("roadmaps").select("*").eq("email", email).order("updated_at", desc=True).execute()
            return r_res.data
        data = await asyncio.to_thread(_fetch)
        if not data:
            return []
            
        enriched_data = await asyncio.to_thread(run_sync, _enrich_roadmap_progress(data, email, uid, sb, None))
        
        results = []
        for r in enriched_data:
            results.append({
                "id": r["id"],
                "slug": r.get("slug", ""),
                "title": r["title"],
                "description": r["description"],
                "roadmap_plan": _parse_roadmap_dict(r["roadmap_plan"]),
                "subject": r["subject"],
                "goal": r["goal"],
                "time_value": r["time_value"],
                "time_unit": r["time_unit"],
                "model": r["model"],
                "created_at": r["created_at"],
                "updated_at": r["updated_at"],
                "last_position": r.get("last_position", {"mIdx": 0, "tIdx": 0}),
                "is_public": r.get("is_public", False),
                "show_author": r.get("show_author", True),
                "clone_count": r.get("clone_count", 0),
                "report_count": r.get("report_count", 0),
                "average_rating": float(r.get("average_rating") or 0.0),
                "rating_count": r.get("rating_count", 0),
                "cloned_from": r.get("cloned_from"),
                "is_cloned": bool(r.get("cloned_from")),
                "progress": r.get("calculated_progress"),
                "status": r.get("calculated_status", "active"),
                "extension_count": r.get("extension_count", 0)
            })
        return results
        
    async def fetch_coins():
        def _fetch():
            prof_res = sb.table("profiles").select("eulercoins").ilike("email", email).execute()
            balance = prof_res.data[0].get("eulercoins", 0) if prof_res.data else 0
            
            tx_res = sb.table("eulercoin_transactions") \
                .select("amount, reason, created_at") \
                .ilike("user_email", email) \
                .order("created_at", desc=True) \
                .limit(10) \
                .execute()
            
            transactions = tx_res.data
            return {"balance": balance, "transactions": transactions}
        try:
            return await asyncio.to_thread(_fetch)
        except Exception as e:
            return {"balance": 0, "transactions": []}

    async def fetch_sessions_total():
        def _fetch():
            res = sb.table("learning_sessions").select("duration_seconds, created_at").eq("user_id", uid).execute()
            if not res.data:
                return {"total_seconds": 0, "active_days": 0}
            total_seconds = sum(row["duration_seconds"] for row in res.data)
            try:
                distinct_days = {row["created_at"].split("T")[0] for row in res.data}
                active_days = len(distinct_days)
            except Exception:
                active_days = 0
            return {"total_seconds": total_seconds, "active_days": active_days}
        try:
            return await asyncio.to_thread(_fetch)
        except Exception:
            return {"total_seconds": 0, "active_days": 0}

    async def fetch_sessions_weekly():
        def _fetch():
            res = sb.table("learning_sessions") \
                .select("duration_seconds, created_at") \
                .eq("user_id", uid) \
                .order("created_at", desc=True) \
                .limit(200) \
                .execute()
            return res.data or []
        try:
            return await asyncio.to_thread(_fetch)
        except Exception:
            return []

    # Run everything in parallel
    results = await asyncio.gather(
        fetch_profile(),
        fetch_roadmaps(),
        fetch_coins(),
        fetch_sessions_total(),
        fetch_sessions_weekly(),
        return_exceptions=True
    )
    
    def safe_get(idx, default):
        res = results[idx]
        if isinstance(res, Exception):
            logger.error(f"Dashboard overview fetch task {idx} failed: {res}")
            return default
        return res

    profile_data = safe_get(0, {"error": "Failed to fetch profile"})
    roadmaps_data = safe_get(1, [])
    coins_data = safe_get(2, {"balance": 0, "transactions": []})
    sessions_total_data = safe_get(3, {"total_seconds": 0, "active_days": 0})
    sessions_weekly_data = safe_get(4, [])

    return {
        "profile": profile_data,
        "roadmaps": roadmaps_data,
        "coins": coins_data,
        "sessions": {
            "total": sessions_total_data,
            "weekly": sessions_weekly_data
        }
    }
