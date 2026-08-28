import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

updates = {
    "Stokes' Theorem": ("Stokes' Theorem", "Khan Academy"),
    "Subgroups": ("Introduction to Subgroups", "The Math Sorcerer"),
    "Homeomorphisms": ("Homeomorphism", "Wrath of Math"),
    "Euler's Totient Function": ("Euler's Totient Function", "Michael Penn"),
    "Bayes' Theorem": ("Bayes Theorem", "The Organic Chemistry Tutor")
}

rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        topic = row['topic'].strip()
        if topic in updates:
            row['ai_known_title'] = updates[topic][0]
            row['ai_known_channel'] = updates[topic][1]
            row['status'] = ''  # Reset status
            print(f"Updated {topic}")
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
