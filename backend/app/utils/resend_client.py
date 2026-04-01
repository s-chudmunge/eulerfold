"""
Central export point for email utilities.
This file maintains backward compatibility while delegating to decentralized email modules.
"""
import logging
from app.core.supabase_client import get_supabase_client

# Re-export from base
from .emails.base import send_email, build_html_email

# Re-export specific email types
from .emails.onboarding import send_onboarding_email
from .emails.welcome import send_welcome_email

logger = logging.getLogger(__name__)

async def get_user_coins(email: str) -> int:
    """Helper used in email context to fetch user coins if needed."""
    try:
        sb = get_supabase_client()
        res = sb.table("profiles").select("eulercoins").ilike("email", email).execute()
        if res.data:
            return res.data[0].get("eulercoins", 0)
    except Exception:
        pass
    return 0
