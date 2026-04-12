
import asyncio
import os
import sys

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase_client

async def list_recent_roadmaps():
    supabase = get_supabase_client()
    res = supabase.table('roadmaps').select('id, email, user_id, created_at, subject, goal').order('created_at', desc=True).limit(20).execute()
    for r in res.data:
        print(f"ID: {r.get('id')}, Email: {r.get('email')}, UserID: {r.get('user_id')}, Created: {r.get('created_at')}, Subject: {r.get('subject')}, Goal: {r.get('goal')}")

if __name__ == "__main__":
    asyncio.run(list_recent_roadmaps())
