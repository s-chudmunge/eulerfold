import os
import csv
import urllib.request
import urllib.parse
import json
import re
import sys
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_embedding(text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={GEMINI_API_KEY}"
    payload = json.dumps({
        "model": "models/gemini-embedding-2",
        "outputDimensionality": 768,
        "content": {"parts": [{"text": text}]}
    }).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    
    # Retry mechanism for 429 Too Many Requests
    for _ in range(5):
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
                return result['embedding']['values']
        except Exception as e:
            if "429" in str(e):
                print(f"    [!] Gemini API rate limit hit (429). Sleeping for 15s...")
                time.sleep(15)
            else:
                raise e
    raise Exception("Max retries exceeded for Gemini API.")

def parse_pt_duration(duration_str):
    minutes = 0
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
    if match:
        h, m, s = match.groups()
        if h: minutes += int(h) * 60
        if m: minutes += int(m)
        if s and int(s) > 30: minutes += 1
    return minutes

def search_yt_api(query):
    try:
        url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q={urllib.parse.quote(query)}&key={YOUTUBE_API_KEY}&maxResults=1"
        res = urllib.request.urlopen(url)
        data = json.loads(res.read().decode())
        if data.get("items"):
            return data["items"][0]["id"]["videoId"]
    except Exception as e:
        print(f"Search API Error: {e}")
    return None

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

rows = []
to_fix = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = list(reader.fieldnames)
    for row in reader:
        if row.get('status') in ['FAILED', 'ERROR']:
            to_fix.append(row)
        rows.append(row)

count = 0
for row in rows:
    if row.get('status') not in ['FAILED', 'ERROR']:
        continue
        
    topic = row['topic']
    channel = row['ai_known_channel']
    
    query = f"{topic} {channel}"
    print(f"Fixing: {query}")
    
    vid = search_yt_api(query)
    if not vid:
        print(f"  ❌ Still not found via YT API.")
        continue
        
    try:
        vid_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id={vid}&key={YOUTUBE_API_KEY}"
        vid_req = urllib.request.Request(vid_url)
        with urllib.request.urlopen(vid_req) as vid_response:
            vid_data = json.loads(vid_response.read().decode())
            if not vid_data.get("items"):
                continue
                
            api_title = vid_data["items"][0]["snippet"]["title"]
            api_channel = vid_data["items"][0]["snippet"]["channelTitle"]
            mins = parse_pt_duration(vid_data["items"][0]["contentDetails"]["duration"])
            
            if mins < 2:
                print(f"  ❌ Rejected: Duration {mins}m")
                continue
                
            print(f"  Saving '{api_title}'...")
            embedding = get_embedding(topic)
            
            row_data = {
                "video_id": vid,
                "topic": topic,
                "clean_title": api_title,
                "channel": api_channel,
                "duration_mins": mins,
                "topic_embedding": embedding
            }
            
            sb.table("curated_videos").upsert(row_data, on_conflict="video_id").execute()
            print(f"  ✅ Successfully ingested!")
            row['status'] = 'DONE'
            row['ai_known_title'] = api_title
            count += 1
            
    except Exception as e:
        print(f"  ❌ Ingest API Error: {e}")
        
    # Rate limit backoff for standard usage
    time.sleep(4)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Successfully fixed {count} topics!")
