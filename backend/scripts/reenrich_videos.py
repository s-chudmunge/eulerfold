"""
Re-enrich a roadmap's YouTube videos using the new scoring system.
Fetches the roadmap by slug, strips old videos, re-scores, and saves back.

Usage:
    cd backend && python scripts/reenrich_videos.py
"""
import asyncio
import json
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load env before any app imports
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.supabase_client import get_supabase_client
from app.utils.youtube_client import search_youtube_videos
from app.core.config import settings

SLUG = "llm-fine-tuning-from-scratch"


async def main():
    sb = get_supabase_client()

    # 1. Fetch roadmap by slug
    res = sb.table("roadmaps").select("id, subject, roadmap_plan").eq("slug", SLUG).execute()
    if not res.data:
        print(f"No roadmap found with slug: {SLUG}")
        return

    roadmap = res.data[0]
    roadmap_id = roadmap["id"]
    subject = roadmap.get("subject", "")
    plan = roadmap["roadmap_plan"]

    # Handle plan stored as string
    if isinstance(plan, str):
        plan = json.loads(plan)

    modules = plan.get("modules", [])
    total_topics = sum(len(m.get("topics", [])) for m in modules)
    print(f"Roadmap: {plan.get('title', 'Untitled')}")
    print(f"Subject: {subject}")
    print(f"Modules: {len(modules)}, Topics: {total_topics}")
    print(f"YouTube API Key: {'set' if settings.YOUTUBE_API_KEY else 'MISSING'}")
    print("-" * 60)

    updated = 0
    skipped = 0

    for module in modules:
        print(f"\nModule: {module.get('title', '?')}")
        for topic in module.get("topics", []):
            topic_title = topic.get("title", "")

            # Strip old video data
            old_video = topic.pop("youtube_video_id", None)
            old_title = topic.pop("youtube_video_title", None)
            topic.pop("duration", None)

            # Build search query: prefer AI-generated, fallback to subject + topic + lecture
            search_query = topic.get("youtube_search_query") or f"{subject} {topic_title} lecture"

            try:
                results = await search_youtube_videos(
                    search_query, max_results=1, topic_title=topic_title
                )
            except Exception as e:
                print(f"  ✗ {topic_title} — error: {e}")
                skipped += 1
                continue

            if results:
                topic["youtube_video_id"] = results[0]["video_id"]
                topic["youtube_video_title"] = results[0]["video_title"]
                topic["duration"] = results[0]["duration_minutes"]

                changed = old_video != results[0]["video_id"]
                marker = "★" if changed else "="
                print(f"  {marker} {topic_title}")
                print(f"      → {results[0]['video_title']} ({results[0]['duration_minutes']}min)")
                if changed and old_title:
                    print(f"      (was: {old_title})")
                updated += 1
            else:
                print(f"  ✗ {topic_title} — no suitable video found")
                skipped += 1

            # Throttle to stay within YouTube API quota
            await asyncio.sleep(0.15)

    # 2. Save back to DB
    print("\n" + "=" * 60)
    print(f"Updated: {updated}, Skipped: {skipped}")

    sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", roadmap_id).execute()
    print(f"Saved to database (roadmap id: {roadmap_id}).")


if __name__ == "__main__":
    asyncio.run(main())
