import os
import csv
import urllib.request
import urllib.parse
import json
import re
import sys

# Add backend root to path to load .env easily
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase")
    sys.exit(1)

try:
    from ddgs import DDGS
except ImportError:
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        print("Please install duckduckgo-search")
        sys.exit(1)

# Validate Env Vars
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_pt_duration(duration_str):
    minutes = 0
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
    if match:
        h, m, s = match.groups()
        if h: minutes += int(h) * 60
        if m: minutes += int(m)
        if s and int(s) > 30: minutes += 1
    return minutes

def extract_video_id(url):
    match = re.search(r'youtube\.com/watch\?v=([0-9A-Za-z_-]{11})', url)
    if match:
        return match.group(1)
    return None

def get_embedding(text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={GEMINI_API_KEY}"
    payload = json.dumps({
        "model": "models/gemini-embedding-2",
        "outputDimensionality": 768,
        "content": {"parts": [{"text": text}]}
    }).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        return result['embedding']['values']

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

def get_existing_db_topics():
    try:
        response = sb.table("curated_videos").select("topic").execute()
        return {row['topic'] for row in response.data}
    except Exception:
        return set()

def run():
    existing_topics = get_existing_db_topics()
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames)
        if 'status' not in fieldnames: fieldnames.append('status')
        for row in reader:
            if 'status' not in row: row['status'] = ''
            rows.append(row)
            
    def save_csv():
        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

    with DDGS() as ddgs:
        for row in rows:
            topic = row['topic'].strip()
            if row['status'] == 'DONE': continue
            if topic in existing_topics:
                row['status'] = 'DONE'
                save_csv()
                continue
                
            ai_title = row['ai_known_title'].strip()
            ai_channel = row['ai_known_channel'].strip()
            
            print(f"Processing: {topic}")
            try:
                # If the ai_title is exactly an 11-char ID, skip DDG search completely!
                if re.match(r'^[0-9A-Za-z_-]{11}$', ai_title):
                    video_id = ai_title
                else:
                    query = f"site:youtube.com {ai_title} {ai_channel}"
                    results = list(ddgs.text(query, max_results=4))
                    video_id = None
                    for res in results:
                        extracted = extract_video_id(res.get('href', ''))
                        if extracted:
                            video_id = extracted
                            break
                        
                if not video_id:
                    print(f"  ❌ No YouTube URL found.")
                    row['status'] = 'FAILED'
                    save_csv()
                    continue
                    
                vid_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id={video_id}&key={YOUTUBE_API_KEY}"
                vid_req = urllib.request.Request(vid_url)
                with urllib.request.urlopen(vid_req) as vid_response:
                    vid_data = json.loads(vid_response.read().decode())
                    if not vid_data.get("items"):
                        row['status'] = 'FAILED'
                        save_csv()
                        continue
                        
                    api_title = vid_data["items"][0]["snippet"]["title"]
                    api_channel = vid_data["items"][0]["snippet"]["channelTitle"]
                    mins = parse_pt_duration(vid_data["items"][0]["contentDetails"]["duration"])
                    
                    if not (5 <= mins <= 120):
                        print(f"  ❌ Rejected: Duration {mins}m")
                        row['status'] = 'FAILED'
                        save_csv()
                        continue
                        
                    print(f"  Saving '{api_title}'...")
                    embedding = get_embedding(topic)
                    
                    row_data = {
                        "video_id": video_id,
                        "topic": topic,
                        "clean_title": api_title,
                        "channel": api_channel,
                        "duration_mins": mins,
                        "topic_embedding": embedding
                    }
                    
                    sb.table("curated_videos").upsert(row_data, on_conflict="video_id").execute()
                    print(f"  ✅ Successfully ingested!")
                    row['status'] = 'DONE'
                    save_csv()
                            
            except Exception as e:
                print(f"  ❌ Failed: {e}")
                row['status'] = 'ERROR'
                save_csv()

if __name__ == '__main__':
    run()
