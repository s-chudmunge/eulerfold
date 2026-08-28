import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

to_update = {
    "Kotlin Basics": {"title": "Kotlin Tutorial", "channel": "Derek Banas"},
    "Apache Spark": {"title": "Apache Spark Architecture", "channel": "Defog Tech"}
}

rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        topic = row['topic'].strip()
        if row.get('status') != 'DONE' and topic in to_update:
            row['ai_known_title'] = to_update[topic]['title']
            row['ai_known_channel'] = to_update[topic]['channel']
            row['status'] = ''
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
