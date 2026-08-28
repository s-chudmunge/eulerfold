import csv
import os
import requests
import re
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
YT_API_KEY = os.getenv("YOUTUBE_API_KEY")

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        rows.append(row)

count = 0
for row in rows:
    title = row['ai_known_title']
    # If the title is an 11-character YT ID
    if len(title) == 11 and " " not in title:
        try:
            url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id={title}&key={YT_API_KEY}"
            res = requests.get(url).json()
            if res.get("items"):
                real_title = res["items"][0]["snippet"]["title"]
                row['ai_known_title'] = real_title
                count += 1
                print(f"Restored: {title} -> {real_title}")
        except Exception as e:
            pass

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Successfully restored {count} human-readable titles.")
