import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

# Topics to completely remove (too short/long with no clear replacement)
to_remove = [
    "Memory Leaks",
    "Git Cherry Pick",
    "Standard Deviation",
    "Generative Adversarial Networks",
    "WebAssembly",
    "Page Faults",
    "Deadlock",
    "Assembly Language",
    "Third Normal Form (3NF)",
    "Procedural Generation",
    "YOLO Object Detection"
]

# Topics to update with better videos that fit 5-120 mins
to_update = {
    "Docker Basics": {"title": "Docker Crash Course for Absolute Beginners", "channel": "Programming with Mosh"},
    "Big O Notation": {"title": "Introduction to Big O Notation and Time Complexity", "channel": "CS Dojo"},
    "Selection Sort": {"title": "Selection Sort Algorithm", "channel": "Abdul Bari"},
    "Vue.js Basics": {"title": "Vue.js Crash Course 2024", "channel": "Traversy Media"},
    "Content Delivery Networks": {"title": "What is a CDN?", "channel": "Hussein Nasser"},
    "GraphQL": {"title": "GraphQL Tutorial for Beginners", "channel": "Programming with Mosh"},
    "Transformers": {"title": "Transformer Neural Networks - EXPLAINED!", "channel": "StatQuest with Josh Starmer"},
    "BGP (Border Gateway Protocol)": {"title": "BGP Routing Protocol Tutorial", "channel": "Practical Networking"},
    "Kotlin Basics": {"title": "Kotlin Tutorial for Beginners", "channel": "Programming with Mosh"},
    "Swift Basics": {"title": "Swift Tutorial for Beginners", "channel": "CodeWithChris"},
    "Apache Spark": {"title": "Apache Spark Tutorial", "channel": "edureka!"},
    "Apache Airflow": {"title": "What is Apache Airflow?", "channel": "IBM Technology"},
    "V8 JavaScript Engine": {"title": "V8 Engine Architecture", "channel": "Hussein Nasser"}
}

rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        topic = row['topic'].strip()
        
        # If it's a failed row
        if row.get('status') != 'DONE':
            if topic in to_remove:
                continue # drop it
            elif topic in to_update:
                row['ai_known_title'] = to_update[topic]['title']
                row['ai_known_channel'] = to_update[topic]['channel']
                row['status'] = '' # Reset to try again
                rows.append(row)
            else:
                rows.append(row) # keep it just in case
        else:
            rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("CSV Fixed!")
