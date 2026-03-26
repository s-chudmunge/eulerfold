import logging
from typing import Optional
from app.core.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

async def award_coins(user_email: str, amount: int, reason: str, roadmap_id: Optional[int] = None):
    """
    Award EulerCoins to a user, incrementing their profile balance and logging the transaction.
    Includes a check to prevent double-awarding for the same reason on a specific roadmap.
    """
    if amount == 0:
        return
        
    # Normalize email to prevent case-sensitivity issues
    user_email = user_email.lower()
    sb = get_supabase_client()
    try:
        # Prevent double-awarding for certain recurring but unique events
        # e.g. "Completed all topics in 'Introduction'"
        if roadmap_id and ("Completed all topics" in reason or "Completed module" in reason or "Practice Completed" in reason):
            check_res = sb.table("eulercoin_transactions") \
                .select("id") \
                .eq("user_email", user_email) \
                .eq("reason", reason) \
                .eq("roadmap_id", roadmap_id) \
                .execute()
            if check_res.data:
                return # Already awarded for this module/topic-set

        # 1. Increment profiles.eulercoins atomically via RPC
        # The RPC is case-insensitive, but we pass lowercase anyway
        sb.rpc("increment_eulercoins", {"target_email": user_email, "amount": amount}).execute()
        
        # 2. Insert transaction log
        sb.table("eulercoin_transactions").insert({
            "user_email": user_email,
            "amount": amount,
            "reason": reason,
            "roadmap_id": roadmap_id
        }).execute()
        
        logger.info(f"Awarded {amount} EulerCoins to {user_email} for: {reason}")
    except Exception as e:
        logger.error(f"Failed to award EulerCoins to {user_email}: {e}")
