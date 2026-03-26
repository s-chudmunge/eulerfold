import logging
from datetime import date, timedelta
from app.core.supabase_client import get_supabase_client
from app.core.coins import EulerCoins
from app.utils.eulercoins import award_coins

logger = logging.getLogger(__name__)

async def track_activity(user_email: str):
    """
    Track user activity and update streaks.
    Called on meaningful actions (module completion, topic completion).
    """
    sb = get_supabase_client()
    today = date.today()
    
    try:
        # Get current streak info
        res = sb.table("profiles").select("last_active_date, current_streak").eq("email", user_email).execute()
        if not res.data:
            return
            
        profile = res.data[0]
        last_active_str = profile.get("last_active_date")
        current_streak = profile.get("current_streak", 0)
        
        last_active = date.fromisoformat(last_active_str) if last_active_str else None
        
        if last_active == today:
            # Already active today, nothing to do
            return
            
        new_streak = 1
        if last_active == today - timedelta(days=1):
            # Consecutive day!
            new_streak = current_streak + 1
        
        # Update profile
        sb.table("profiles").update({
            "last_active_date": today.isoformat(),
            "current_streak": new_streak
        }).eq("email", user_email).execute()
        
        # Award coins for 7-day streak
        if new_streak > 0 and new_streak % 7 == 0:
            await award_coins(
                user_email, 
                EulerCoins.SEVEN_DAY_STREAK, 
                f"{new_streak}-day learning streak!"
            )
            
        logger.info(f"Updated streak for {user_email}: {new_streak} days")
    except Exception as e:
        logger.error(f"Failed to track activity/streak for {user_email}: {e}")

async def refresh_streak(user_email: str):
    """
    Check if the user's streak should be reset (missed yesterday).
    Called on dashboard load/login to keep streak status fresh.
    """
    sb = get_supabase_client()
    today = date.today()
    
    try:
        res = sb.table("profiles").select("last_active_date, current_streak").eq("email", user_email).execute()
        if not res.data:
            return
            
        profile = res.data[0]
        last_active_str = profile.get("last_active_date")
        current_streak = profile.get("current_streak", 0)
        
        if not last_active_str or current_streak == 0:
            return

        last_active = date.fromisoformat(last_active_str)
        
        # If last activity was before yesterday, streak is broken
        if last_active < today - timedelta(days=1):
            sb.table("profiles").update({
                "current_streak": 0
            }).eq("email", user_email).execute()
            logger.info(f"Streak broken for {user_email} (Last active: {last_active_str})")
            
    except Exception as e:
        logger.error(f"Failed to refresh streak for {user_email}: {e}")
