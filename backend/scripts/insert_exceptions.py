import os
import sys
import json
import csv
import requests
import re
from google import genai
from google.genai import types

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
from supabase import create_client

sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
YT_KEY = os.getenv("YOUTUBE_API_KEY")

def parse_pt_duration(duration_str):
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
    if not match: return 0
    h, m, s = match.groups()
    return int(h or 0)*60 + int(m or 0)

def get_yt_video(query):
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&maxResults=1&key={YT_KEY}"
    res = requests.get(url).json()
    if 'items' in res and res['items']:
        item = res['items'][0]
        vid_id = item["id"]["videoId"]
        # get details for duration
        d_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id={vid_id}&key={YT_KEY}"
        d_res = requests.get(d_url).json()
        d_item = d_res['items'][0]
        mins = parse_pt_duration(d_item["contentDetails"]["duration"])
        return {
            "id": vid_id,
            "title": d_item["snippet"]["title"],
            "channel": d_item["snippet"]["channelTitle"],
            "duration": mins
        }
    return None

def embed_text(text):
    response = client.models.embed_content(
        model="models/gemini-embedding-2",
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=768)
    )
    return response.embeddings[0].values

topics_to_add = [
    {"topic": "Simple Harmonic Motion", "query": "Simple Harmonic Motion Physics Problems The Organic Chemistry Tutor"},
    {"topic": "Playwright", "query": "Playwright Testing Tutorial The Testing Academy"}
]

for t in topics_to_add:
    print(f"Fetching {t['topic']}...")
    vid = get_yt_video(t['query'])
    if vid:
        print(f"Found: {vid['title']} ({vid['duration']}m)")
        embedding = embed_text(t['topic'])
        
        row_data = {
            "video_id": vid["id"],
            "topic": t["topic"],
            "clean_title": vid["title"],
            "channel": vid["channel"],
            "duration_mins": vid["duration"],
            "topic_embedding": embedding
        }
        
        sb.table("curated_videos").upsert(row_data, on_conflict="video_id").execute()
        print(f"✅ Injected {t['topic']} into Supabase.")
        
        csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')
        rows = []
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                if row['topic'].strip() == t['topic']:
                    row['status'] = 'DONE'
                rows.append(row)
        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
