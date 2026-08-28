import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

updates = {
    "Wireshark": "4_7A8Ikp5Cc",
    "TF-IDF (Term Frequency-Inverse Document Frequency)": "OymqCnh-APA",
    "N-Grams": "dN0lsF2cvm4",
    "ROUGE Score": "DejHQYAGb7Q",
    "CTC Loss (Connectionist Temporal Classification)": "lDs3GgrIuNw",
    "BM25 Search Algorithm": "lYxGYXjfrNI",
    "Coin Change Problem": "e0CAbRVYAWg",
    "Suffix Arrays": "m2lZRmMjebw",
    "Google BigQuery": "Xb3EcBBla08",
    "Service Mesh vs API Gateway": "x4E4mbobGEc"
}

rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        topic = row['topic'].strip()
        if topic in updates:
            row['ai_known_title'] = updates[topic]
            row['ai_known_channel'] = ""
            row['status'] = ''
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
