#!/usr/bin/env python3
"""Force set a roadmap's progress to 100% (completed).

Usage:
    python3 force_complete_roadmap.py <roadmap_slug>

The script:
1. Looks up the roadmap by its slug.
2. Calls the internal `transition_roadmap_status` function to mark it as `completed`.
   This ensures proper side‑effects: coin award, skill extraction, and certificate generation.
3. If the roadmap is already completed, it exits gracefully.

It must be run inside the project's backend directory where the environment
variables for Supabase are available (as configured by the app).
"""
import sys
import asyncio
from urllib.parse import unquote

# Adjust the import path so that we can import the application modules when run as a script.
import os
import pathlib

# Ensure the directory containing the 'app' package (backend) is on PYTHONPATH.
backend_dir = pathlib.Path(__file__).resolve().parents[1]
sys.path.append(str(backend_dir))

from app.core.supabase_client import get_supabase_client
from app.routers.roadmaps import transition_roadmap_status

async def main(slug: str):
    # Decode potential URL‑encoded slug
    slug = unquote(slug)
    sb = get_supabase_client()
    # Find the roadmap with this slug (public or owned)
    res = sb.table("roadmaps").select("id, status, email, title").eq("slug", slug).execute()
    if not res.data:
        print(f"[error] No roadmap found with slug '{slug}'.")
        return
    roadmap = res.data[0]
    roadmap_id = roadmap["id"]
    current_status = roadmap.get("status", "active")
    if current_status == "completed":
        print(f"[info] Roadmap '{slug}' (id={roadmap_id}) is already completed.")
        return
    # We need the owner's email and supabase_uid for side‑effects.
    owner_email = roadmap.get("email")
    # Fetch the owner's profile to retrieve supabase_uid.
    profile_res = sb.table("profiles").select("supabase_uid").eq("email", owner_email).single().execute()
    user_uid = profile_res.data.get("supabase_uid") if profile_res.data else None
    # Transition status to completed.
    await transition_roadmap_status(roadmap_id, "completed", owner_email, user_uid)
    print(f"[success] Roadmap '{slug}' (id={roadmap_id}) marked as completed.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 force_complete_roadmap.py <roadmap_slug>")
        sys.exit(1)
    asyncio.run(main(sys.argv[1]))
