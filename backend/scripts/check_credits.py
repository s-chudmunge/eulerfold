
import asyncio
import os
import sys

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase_client

async def check_recent_users_credits():
    supabase = get_supabase_client()
    res = supabase.table('profiles').select('email, roadmap_credits, created_at').order('created_at', desc=True).limit(20).execute()
    for r in res.data:
        print(f"Email: {r.get('email')}, Credits: {r.get('roadmap_credits')}, Created: {r.get('created_at')}")

if __name__ == "__main__":
    asyncio.run(check_recent_users_credits())
