import os
import requests
import time
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
YT_API_KEY = os.getenv("YOUTUBE_API_KEY")

CREATORS = [
    "3Blue1Brown",
    "StatQuest with Josh Starmer",
    "LearnChemE",
    "Web Dev Simplified",
    "Neso Academy",
    "Computerphile",
    "TechWorld with Nana",
    "MIT OpenCourseWare",
    "Ninja Nerd",
    "Professor Dave Explains",
    "DeepLearningAI",
    "ByteByteGo",
    "Steve Brunton",
    "The Organic Chemistry Tutor",
    "Hussein Nasser",
    "nptelhrd",
    "Abdul Bari",
    "Bozeman Science",
    "TMP Chem",
    "Shomus Biology",
    "Traversy Media"
]

out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/public/creators'))
os.makedirs(out_dir, exist_ok=True)

for creator in CREATORS:
    safe_name = creator.replace(" ", "").replace("'", "")
    if os.path.exists(os.path.join(out_dir, f"{safe_name}.jpg")):
        continue
    try:
        search_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={creator}&key={YT_API_KEY}"
        res = requests.get(search_url).json()
        if not res.get("items"):
            print(f"Not found: {creator}")
            continue
            
        channel_id = res["items"][0]["snippet"]["channelId"]
        
        channel_url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet&id={channel_id}&key={YT_API_KEY}"
        c_res = requests.get(channel_url).json()
        
        img_url = c_res["items"][0]["snippet"]["thumbnails"]["default"]["url"]
        
        img_data = requests.get(img_url).content
        
        with open(os.path.join(out_dir, f"{safe_name}.jpg"), 'wb') as f:
            f.write(img_data)
        print(f"Saved: {safe_name}.jpg")
    except Exception as e:
        print(f"Failed {creator}: {e}")
