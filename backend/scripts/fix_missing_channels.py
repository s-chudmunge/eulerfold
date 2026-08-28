import csv
import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        rows.append(row)

for row in rows:
    if not row["ai_known_channel"].strip():
        video_id = row["ai_known_title"].strip()
        url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={YOUTUBE_API_KEY}"
        resp = requests.get(url).json()
        if "items" in resp and resp["items"]:
            channel_title = resp["items"][0]["snippet"]["channelTitle"]
            row["ai_known_channel"] = channel_title
            print(f"Fixed {row['topic']} -> {channel_title}")
        else:
            print(f"Could not fetch for {row['topic']}")

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
