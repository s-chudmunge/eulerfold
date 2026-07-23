import asyncio
import os
import sys
import logging
import httpx

sys.path.append("/home/sankalp/Documents/projects/eulerfold/backend")
from dotenv import load_dotenv
load_dotenv("/home/sankalp/Documents/projects/eulerfold/backend/.env")

from app.core.supabase_client import get_supabase_client
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_valid_tech_video(title):
    """Filters out obvious non-technical or gaming videos."""
    title_lower = title.lower()
    # Reject Cyrillic
    if any('\u0400' <= c <= '\u04FF' for c in title):
        return False
        
    negative_words = [
        'game', 'survival', 'ocean', 'multiplayer', 'anime', 'movie', 
        'space', 'astronomy', 'trailer', 'gameplay', 'simulator', 
        'craft', 'let\'s play', 'tiny raft', 'empire', 'shark'
    ]
    for nw in negative_words:
        if nw in title_lower:
            return False
    return True

async def get_yt_video(query, used_ids):
    if not settings.YOUTUBE_API_KEY:
        return None
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 15,
        "key": settings.YOUTUBE_API_KEY,
        "relevanceLanguage": "en"
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("items", [])
            
            fallback_video = None
            
            for item in items:
                vid_id = item["id"]["videoId"]
                title = item["snippet"]["title"]
                title = title.replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'")
                
                if not is_valid_tech_video(title):
                    continue
                    
                # Save the very first valid technical video as our fallback 
                # just in case we run out of unique videos.
                if fallback_video is None:
                    fallback_video = {
                        "video_id": vid_id,
                        "video_title": title
                    }
                
                # If we found a unique one, use it immediately!
                if vid_id not in used_ids:
                    used_ids.add(vid_id)
                    return {
                        "video_id": vid_id,
                        "video_title": title
                    }
                    
            # If we exhausted all 15 results and couldn't find a UNIQUE technical video,
            # it means YouTube ran out of deep cuts. We MUST fall back to a duplicate 
            # rather than returning nothing or a gaming video.
            if fallback_video:
                logger.info(f"    [Fallback Triggered] Reusing high-quality video: {fallback_video['video_title']}")
                return fallback_video
                
    return None

async def main():
    sb = get_supabase_client()
    
    logger.info("Fetching roadmap 1371...")
    res = sb.table("roadmaps").select("roadmap_plan, title").eq("id", 1371).execute()
    if not res.data:
        logger.error("Roadmap not found")
        return
        
    roadmap_plan = res.data[0]["roadmap_plan"]
    used_ids = set() 
    
    for module in roadmap_plan.get("modules", []):
        for topic in module.get("topics", []):
            clean_title = topic.get('title', '').split('(')[0].strip()
            broad_query = f"Raft consensus algorithm {clean_title}"
            
            logger.info(f"Searching YT: {broad_query}")
            vid = await get_yt_video(broad_query, used_ids)
            if vid:
                topic["youtube_video_id"] = vid["video_id"]
                topic["youtube_video_title"] = vid["video_title"]
                topic["duration"] = 15
                logger.info(f" -> Found: {vid['video_title']}")
            else:
                logger.warning(" -> No video found.")
                
    logger.info("Updating roadmap in Supabase...")
    sb.table("roadmaps").update({"roadmap_plan": roadmap_plan}).eq("id", 1371).execute()
    logger.info("Successfully fixed roadmap 1371!")

if __name__ == "__main__":
    asyncio.run(main())
