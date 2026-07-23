"""
Smart Video Enrichment Script (v3)
===================================
Given a roadmap ID, this script:
1. Fetches the roadmap from Supabase
2. Builds ONE large candidate pool for the entire course using multiple search strategies
3. Filters candidates by duration (8-60 min) and title sanity checks
4. Scores each video using title + description text (no transcript scraping, no IP bans)
5. For each topic, assigns the highest-scoring unique video
6. Updates the database

Usage:
    python smart_video_enrich.py <roadmap_id>
"""

import asyncio
import os
import sys
import re
import logging
import argparse

import httpx

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from app.core.supabase_client import get_supabase_client
from app.core.config import settings
from ddgs import DDGS

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ── Config ──────────────────────────────────────────────────────────────────

MIN_DURATION_MINUTES = 8
MAX_DURATION_MINUTES = 60
MAX_SEARCH_RESULTS = 25
MIN_SCORE = 2

NEGATIVE_TITLE_WORDS = {
    "game", "gameplay", "survival", "ocean", "multiplayer", "anime", "movie",
    "trailer", "reaction", "vlog", "unboxing", "prank", "shark", "empire",
    "let's play", "asmr", "cooking", "recipe", "music video", "official video",
    "fortnite", "minecraft", "roblox", "gta", "construction", "building process",
    "drawing", "how to draw", "civil engineering",
}

# Channels known for technical quality — videos from these get a score boost
TRUSTED_CHANNELS = {
    "mit opencourseware", "stanford online", "stanford", "cmu database group",
    "bytebytego", "hussein nasser", "martin kleppmann", "freecodecamp",
    "computerphile", "ben eater", "tech dummies", "gaurav sen",
    "system design interview", "arpit bhayani", "distributed systems course",
    "usenix", "acm sigplan", "strange loop", "goto conferences",
    "infoq", "devoxx", "javaone", "qcon",
}


# ── Helpers ─────────────────────────────────────────────────────────────────

def parse_iso8601_duration(duration_str: str) -> int:
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration_str or "")
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 60 + minutes + (1 if seconds > 30 else 0)


def has_cyrillic_or_cjk(text: str) -> bool:
    for c in text:
        if '\u0400' <= c <= '\u04FF':
            return True
        if '\u4E00' <= c <= '\u9FFF':
            return True
    return False


def passes_title_filter(title: str) -> bool:
    if has_cyrillic_or_cjk(title):
        return False
    title_lower = title.lower()
    for neg in NEGATIVE_TITLE_WORDS:
        if neg in title_lower:
            return False
    return True


def extract_keywords(text: str) -> list[str]:
    stop_words = {
        "the", "a", "an", "and", "or", "of", "in", "on", "to", "for", "is",
        "are", "was", "were", "be", "been", "being", "have", "has", "had",
        "do", "does", "did", "will", "would", "could", "should", "may",
        "might", "can", "shall", "with", "at", "by", "from", "as", "into",
        "through", "during", "before", "after", "above", "below", "between",
        "out", "up", "down", "what", "when", "where", "how", "why", "which",
        "who", "whom", "this", "that", "these", "those", "it", "its",
        "vs", "empty", "using", "must", "old", "part", "based",
    }
    cleaned = re.sub(r"\(.*?\)", "", text)
    cleaned = re.sub(r"[^a-zA-Z0-9\s\-]", " ", cleaned)
    words = cleaned.lower().split()
    return [w for w in words if w not in stop_words and len(w) > 2]


def decode_html_entities(text: str) -> str:
    return (text
            .replace("&amp;", "&")
            .replace("&quot;", '"')
            .replace("&#39;", "'")
            .replace("&lt;", "<")
            .replace("&gt;", ">"))


def score_video(video: dict, topic_keywords: list[str], course_keywords: list[str]) -> float:
    """
    Score a video against topic and course keywords using title + description + tags.
    Title matches are weighted 3x because they're the strongest relevancy signal.
    """
    title_lower = video["title"].lower()
    desc_lower = video["description"].lower()
    tags_lower = " ".join(video.get("tags", [])).lower()

    # Combine description + tags into one searchable blob
    body = f"{desc_lower} {tags_lower}"

    score = 0.0

    # Topic keyword scoring
    for kw in topic_keywords:
        # Title hit = 3 points (strongest signal)
        if kw in title_lower:
            score += 3.0
        # Description/tags hit = 1 point per occurrence (capped at 5 per keyword)
        score += min(body.count(kw), 5) * 1.0

    # Course keyword scoring (weighted lower, 0.5x)
    for kw in course_keywords:
        if kw in title_lower:
            score += 1.5
        score += min(body.count(kw), 3) * 0.3

    # Trusted channel bonus
    channel_lower = video.get("channel", "").lower()
    for trusted in TRUSTED_CHANNELS:
        if trusted in channel_lower:
            score += 5.0
            break

    # View count bonus (normalized, max +3)
    score += min(video["view_count"] / 200_000, 3)

    return score


# ── YouTube API Calls ───────────────────────────────────────────────────────

import yt_dlp
import asyncio

async def search_youtube(client: httpx.AsyncClient, query: str) -> list[str]:
    # 1. Direct YouTube HTML Search (Fastest, 200ms, no API quota limits)
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        }
        resp = await client.get(
            'https://www.youtube.com/results',
            params={'search_query': query},
            headers=headers,
            timeout=5.0
        )
        if resp.status_code == 200:
            vids = re.findall(r'\"videoId\":\"([a-zA-Z0-9_-]{11})\"', resp.text)
            seen = set()
            unique_vids = [v for v in vids if not (v in seen or seen.add(v))]
            if unique_vids:
                return unique_vids[:MAX_SEARCH_RESULTS]
    except Exception as e:
        print(f"Direct YouTube search failed for '{query}': {e}")

    # 2. Fallback via yt_dlp
    def _do_search():
        ydl_opts = {
            'quiet': True,
            'extract_flat': True,
            'skip_download': True,
            'socket_timeout': 3,
            'retries': 0,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f'ytsearch5:{query}', download=False)
            if 'entries' in res and res['entries']:
                return [entry.get('id') for entry in res['entries'] if entry.get('id')]
            return []
            
    try:
        return await asyncio.to_thread(_do_search)
    except Exception as e:
        return []


async def fetch_video_details(client: httpx.AsyncClient, video_ids: list[str]) -> list[dict]:
    if not video_ids:
        return []
    results = []
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i+50]
        resp = await client.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={
                "part": "snippet,contentDetails,statistics",
                "id": ",".join(batch),
                "key": settings.YOUTUBE_API_KEY,
            },
        )
        resp.raise_for_status()
        for item in resp.json().get("items", []):
            snippet = item.get("snippet", {})
            content_details = item.get("contentDetails", {})
            title = decode_html_entities(snippet.get("title", ""))
            duration = parse_iso8601_duration(content_details.get("duration", ""))
            view_count = int(item.get("statistics", {}).get("viewCount", "0"))
            results.append({
                "video_id": item["id"],
                "title": title,
                "description": snippet.get("description", ""),
                "channel": snippet.get("channelTitle", ""),
                "tags": snippet.get("tags", []),
                "duration_minutes": duration,
                "view_count": view_count,
            })
    return results


# ── Core Pipeline ───────────────────────────────────────────────────────────

async def build_course_pool(client: httpx.AsyncClient, course_title: str, modules: list[dict]) -> list[dict]:
    """
    Build ONE large candidate pool for the entire course.
    Uses multiple search strategies to maximize coverage.
    """
    all_video_ids = []
    seen_ids = set()

    def add_ids(ids):
        for vid_id in ids:
            if vid_id not in seen_ids:
                seen_ids.add(vid_id)
                all_video_ids.append(vid_id)

    course_keywords = extract_keywords(course_title)

    # Strategy 1: Broad course-level search
    broad_query = f"{' '.join(course_keywords)} lecture tutorial"
    logger.info(f"  Search 1 (broad): \"{broad_query}\"")
    add_ids(await search_youtube(client, broad_query))

    # Strategy 2: Course title directly
    logger.info(f"  Search 2 (title): \"{course_title}\"")
    add_ids(await search_youtube(client, course_title))

    # Strategy 3: Per-module searches
    for module in modules:
        module_kws = extract_keywords(module.get("title", ""))
        if module_kws:
            q = f"{' '.join(course_keywords[:3])} {' '.join(module_kws)}"
            logger.info(f"  Search 3 (module): \"{q}\"")
            add_ids(await search_youtube(client, q))

    # Strategy 4: Per-topic searches using the AI-generated youtube_search_query
    for module in modules:
        for topic in module.get("topics", []):
            yt_query = topic.get("youtube_search_query")
            if yt_query:
                logger.info(f"  Search 4 (topic): \"{yt_query}\"")
                add_ids(await search_youtube(client, yt_query))

    logger.info(f"\n  Total unique video IDs collected: {len(all_video_ids)}")

    # Fetch metadata for all (uses official API, never gets blocked)
    details = await fetch_video_details(client, all_video_ids)

    # Filter: duration + title only
    candidates = []
    for v in details:
        if not passes_title_filter(v["title"]):
            continue
        if not (MIN_DURATION_MINUTES <= v["duration_minutes"] <= MAX_DURATION_MINUTES):
            continue
        candidates.append(v)

    logger.info(f"  {len(candidates)} candidates passed filters (duration, title)")
    return candidates


def pick_best_video(candidates: list[dict], topic_title: str, course_title: str, used_ids: set) -> dict | None:
    """Pick the best video for a topic from the candidate pool."""
    topic_keywords = extract_keywords(topic_title)
    course_keywords = extract_keywords(course_title)

    scored = []
    for v in candidates:
        s = score_video(v, topic_keywords, course_keywords)
        scored.append((s, v))

    scored.sort(key=lambda x: x[0], reverse=True)

    # Log top 3 for transparency
    if scored:
        logger.info(f"    Top 3:")
        for rank, (s, v) in enumerate(scored[:3], 1):
            marker = " ←used" if v["video_id"] in used_ids else ""
            logger.info(f"      #{rank} [{s:.1f}] {v['title'][:55]} ({v['channel'][:20]}){marker}")

    # Pick highest-scoring unique video
    for total_score, v in scored:
        if v["video_id"] not in used_ids:
            if total_score >= MIN_SCORE:
                used_ids.add(v["video_id"])
                return v

    # Fallback: allow a duplicate of the top scorer rather than nothing
    if scored and scored[0][0] >= MIN_SCORE:
        logger.info(f"    [Fallback] Reusing: {scored[0][1]['title'][:55]}")
        return scored[0][1]

    return None


# ── Main ────────────────────────────────────────────────────────────────────

async def enrich_roadmap(roadmap_id: int):
    sb = get_supabase_client()

    logger.info(f"Fetching roadmap {roadmap_id}...")
    res = sb.table("roadmaps").select("roadmap_plan, title").eq("id", roadmap_id).execute()
    if not res.data:
        logger.error(f"Roadmap {roadmap_id} not found.")
        return

    roadmap_plan = res.data[0]["roadmap_plan"]
    course_title = res.data[0]["title"]
    modules = roadmap_plan.get("modules", [])
    total_topics = sum(len(m.get("topics", [])) for m in modules)
    logger.info(f"Course: {course_title}")
    logger.info(f"Modules: {len(modules)}, Topics: {total_topics}")

    async with httpx.AsyncClient(timeout=30) as client:
        # Build ONE big pool for the entire course
        logger.info(f"\n{'='*60}")
        logger.info(f"Building course-wide candidate pool")
        logger.info(f"{'='*60}")
        candidates = await build_course_pool(client, course_title, modules)

        if not candidates:
            logger.error("No candidates found. Aborting.")
            return

        # Assign videos to each topic
        used_ids = set()
        assigned = 0
        for i, module in enumerate(modules):
            module_title = module.get("title", f"Module {i+1}")
            logger.info(f"\n{'='*60}")
            logger.info(f"Module {i+1}: {module_title}")
            logger.info(f"{'='*60}")

            for topic in module.get("topics", []):
                topic_title = topic.get("title", "")
                logger.info(f"\n  Topic: {topic_title}")

                best = pick_best_video(candidates, topic_title, course_title, used_ids)
                if best:
                    topic["youtube_video_id"] = best["video_id"]
                    topic["youtube_video_title"] = best["title"]
                    topic["duration"] = best["duration_minutes"]
                    assigned += 1
                    logger.info(f"  ✓ {best['title'][:60]} ({best['duration_minutes']}m, {best['channel']})")
                else:
                    logger.warning(f"  ✗ No suitable video for: {topic_title}")

    logger.info(f"\n{'='*60}")
    logger.info(f"Assigned {assigned}/{total_topics} topics")
    logger.info(f"Unique videos used: {len(used_ids)}")
    logger.info(f"{'='*60}")

    # Save
    logger.info(f"Saving to Supabase...")
    sb.table("roadmaps").update({"roadmap_plan": roadmap_plan}).eq("id", roadmap_id).execute()
    logger.info(f"Done!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Smart Video Enrichment for EulerFold Roadmaps")
    parser.add_argument("roadmap_id", type=int, help="The roadmap ID to enrich")
    args = parser.parse_args()
    asyncio.run(enrich_roadmap(args.roadmap_id))
