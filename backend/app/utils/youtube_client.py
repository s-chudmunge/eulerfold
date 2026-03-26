import httpx
import logging
import re
from typing import Optional, List, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

def parse_iso8601_duration(duration: str) -> int:
    """
    Parse ISO 8601 duration string (e.g., PT15M33S) into total seconds.
    """
    pattern = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')
    match = pattern.match(duration)
    if not match:
        return 0
    
    hours = int(match.group(1)) if match.group(1) else 0
    minutes = int(match.group(2)) if match.group(2) else 0
    seconds = int(match.group(3)) if match.group(3) else 0
    
    return hours * 3600 + minutes * 60 + seconds

async def search_youtube_videos(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """
    Search YouTube for multiple videos based on the query and filter out Shorts (under 5 mins).
    """
    if not settings.YOUTUBE_API_KEY:
        logger.warning("YOUTUBE_API_KEY not set, skipping YouTube search.")
        return []

    # 1. Search for a larger pool of videos because some will be filtered out
    search_url = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 15,  # Fetch more to ensure we have enough after filtering
        "key": settings.YOUTUBE_API_KEY,
        "videoEmbeddable": "true",
        "relevanceLanguage": "en"
    }

    try:
        async with httpx.AsyncClient() as client:
            # Step 1: Perform the search
            search_response = await client.get(search_url, params=search_params)
            search_response.raise_for_status()
            search_data = search_response.json()

            if not search_data.get("items"):
                return []

            # Step 2: Get video IDs to fetch duration
            video_items = search_data["items"]
            video_ids = [item["id"]["videoId"] for item in video_items]
            
            # Step 3: Fetch contentDetails for these videos to get duration
            videos_url = "https://www.googleapis.com/youtube/v3/videos"
            videos_params = {
                "part": "contentDetails,snippet",
                "id": ",".join(video_ids),
                "key": settings.YOUTUBE_API_KEY
            }
            
            videos_response = await client.get(videos_url, params=videos_params)
            videos_response.raise_for_status()
            videos_data = videos_response.json()

            results = []
            for item in videos_data.get("items", []):
                duration_str = item["contentDetails"]["duration"]
                duration_seconds = parse_iso8601_duration(duration_str)
                
                # Filter: 8 mins <= duration <= 60 mins
                if duration_seconds < 480 or duration_seconds > 3600:
                    continue
                    
                results.append({
                    "video_id": item["id"],
                    "video_title": item["snippet"]["title"],
                    "duration_minutes": duration_seconds // 60
                })
                
                if len(results) >= max_results:
                    break
                    
            return results
            
    except Exception as e:
        logger.error(f"YouTube search/filter failed for query '{query}': {e}")
    
    return []
