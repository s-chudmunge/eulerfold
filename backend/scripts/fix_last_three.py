import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

# Use Exact IDs to bypass the search engine entirely.
# Change of Basis (3Blue1Brown) -> P2LTAUO1TdA
# Stokes' Theorem (Professor Dave) -> _X3d32p75XQ
# Divergence Theorem (Professor Dave) -> 8r8Yq-34lP0

updates = {
    "Change of Basis": "P2LTAUO1TdA",
    "Stokes' Theorem": "_X3d32p75XQ",
    "The Divergence Theorem": "8r8Yq-34lP0"
}

rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        topic = row['topic'].strip()
        if topic in updates:
            row['ai_known_title'] = updates[topic]
            row['ai_known_channel'] = '' # Blank channel triggers the exact ID bypass
            row['status'] = ''  # Reset status
            print(f"Hardcoded Exact ID for {topic}")
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
