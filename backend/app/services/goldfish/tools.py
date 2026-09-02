import logging
import json
import asyncio
from app.utils.youtube_client import search_youtube_videos, TRUSTED_CHANNELS, BANNED_CHANNELS

logger = logging.getLogger(__name__)


async def run_video_search_tool(query: str, preferred_channel: str = "") -> str:
    """Execute live educational video search with domain heuristics."""
    try:
        candidates = await asyncio.to_thread(search_youtube_videos, query, max_results=6)
        if not candidates:
            return f"No suitable YouTube video lectures found for query '{query}'."

        formatted_candidates = []
        for v in candidates[:3]:
            formatted_candidates.append(
                f"- Title: {v.get('title')}\n  Channel: {v.get('channel')}\n  Duration: {v.get('duration_formatted')}\n  URL: https://www.youtube.com/watch?v={v.get('video_id')}"
            )
        return "Top educational video lecture candidates:\n" + "\n".join(formatted_candidates)
    except Exception as err:
        return f"Error searching YouTube lectures: {str(err)}"


async def run_scout_reading_tool(search_queries: list) -> str:
    """Execute live reading material search prioritizing PDFs and universities."""
    def fetch_web_resources():
        found = []
        seen_urls = set()
        try:
            from ddgs import DDGS
            with DDGS() as ddgs:
                for q in search_queries:
                    clean_q = f"{q} -site:youtube.com -site:youtu.be -site:vimeo.com"
                    results = list(ddgs.text(clean_q, max_results=4))
                    for r in results:
                        href = r.get("href", "")
                        href_lower = href.lower()
                        if href and href not in seen_urls:
                            seen_urls.add(href)
                            res_type = "pdf" if href_lower.endswith(".pdf") or "pdf" in href_lower else "article"
                            found.append(f"- [{res_type.upper()}] {r.get('title')}: {href}\n  Summary: {r.get('body', '')[:120]}...")
                            if len(found) >= 4:
                                break
        except Exception as err:
            logger.error(f"DDG search error: {err}")
        return found

    results = await asyncio.to_thread(fetch_web_resources)
    if not results:
        return "No specific reading materials or PDFs found for the given search queries."
    return "Discovered academic & reading materials:\n" + "\n".join(results)


async def run_web_search_tool(query: str) -> str:
    """Execute real-time web search for fresh technical information."""
    def fetch_web():
        items = []
        try:
            from ddgs import DDGS
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=4))
                for r in results:
                    items.append(f"- {r.get('title')}: {r.get('href')}\n  {r.get('body', '')[:140]}...")
        except Exception as err:
            logger.error(f"Web search error: {err}")
        return items

    items = await asyncio.to_thread(fetch_web)
    if not items:
        return f"No external search results found for '{query}'."
    return f"Live search results for '{query}':\n" + "\n".join(items)
