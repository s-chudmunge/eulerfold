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

count = 0
for row in rows:
    title_col = row["ai_known_title"].strip()
    channel_col = row["ai_known_channel"].strip()
    
    # If the title column is exactly 11 characters (a YouTube ID)
    if len(title_col) == 11 and " " not in title_col:
        url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id={title_col}&key={YOUTUBE_API_KEY}"
        resp = requests.get(url).json()
        if "items" in resp and resp["items"]:
            real_title = resp["items"][0]["snippet"]["title"]
            real_channel = resp["items"][0]["snippet"]["channelTitle"]
            row["ai_known_title"] = real_title
            row["ai_known_channel"] = real_channel
            print(f"Restored: {real_title} | {real_channel}")
            count += 1
        else:
            print(f"Could not fetch for ID: {title_col}")

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Successfully restored {count} rows in the CSV.")
