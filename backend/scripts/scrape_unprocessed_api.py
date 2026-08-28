import csv
import os
import requests
import time
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
YT_API_KEY = os.getenv("YOUTUBE_API_KEY")

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

rows = []
to_scrape = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['status'] != 'DONE':
            to_scrape.append(row)
        rows.append(row)

print(f"Found {len(to_scrape)} topics that need exact IDs.")

def get_yt_id_api(query):
    try:
        url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q={query}&key={YT_API_KEY}&maxResults=1"
        res = requests.get(url).json()
        if res.get("items"):
            return res["items"][0]["id"]["videoId"]
    except Exception as e:
        print(f"Error scraping {query}: {e}")
    return None

count = 0
for row in rows:
    if row['status'] == 'DONE':
        continue

    title = row['ai_known_title']
    channel = row['ai_known_channel']
    query = f"{title} {channel}".strip()
    print(f"Scraping: {query}")
    
    vid = get_yt_id_api(query)
    if vid:
        row['ai_known_title'] = vid
        row['status'] = 'DONE'
        count += 1
        print(f" -> Found: {vid}")
    else:
        print(f" -> Failed")
        
    time.sleep(0.1) # small delay

with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Updated {count} topics.")
