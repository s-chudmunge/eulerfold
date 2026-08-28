import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')
rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        # If the ai_known_title is exactly 11 characters (a YT ID), we want to make sure it's ingested.
        # But wait, how do we distinguish the old ones from the 119 new ones?
        # The old ones are already in Supabase. ingest_curated_videos.py checks `get_existing_db_topics()` 
        # and skips them automatically! So we can just set EVERYTHING to '' and let the script handle it.
        row['status'] = ''
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
