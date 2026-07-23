import asyncio
import os
import sys
import logging

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv(".env")

from app.core.supabase_client import get_supabase_client
from app.utils.youtube_client import search_youtube_videos
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    sb = get_supabase_client()
    
    logger.info("Fetching roadmap 1371...")
    res = sb.table("roadmaps").select("roadmap_plan, title").eq("id", 1371).execute()
    if not res.data:
        logger.error("Roadmap 1371 not found.")
        return
        
    roadmap_plan = res.data[0]["roadmap_plan"]
    title = res.data[0]["title"]
    
    logger.info(f"Enriching roadmap: {title}")
    
    for module in roadmap_plan.get("modules", []):
        for topic in module.get("topics", []):
            if settings.YOUTUBE_API_KEY:
                try:
                    search_query = topic.get("youtube_search_query") or f"{title} {topic.get('title', '')} lecture"
                    logger.info(f"YT Search: {search_query}")
                    results = await search_youtube_videos(search_query, max_results=1, topic_title=topic.get('title', ''), strict_official_sources=False)
                    if results:
                        topic["youtube_video_id"] = results[0]["video_id"]
                        topic["youtube_video_title"] = results[0]["video_title"]
                        topic["duration"] = results[0].get("duration_minutes", 10)
                    await asyncio.sleep(0.5) # rate limit
                except Exception as yt_err:
                    logger.error(f"YouTube enrichment failed for topic {topic.get('title', '')}: {yt_err}")
        
        search_query = module.get("optimal_search_query")
        if search_query:
            def fetch_ddg():
                try:
                    from duckduckgo_search import DDGS
                    with DDGS() as ddgs:
                        return list(ddgs.text(search_query, max_results=3))
                except ImportError:
                    try:
                        from ddgs import DDGS
                        with DDGS() as ddgs:
                            return list(ddgs.text(search_query, max_results=3))
                    except Exception as e:
                        logger.error(f"Import DDGS failed: {e}")
                        return []
                except Exception as e:
                    logger.error(f"DDG search failed for query {search_query}: {e}")
                    return []
            
            logger.info(f"DDG Search: {search_query}")
            ddg_results = await asyncio.to_thread(fetch_ddg)
            if ddg_results:
                module["resources"] = [{"title": r["title"], "url": r["href"], "type": "article"} for r in ddg_results]
                
    logger.info("Updating roadmap in Supabase...")
    update_res = sb.table("roadmaps").update({"roadmap_plan": roadmap_plan}).eq("id", 1371).execute()
    if update_res.data:
        logger.info("Successfully updated roadmap 1371 with resources and videos!")
    else:
        logger.error("Failed to update.")

if __name__ == "__main__":
    asyncio.run(main())
