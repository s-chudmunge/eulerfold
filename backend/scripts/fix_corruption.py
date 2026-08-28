import os
import sys
import csv

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
from supabase import create_client, Client

sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

corrupted_topics = [
    "Wireshark", 
    "TF-IDF (Term Frequency-Inverse Document Frequency)", 
    "ROUGE Score", 
    "Suffix Arrays",
    "N-Grams",
    "Coin Change Problem",
    "Service Mesh vs API Gateway"
]

print("Deleting corrupted topics from database...")
for topic in corrupted_topics:
    try:
        sb.table("curated_videos").delete().eq("topic", topic).execute()
        print(f"Deleted {topic}")
    except Exception as e:
        print(f"Failed to delete {topic}: {e}")

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')
rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['topic'].strip() in corrupted_topics:
            row['status'] = ''
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
print("CSV statuses reset.")
