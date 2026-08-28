import urllib.request
import urllib.parse
import re
import csv
import os
import time

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

def get_yt_id(query):
    try:
        url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req).read().decode("utf-8")
        video_ids = re.findall(r"watch\?v=([a-zA-Z0-9_-]{11})", html)
        return video_ids[0] if video_ids else None
    except Exception as e:
        print(f"Error scraping {query}: {e}")
        return None

count = 0
for row in to_scrape:
    # Build query from title and channel
    title = row['ai_known_title']
    channel = row['ai_known_channel']
    
    # Skip if it's already an 11-char ID
    if len(title) == 11 and " " not in title:
        continue

    query = f"{title} {channel}".strip()
    print(f"Scraping: {query}")
    vid_id = get_yt_id(query)
    
    if vid_id:
        row['ai_known_title'] = vid_id
        row['ai_known_channel'] = ''
        row['status'] = ''  # Ensure it runs
        count += 1
    
    time.sleep(0.5)

# Write back
with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Successfully scraped IDs for {count} topics.")
