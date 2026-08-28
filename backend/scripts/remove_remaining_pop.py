import csv
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
from supabase import create_client

sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

drop_list = [
    "Time Dilation (Special Relativity)",
    "General Relativity",
    "Hawking Radiation",
    "The Standard Model of Particle Physics"
]

# Delete from Supabase
print("Deleting from Supabase...")
sb.table("curated_videos").delete().in_("topic", drop_list).execute()

# Delete from CSV
rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['topic'].strip() not in drop_list:
            rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
print("Deleted from CSV.")
