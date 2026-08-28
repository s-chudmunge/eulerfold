import httpx
import logging
import math
import re
import os
import cohere
from typing import List, Dict
from app.core.config import settings

async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    api_key = settings.COHERE_API_KEY or os.getenv("COHERE_API_KEY")
    if not api_key:
        raise RuntimeError("COHERE_API_KEY not configured")
    
    co = cohere.AsyncClientV2(api_key=api_key)
    response = await co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document",
        embedding_types=["float"]
    )
    return response.embeddings.float

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0: return 0.0
    return dot_product / (norm_a * norm_b)

logger = logging.getLogger(__name__)

# Trusted educational channels (lowercase for case-insensitive matching)
TRUSTED_CHANNELS = frozenset([
    # Universities & Institutes
    "mit opencourseware", "stanford", "stanford online", "stanford computer science",
    "harvard", "harvard university", "harvard cs50", "cs50",
    "yale courses", "yalecourses", "nptel", "nptelhrd", "nptel-noc iitm",
    "iit madras - bsc degree programme", "iit bombay july 2018", "iit roorkee",
    "iit kharagpur july 2018", "cmu database group", "carnegie mellon university",
    "uc berkeley", "berkeley riselab", "caltech", "caltechchannel",
    "oxford mathematics", "university of oxford", "cornell university",
    "princeton university", "university of michigan", "georgia tech",
    "coursera", "edx", "the royal institution", "institute for advanced study",
    "simons institute",
    
    # CS / Programming / Frontend / Backend
    "freecodecamp.org", "computerphile", "the coding train", "traversy media",
    "fireship", "tech with tim", "corey schafer", "programming with mosh",
    "derek banas", "thenewboston", "caleb curry", "web dev simplified",
    "kevin powell", "the net ninja", "academind", "hussein nasser",
    "arjancodes", "mcoding", "william fiset", "back to back swe",
    "clément mihailescu", "cs dojo", "techsith",
    
    # System Design / Cloud / DevOps
    "bytebytego", "gaurav sen", "techworld with nana", "networkchuck", "kodekloud", 
    "jordan has no life", "martin fowler", "aws training center",
    
    # Security / Cybersecurity
    "john hammond", "david bombal", "ippsec", "liveoverflow",
    
    # Mobile (iOS/Android/Flutter)
    "marcus ng", "resocoder", "filledstacks", "sean allen", "kilo loco",
    
    # Web3 / Blockchain
    "dapp university", "eattheblocks", "patrick collins", "smart contract programmer",
    
    # Math / Science / Quantum
    "3blue1brown", "numberphile", "khan academy", "professor leonard",
    "the organic chemistry tutor", "dr. trefor bazett", "michael penn",
    "zach star", "looking glass universe", "pbs space time", "veritasium",
    "mathologer", "blackpenredpen", "patrickjmt", "professor dave explains",
    "dr. physics a", "flammable maths", "qiskit",
    
    # ML / AI / Data Science
    "andrej karpathy", "yannic kilcher", "two minute papers", "sentdex",
    "statquest with josh starmer", "krish naik", "codebasics", "jeremy howard",
    "lex fridman", "machine learning street talk", "ai explained",
    
    # Game Dev (Unity/Unreal)
    "brackeys", "code monkey", "jason weimann", "sykoo", "gamedev.tv",
    
    # ECE / Hardware / Embedded / Robotics
    "greatscott!", "ben eater", "eater", "dronebot workshop", "explainingcomputers",
    
    # Design (UI/UX)
    "designcourse", "flux academy", "malewicz", "charliemarietv",
    
    # Business / Finance / Product Management
    "y combinator", "aswath damodaran", "the plain bagel", "how money works", "a16z",
    
    # Indian & Global Exams (JEE, NEET, UPSC, GATE, CAT)
    "physics wallah - alakh pandey", "unacademy jee", "vedantu jee", "byju's", 
    "vision ias", "drishti ias", "gate smashers", "made easy",
    
    # Productivity / Career
    "ali abdaal", "thomas frank",
    
    # Advanced AI / Systems / CS Foundational
    "deeplearning.ai", "siraj raval", "data school", "ritvikmath",
    "aleksa gordić - the ai epiphany", "umar jamil", "serrano.academy",
    "steve brunton", "welch labs", "devops toolkit", "neetcode",
    "abdul bari", "jenny's lectures cs it", "reducible", "jacob sorber",
    "low level learning", "fasterthanlime", "computerscience"
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


def _compute_title_relevance(topic_title: str, video_title: str, video_description: str = "", subject_context: str = "") -> float:
    """Compute keyword overlap ratio between the topic and video title + description with domain context check."""
    topic_lower = topic_title.lower()
    video_title_lower = video_title.lower()
    video_text_lower = (video_title + " " + video_description).lower()

    # Reject clear domain collisions (e.g. Terraform State Drift vs ML Data Drift, DSA Sliding Window vs ML Drift Sliding Window)
    if any(k in topic_lower or k in subject_context.lower() for k in ["drift", "ml", "data", "streaming", "model", "pipeline"]):
        if any(term in video_title_lower for term in ["terraform", "resistor", "color code", "leetcode", "data structure"]):
            if not any(term in topic_lower for term in ["terraform", "resistor", "leetcode", "data structure"]):
                return 0.0

    topic_words = _extract_keywords(topic_title)
    if not topic_words:
        return 0.0

    video_words = _extract_keywords(video_title)
    description_words = _extract_keywords(video_description)

    title_overlap = len(topic_words & video_words)
    desc_overlap = len(topic_words & description_words)

    title_ratio = title_overlap / len(topic_words)
    desc_ratio = desc_overlap / len(topic_words)

    base_relevance = max(title_ratio, desc_ratio * 0.7)

    # Domain anchor check: if subject_context has specific domain terms, check for context alignment
    if subject_context:
        subject_words = _extract_keywords(subject_context)
        subject_anchor_words = subject_words & {"drift", "streaming", "kafka", "flink", "mlops", "evidently", "arize", "whylabs", "monitoring", "pipeline", "model", "data"}
        if subject_anchor_words:
            video_all_words = video_words | description_words
            # If zero subject anchor words matched and title overlap is partial (e.g., matching only 'scalable' or 'state management'), penalize
            if not (subject_anchor_words & video_all_words) and title_ratio < 0.6:
                base_relevance *= 0.3

    return base_relevance


def _score_video(video: dict, topic_title: str, subject_context: str = "", preferred_channel: str = "") -> float:
    """
    Score a YouTube video for educational relevance.
    Returns -1.0 if the video should be excluded (duration or relevance gate).
    When preferred_channel is set, videos from that channel get a bonus to
    encourage consistent per-module learning from a single teacher.
    """
    duration_seconds = parse_iso8601_duration(video.get("contentDetails", {}).get("duration", ""))

    # Duration gate: 8-60 minutes (480s to 3600s)
    if duration_seconds < 480 or duration_seconds > 3600:
        return -1.0

    snippet = video.get("snippet", {})
    title_relevance = _compute_title_relevance(
        topic_title, 
        snippet.get("title", ""), 
        snippet.get("description", ""), 
        subject_context
    )

    # Relevance gate: require at least 35% keyword overlap with topic title
    if title_relevance < 0.35:
        return -1.0

    view_count = int(video.get("statistics", {}).get("viewCount", "0"))
    channel_name = snippet.get("channelTitle", "").lower()

    # Composite score (max ~115 points with channel affinity)
    relevance_score = title_relevance * 60                              # max 50
    duration_score = min(duration_seconds / 3600, 1.0) * 15            # max 15
    view_score = min(math.log10(max(view_count, 1)) / 7, 1.0) * 15    # max 25 (10M views = full)
    channel_score = 10 if channel_name in TRUSTED_CHANNELS else 0       # max 10

    # Channel affinity bonus: prefer videos from the same channel within a module
    # so the learner gets a consistent teaching style
    affinity_score = 15 if preferred_channel and channel_name == preferred_channel.lower() else 0  # max 15

    return relevance_score + duration_score + view_score + channel_score + affinity_score


async def search_youtube_videos(
    query: str,
    max_results: int = 1,
    topic_title: str = "",
    strict_official_sources: bool = False,
    subject_context: str = "",
    preferred_channel: str = ""
) -> List[Dict[str, str]]:
    """
    Search YouTube and return the best matching educational videos.
    First checks the curated database using pgvector semantic search (Gemini embeddings).
    If no rigorous match is found (>0.75 cosine similarity), falls back to dynamic YouTube API search.
    """
    from app.core.supabase_client import get_supabase_client
    import json
    
    # --- 1. THE CURATED DATABASE ENGINE (SUPABASE PGVECTOR) ---
    search_target = topic_title if topic_title else query
    if search_target and settings.GEMINI_API_KEY:
        try:
            # Generate Gemini embedding for semantic search
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "model": "models/gemini-embedding-2",
                "outputDimensionality": 768,
                "content": {"parts": [{"text": search_target}]}
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    embedding_vector = res.json().get('embedding', {}).get('values')
                    
                    if embedding_vector:
                        sb = get_supabase_client()
                        # Strict 0.92 threshold ensures we don't accidentally serve 
                        # 'First Law of Thermodynamics' when asking for 'Second Law'
                        rpc_response = sb.rpc(
                            "match_curated_videos",
                            {
                                "query_embedding": embedding_vector,
                                "match_threshold": 0.92,
                                "match_count": max_results
                            }
                        ).execute()
                        
                        matches = rpc_response.data
                        if matches:
                            logger.info(f"Supabase pgvector match! '{search_target}' -> '{matches[0]['topic']}' ({matches[0]['similarity']:.2f})")
                            return [
                                {
                                    "video_id": m["video_id"],
                                    "video_title": m["clean_title"],
                                    "channel_name": m["channel"],
                                    "duration_minutes": m["duration_mins"]
                                } for m in matches
                            ]
                        else:
                            logger.info(f"No curated match >= 0.92 for '{search_target}'. Falling back to dynamic YouTube search.")
        except Exception as e:
            logger.error(f"Semantic search failed for '{search_target}', falling back to YouTube: {e}")

    # --- 2. THE DYNAMIC FALLBACK ENGINE (OLD SYSTEM) ---
    if not settings.YOUTUBE_API_KEY:
        logger.warning("YOUTUBE_API_KEY not set, skipping YouTube search.")
        return []

    OFFICIAL_KEYWORDS = [
        "mit", "stanford", "harvard", "nptel", "courseware", "university", 
        "institute", "oxford", "yale", "cambridge", "berkeley", 
        "cmu", "carnegie", "caltech", "princeton", "cornell", "georgia tech",
        "nasa", "cern", "jpl", "esa", "polytechnic", "purdue", "michigan", 
        "eth zurich", "ocw", "ucla", "imperial", "waterloo", "ieee", "acm", 
        "nsf", "darpa", "national lab", "department of"
    ]

    async def execute_search(search_q: str) -> List[Dict[str, str]]:
        # Enforce English technical content by filtering out common spam/non-english languages
        strict_search_q = f"{search_q} -telugu -hindi -tamil -marketing"
        
        search_url = "https://www.googleapis.com/youtube/v3/search"
        search_params = {
            "part": "snippet",
            "q": strict_search_q,
            "type": "video",
            "maxResults": 25 if strict_official_sources else 15,
            "key": settings.YOUTUBE_API_KEY,
            "videoEmbeddable": "true",
            "relevanceLanguage": "en",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            search_response = await client.get(search_url, params=search_params)
            search_response.raise_for_status()
            search_data = search_response.json()
            if not search_data.get("items"):
                return []

            video_ids = [item["id"]["videoId"] for item in search_data["items"]]
            videos_url = "https://www.googleapis.com/youtube/v3/videos"
            videos_params = {
                "part": "contentDetails,snippet,statistics",
                "id": ",".join(video_ids),
                "key": settings.YOUTUBE_API_KEY,
            }
            videos_response = await client.get(videos_url, params=videos_params)
            videos_response.raise_for_status()
            return videos_response.json().get("items", [])

    def filter_and_score(items: list, require_official: bool, use_scoring: bool):
        valid = []
        for item in items:
            snippet = item.get("snippet", {})
            channel_name_lower = snippet.get("channelTitle", "").lower()

            if require_official and not any(kw in channel_name_lower for kw in OFFICIAL_KEYWORDS):
                continue

            if use_scoring:
                score = _score_video(item, topic_title, subject_context, preferred_channel)
                if score >= 0:
                    valid.append((score, item))
            else:
                duration_seconds = parse_iso8601_duration(item.get("contentDetails", {}).get("duration", ""))
                if 480 <= duration_seconds <= 3600:
                    valid.append((0, item))
        return valid

    try:
        use_scoring = bool(topic_title.strip())
        items = await execute_search(query)
        candidates = filter_and_score(items, strict_official_sources, use_scoring)

        if not candidates and strict_official_sources:
            candidates = filter_and_score(items, False, use_scoring)

        # Fallback query using topic_title directly if initial specific query produced 0 valid candidates
        if not candidates and topic_title:
            fallback_query = topic_title
            logger.info(f"Primary YouTube query '{query}' produced no matches (threshold >= 0.35). Retrying with topic title: '{fallback_query}'")
            items = await execute_search(fallback_query)
            candidates = filter_and_score(items, False, use_scoring)

        if not candidates:
            logger.info(f"No relevant matches (>= 0.35 keyword overlap) found for '{query}' against topic '{topic_title}'. Defaulting to Reference Cards.")
            return []

        # Sort candidates by score descending
        candidates.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, item in candidates[:max_results]:
            results.append({
                "video_id": item["id"],
                "video_title": item.get("snippet", {}).get("title", ""),
                "channel_name": item.get("snippet", {}).get("channelTitle", ""),
                "duration_minutes": parse_iso8601_duration(item.get("contentDetails", {}).get("duration", "")) // 60,
            })

        if results and use_scoring:
            best_score = candidates[0][0]
            logger.info(f"YouTube: Best match for '{topic_title}' -> '{results[0]['video_title']}' (score: {best_score:.1f})")

        return results

    except Exception as e:
        logger.error(f"YouTube search/filter failed for query '{query}': {e}")
        return []

async def find_module_playlist(module_title: str) -> List[Dict]:
    """
    Search YouTube for a playlist matching the module title, fetch its videos,
    and return them with full details (duration, stats, etc.).
    
    Returns a list of video dicts with keys: video_id, video_title, channel_name,
    duration_minutes, or an empty list if no suitable playlist found.
    """
    if not settings.YOUTUBE_API_KEY:
        return []

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Step 1: Search for playlists matching the module title
            search_url = "https://www.googleapis.com/youtube/v3/search"
            import re
            clean_module_title = re.sub(r'^(?:Week|Module|Section)\s*\d+:\s*', '', module_title, flags=re.IGNORECASE)

            search_params = {
                "part": "snippet",
                "q": f"{clean_module_title} full course tutorial -telugu -hindi -tamil -marketing",
                "type": "playlist",
                "maxResults": 15,
                "key": settings.YOUTUBE_API_KEY,
                "relevanceLanguage": "en",
            }
            search_response = await client.get(search_url, params=search_params)
            search_response.raise_for_status()
            playlists = search_response.json().get("items", [])

            if not playlists:
                logger.info(f"No playlists found for module '{module_title}'")
                return []

            # Step 1.5: The God-Tier Enforcer (Prioritize Trusted Channels)
            def _is_trusted(p: Dict) -> bool:
                channel_name = p.get("snippet", {}).get("channelTitle", "").lower()
                return channel_name in TRUSTED_CHANNELS
                
            playlists.sort(key=lambda p: 0 if _is_trusted(p) else 1)

            # Step 2: Try each playlist until we find one with enough videos
            bad_keywords = ["telugu", "hindi", "tamil", "kannada", "malayalam", "bengali", "marathi"]
            for playlist_item in playlists:
                playlist_id = playlist_item["id"]["playlistId"]
                playlist_title = playlist_item["snippet"]["title"]
                channel_name = playlist_item["snippet"]["channelTitle"]

                title_lower = playlist_title.lower()
                channel_lower = channel_name.lower()
                if any(bad in title_lower or bad in channel_lower for bad in bad_keywords):
                    continue
                    
                mod_words = set(re.findall(r'\w+', clean_module_title.lower()))
                mod_words = {w for w in mod_words if len(w) > 3} # ignore small words
                pl_words = set(re.findall(r'\w+', title_lower))
                
                if not _is_trusted(playlist_item) and mod_words and len(mod_words.intersection(pl_words)) == 0:
                    logger.debug(f"Skipping playlist '{playlist_title}' due to no keyword overlap with '{clean_module_title}'")
                    continue

                # Fetch playlist items (up to 50)
                items_url = "https://www.googleapis.com/youtube/v3/playlistItems"
                items_params = {
                    "part": "snippet",
                    "playlistId": playlist_id,
                    "maxResults": 50,
                    "key": settings.YOUTUBE_API_KEY,
                }
                items_response = await client.get(items_url, params=items_params)
                items_response.raise_for_status()
                playlist_videos = items_response.json().get("items", [])

                if len(playlist_videos) < 3:
                    continue  # Too few videos, try next playlist

                # Step 3: Get full video details (duration, stats)
                video_ids = []
                for pv in playlist_videos:
                    vid_id = pv.get("snippet", {}).get("resourceId", {}).get("videoId")
                    if vid_id:
                        video_ids.append(vid_id)

                if not video_ids:
                    continue

                videos_url = "https://www.googleapis.com/youtube/v3/videos"
                videos_params = {
                    "part": "contentDetails,snippet,statistics",
                    "id": ",".join(video_ids[:50]),
                    "key": settings.YOUTUBE_API_KEY,
                }
                videos_response = await client.get(videos_url, params=videos_params)
                videos_response.raise_for_status()
                video_details = videos_response.json().get("items", [])

                # Build the catalog of playlist videos
                catalog = []
                for vd in video_details:
                    duration_seconds = parse_iso8601_duration(
                        vd.get("contentDetails", {}).get("duration", "")
                    )
                    # Accept videos 3-90 minutes for playlists (wider range since
                    # playlist videos can be shorter individual lectures)
                    if duration_seconds < 180 or duration_seconds > 5400:
                        continue
                    catalog.append({
                        "video_id": vd["id"],
                        "video_title": vd.get("snippet", {}).get("title", ""),
                        "channel_name": vd.get("snippet", {}).get("channelTitle", channel_name),
                        "duration_minutes": duration_seconds // 60,
                        "description": vd.get("snippet", {}).get("description", ""),
                    })

                if len(catalog) >= 3:
                    logger.info(
                        f"Found playlist for '{module_title}': '{playlist_title}' "
                        f"by {channel_name} ({len(catalog)} usable videos)"
                    )
                    try:
                        titles = [v["video_title"] for v in catalog]
                        embeddings = await generate_embeddings(titles)
                        for i, v in enumerate(catalog):
                            v["embedding"] = embeddings[i]
                    except Exception as e:
                        logger.error(f"Failed to generate embeddings for playlist: {e}")
                    
                    return catalog

            logger.info(f"No suitable playlist found for module '{module_title}' (all had <3 usable videos)")
            return []

    except Exception as e:
        logger.error(f"Playlist search failed for '{module_title}': {e}")
        return []


async def match_playlist_video_to_topic(
    catalog: List[Dict], topic_title: str
) -> Dict | None:
    """
    Find the best matching video from a playlist catalog using a Hybrid approach:
    1. Keyword Overlap Heuristic (Fast & precise)
    2. Semantic Matching via Cohere (Fuzzy fallback)
    """
    if not catalog:
        return None
        
    # --- 1. KEYWORD HEURISTIC ---
    best_keyword_score = 0.0
    best_keyword_video = None
    
    for video in catalog:
        relevance = _compute_title_relevance(
            topic_title,
            video["video_title"],
            video.get("description", ""),
        )
        if relevance > best_keyword_score:
            best_keyword_score = relevance
            best_keyword_video = video
            
    # If we have a solid keyword match, accept it instantly without semantic embedding
    if best_keyword_score >= 0.25 and best_keyword_video:
        return best_keyword_video

    # --- 2. SEMANTIC FALLBACK ---
    has_embeddings = all(vid.get("embedding") is not None for vid in catalog)
    if not has_embeddings:
        return None

    try:
        topic_embeddings = await generate_embeddings([topic_title])
        topic_vec = topic_embeddings[0]
    except Exception as e:
        logger.error(f"Failed to embed topic '{topic_title}': {e}")
        return None

    best_semantic_score = 0.0
    best_semantic_video = None

    for video in catalog:
        score = cosine_similarity(topic_vec, video["embedding"])
        if score > best_semantic_score:
            best_semantic_score = score
            best_semantic_video = video

    # Semantic threshold strictly tuned for Cohere to avoid fuzzy false-positives
    if best_semantic_score >= 0.55 and best_semantic_video:
        return best_semantic_video
        
    return None
