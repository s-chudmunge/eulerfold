import logging
from typing import Dict, Any
from fastapi import HTTPException
from app.schemas import User

logger = logging.getLogger(__name__)

FREE_AGENT_LIMIT_MONTHLY = 5


def check_and_track_agent_quota(user: User, sb) -> Dict[str, Any]:
    """Check if the user is allowed to invoke Goldfish and record usage."""
    if user.is_pro:
        return {"allowed": True, "is_pro": True, "remaining": 999}

    # Fetch user profile data
    profile_res = sb.table("profiles").select("roadmap_credits, is_pro").eq("email", user.email).execute()
    profile_data = profile_res.data[0] if profile_res.data else {}

    is_pro = bool(profile_data.get("is_pro") or user.is_pro)
    if is_pro:
        return {"allowed": True, "is_pro": True, "remaining": 999}

    roadmap_credits = profile_data.get("roadmap_credits", 5)
    if roadmap_credits <= 0:
        raise HTTPException(
            status_code=402,
            detail="You have used all free Goldfish requests. Upgrade to Pro for unlimited agent assistance."
        )

    # Decrement credit
    new_credits = max(0, roadmap_credits - 1)
    sb.table("profiles").update({"roadmap_credits": new_credits}).eq("email", user.email).execute()

    return {
        "allowed": True,
        "is_pro": False,
        "used": max(0, 5 - new_credits),
        "remaining": new_credits
    }


def verify_roadmap_access(roadmap_id: int, user_email: str, is_admin: bool, sb) -> dict:
    """Verify that the user owns, has cloned, or has permission to view/modify the roadmap."""
    res = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap = res.data[0]
    is_owner = (roadmap.get("email") or "").lower() == (user_email or "").lower()
    is_public = bool(roadmap.get("is_public", False))

    if not is_owner and not is_public and not is_admin:
        try:
            has_prog = sb.table("topic_progress").select("id").eq("roadmap_id", roadmap_id).eq("user_email", user_email).limit(1).execute()
            if not has_prog.data:
                raise HTTPException(status_code=403, detail="You do not have permission to access this roadmap.")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=403, detail="You do not have permission to access this roadmap.")

    return roadmap
