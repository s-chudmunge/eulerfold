"""
Sync YouTube videos from an original roadmap to all its clones.
Copies the video data (youtube_video_id, youtube_video_title, duration)
from the original's topics to matching topics in each clone.

Usage:
    cd backend && venv/bin/python scripts/sync_clone_videos.py
"""
import asyncio
import json
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.supabase_client import get_supabase_client

ORIGINAL_SLUG = "llm-fine-tuning-from-scratch"


def _parse_plan(plan):
    if isinstance(plan, str):
        return json.loads(plan)
    return plan


def _build_video_map(plan):
    """Build a map of topic_id -> video data from a roadmap plan."""
    video_map = {}
    for module in plan.get("modules", []):
        for topic in module.get("topics", []):
            topic_id = topic.get("id") or topic.get("uuid")
            if topic_id and topic.get("youtube_video_id"):
                video_map[topic_id] = {
                    "youtube_video_id": topic["youtube_video_id"],
                    "youtube_video_title": topic.get("youtube_video_title", ""),
                    "duration": topic.get("duration"),
                }
    return video_map


def _build_title_video_map(plan):
    """Fallback: map by topic title when IDs don't match across clones."""
    video_map = {}
    for module in plan.get("modules", []):
        for topic in module.get("topics", []):
            title = topic.get("title", "").strip().lower()
            if title and topic.get("youtube_video_id"):
                video_map[title] = {
                    "youtube_video_id": topic["youtube_video_id"],
                    "youtube_video_title": topic.get("youtube_video_title", ""),
                    "duration": topic.get("duration"),
                }
    return video_map


async def main():
    sb = get_supabase_client()

    # 1. Fetch original roadmap
    orig_res = sb.table("roadmaps").select("id, roadmap_plan").eq("slug", ORIGINAL_SLUG).execute()
    if not orig_res.data:
        print(f"No roadmap found with slug: {ORIGINAL_SLUG}")
        return

    original = orig_res.data[0]
    original_id = original["id"]
    original_plan = _parse_plan(original["roadmap_plan"])

    video_map_by_id = _build_video_map(original_plan)
    video_map_by_title = _build_title_video_map(original_plan)

    print(f"Original roadmap ID: {original_id}")
    print(f"Videos in original: {len(video_map_by_id)} (by ID), {len(video_map_by_title)} (by title)")

    # 2. Fetch all clones
    clones_res = sb.table("roadmaps").select("id, email, slug, roadmap_plan").eq("cloned_from", original_id).execute()

    if not clones_res.data:
        print("No clones found for this roadmap.")
        return

    print(f"Found {len(clones_res.data)} clone(s)")
    print("-" * 60)

    for clone in clones_res.data:
        clone_id = clone["id"]
        clone_email = clone.get("email", "?")
        clone_plan = _parse_plan(clone["roadmap_plan"])

        updated_count = 0
        already_correct = 0

        for module in clone_plan.get("modules", []):
            for topic in module.get("topics", []):
                topic_id = topic.get("id") or topic.get("uuid")
                topic_title = topic.get("title", "").strip().lower()

                # Try matching by ID first, then by title
                source = None
                if topic_id and topic_id in video_map_by_id:
                    source = video_map_by_id[topic_id]
                elif topic_title and topic_title in video_map_by_title:
                    source = video_map_by_title[topic_title]

                if source:
                    if topic.get("youtube_video_id") == source["youtube_video_id"]:
                        already_correct += 1
                    else:
                        old = topic.get("youtube_video_title", "(none)")
                        topic["youtube_video_id"] = source["youtube_video_id"]
                        topic["youtube_video_title"] = source["youtube_video_title"]
                        topic["duration"] = source["duration"]
                        print(f"  ★ {topic.get('title', '?')}")
                        print(f"      {old} → {source['youtube_video_title']}")
                        updated_count += 1

        if updated_count > 0:
            sb.table("roadmaps").update({"roadmap_plan": clone_plan}).eq("id", clone_id).execute()
            print(f"\n  Clone {clone_id} ({clone_email}): {updated_count} updated, {already_correct} already correct. Saved.")
        else:
            print(f"  Clone {clone_id} ({clone_email}): all {already_correct} videos already match. No update needed.")

        print()


if __name__ == "__main__":
    asyncio.run(main())
