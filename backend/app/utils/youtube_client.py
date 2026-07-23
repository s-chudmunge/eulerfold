import httpx
import logging
import math
import re
from typing import List, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

# Trusted educational channels (lowercase for case-insensitive matching)
TRUSTED_CHANNELS = frozenset([
    # Universities & Institutes
    "mit opencourseware",
    "stanford",
    "stanford online",
    "stanford computer science",
    "harvard",
    "harvard university",
    "harvard cs50",
    "cs50",
    "yale courses",
    "yalecourses",
    "nptel",
    "nptelhrd",
    "nptel-noc iitm",
    "iit madras - bsc degree programme",
    "iit bombay july 2018",
    "iit roorkee",
    "iit kharagpur july 2018",
    "cmu database group",
    "carnegie mellon university",
    "uc berkeley",
    "berkeley riselab",
    "caltech",
    "caltechchannel",
    "oxford mathematics",
    "university of oxford",
    "cornell university",
    "princeton university",
    "university of michigan",
    "georgia tech",
    "coursera",
    "edx",
    "the royal institution",
    "institute for advanced study",
    "simons institute",
    # CS / Programming
    "freecodecamp.org",
    "computerphile",
    "the coding train",
    "traversy media",
    "fireship",
    "tech with tim",
    "corey schafer",
    "programming with mosh",
    "derek banas",
    "thenewboston",
    "caleb curry",
    "web dev simplified",
    "kevin powell",
    "the net ninja",
    "academind",
    "hussein nasser",
    "arjancodes",
    "mcoding",
    "william fiset",
    "back to back swe",
    "clément mihailescu",
    "cs dojo",
    "techsith",
    # Math / Science
    "3blue1brown",
    "numberphile",
    "khan academy",
    "professor leonard",
    "the organic chemistry tutor",
    "dr. trefor bazett",
    "michael penn",
    "zach star",
    "looking glass universe",
    "pbs space time",
    "veritasium",
    "mathologer",
    "blackpenredpen",
    "patrickjmt",
    "professor dave explains",
    "dr. physics a",
    "flammable maths",
    # ML / AI / Data
    "andrej karpathy",
    "yannic kilcher",
    "two minute papers",
    "sentdex",
    "statquest with josh starmer",
    "krish naik",
    "codebasics",
    "jeremy howard",
    "lex fridman",
    "machine learning street talk",
    "ai explained",
    "deeplearning.ai",
    "siraj raval",
    "data school",
    "ritvikmath",
    "aleksa gordić - the ai epiphany",
    "umar jamil",
    "serrano.academy",
    "steve brunton",
    "welch labs",
    # Systems / DevOps / Low-Level
    "networkchuck",
    "techworld with nana",
    "devops toolkit",
    "bytebytego",
    "neetcode",
    "abdul bari",
    "jenny's lectures cs it",
    "gate smashers",
    "reducible",
    "ben eater",
    "jacob sorber",
    "low level learning",
    "fasterthanlime",
    "computerscience",
])

# Words to ignore when computing title relevance
_STOPWORDS = frozenset([
    "a", "an", "the", "in", "of", "to", "for", "and", "with", "on",
    "is", "how", "what", "by", "from", "using", "vs", "it", "this",
    "that", "are", "be", "or", "not", "your", "you", "all", "do",
    "|", "-", "&", "!", "?", "#",
])


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


def _extract_keywords(text: str) -> set:
    """Extract meaningful lowercase keywords from text, stripping stopwords."""
    words = re.findall(r'[a-z0-9+#.]+', text.lower())
    return {w for w in words if w not in _STOPWORDS and len(w) > 1}


def _compute_title_relevance(topic_title: str, video_title: str) -> float:
    """Compute keyword overlap ratio between the topic and video title."""
    topic_words = _extract_keywords(topic_title)
    video_words = _extract_keywords(video_title)
    if not topic_words:
        return 0.0
    overlap = len(topic_words & video_words)
    return overlap / len(topic_words)


def _score_video(video: dict, topic_title: str) -> float:
    """
    Score a YouTube video for educational relevance.
    Returns -1.0 if the video should be excluded (duration or relevance gate).
    """
    duration_seconds = parse_iso8601_duration(video.get("contentDetails", {}).get("duration", ""))

    # Duration gate: 8-60 minutes
    if duration_seconds < 480 or duration_seconds > 3600:
        return -1.0

    title_relevance = _compute_title_relevance(topic_title, video["snippet"]["title"])

    # Relevance gate: at least 15% keyword overlap
    if title_relevance < 0.15:
        return -1.0

    view_count = int(video.get("statistics", {}).get("viewCount", "0"))
    channel_name = video["snippet"].get("channelTitle", "").lower()

    # Composite score (max ~100 points)
    relevance_score = title_relevance * 40                              # max 40
    duration_score = min(duration_seconds / 3600, 1.0) * 15            # max 15
    view_score = min(math.log10(max(view_count, 1)) / 7, 1.0) * 25    # max 25 (10M views = full)
    channel_score = 20 if channel_name in TRUSTED_CHANNELS else 0       # max 20

    return relevance_score + duration_score + view_score + channel_score


async def search_youtube_videos(
    query: str,
    max_results: int = 1,
    topic_title: str = "",
    strict_official_sources: bool = False
) -> List[Dict[str, str]]:
    """
    Search YouTube and return the best matching educational videos.
    When topic_title is provided, videos are scored by relevance, view count,
    duration, and channel trust. Otherwise falls back to duration-only filtering.
    """
    if not settings.YOUTUBE_API_KEY:
        logger.warning("YOUTUBE_API_KEY not set, skipping YouTube search.")
        return []

    search_url = "https://www.googleapis.com/youtube/v3/search"
    # We no longer append massive OR blocks to the query because the LLM is already 
    # instructed to provide a precise query, and long queries destroy YouTube's search relevance.

    search_params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 25 if strict_official_sources else 15,
        "key": settings.YOUTUBE_API_KEY,
        "videoEmbeddable": "true",
        "relevanceLanguage": "en",
    }

    try:
        async with httpx.AsyncClient() as client:
            # Step 1: Search
            search_response = await client.get(search_url, params=search_params)
            search_response.raise_for_status()
            search_data = search_response.json()

            if not search_data.get("items"):
                return []

            video_ids = [item["id"]["videoId"] for item in search_data["items"]]

            # Step 2: Fetch details (duration, stats, snippet)
            videos_url = "https://www.googleapis.com/youtube/v3/videos"
            videos_params = {
                "part": "contentDetails,snippet,statistics",
                "id": ",".join(video_ids),
                "key": settings.YOUTUBE_API_KEY,
            }

            videos_response = await client.get(videos_url, params=videos_params)
            videos_response.raise_for_status()
            videos_data = videos_response.json()

            candidates = []
            use_scoring = bool(topic_title.strip())

            OFFICIAL_KEYWORDS = [
                "mit", "stanford", "harvard", "nptel", "courseware", "university", 
                "institute", "oxford", "yale", "cambridge", "berkeley", 
                "cmu", "carnegie", "caltech", "princeton", "cornell", "georgia tech",
                "nasa", "cern", "jpl", "esa", "polytechnic", "purdue", "michigan", 
                "eth zurich", "ocw", "ucla", "imperial", "waterloo", "ieee", "acm", 
                "nsf", "darpa", "national lab", "department of"
            ]
            
            def filter_and_score(require_official: bool):
                valid = []
                for item in videos_data.get("items", []):
                    snippet = item.get("snippet", {})
                    channel_name_lower = snippet.get("channelTitle", "").lower()

                    if require_official:
                        if not any(kw in channel_name_lower for kw in OFFICIAL_KEYWORDS):
                            continue

                    if use_scoring:
                        score = _score_video(item, topic_title)
                        if score >= 0:
                            valid.append((score, item))
                    else:
                        duration_seconds = parse_iso8601_duration(item.get("contentDetails", {}).get("duration", ""))
                        if 480 <= duration_seconds <= 3600:
                            valid.append((0, item))
                return valid

            candidates = filter_and_score(strict_official_sources)

            if not candidates and strict_official_sources:
                logger.info(f"No official matches found for '{query}', relaxing official source constraint.")
                candidates = filter_and_score(False)
                
            if not candidates and use_scoring:
                logger.info(f"No relevant matches found for '{query}' against topic '{topic_title}'.")
                return []

            # Sort by score descending
            candidates.sort(key=lambda x: x[0], reverse=True)

            results = []
            for score, item in candidates[:max_results]:
                results.append({
                    "video_id": item["id"],
                    "video_title": item.get("snippet", {}).get("title", ""),
                    "duration_minutes": parse_iso8601_duration(item.get("contentDetails", {}).get("duration", "")) // 60,
                })

            if results and use_scoring:
                best_score = candidates[0][0]
                logger.info(f"YouTube: Best match for '{topic_title}' -> '{results[0]['video_title']}' (score: {best_score:.1f})")

            return results

    except Exception as e:
        logger.error(f"YouTube search/filter failed for query '{query}': {e}")

    return []
