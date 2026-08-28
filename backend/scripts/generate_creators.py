import csv
import json
import urllib.parse

channels = set()
with open('curated_topics_blueprint.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader) # skip header
    for row in reader:
        if len(row) >= 3:
            channel = row[2].strip()
            # filter out artifacts
            if channel and not channel.endswith('"') and not channel.startswith(' '):
                channels.add(channel)

creators = []
for c in sorted(list(channels)):
    # Basic URL encoding for unavatar
    handle = urllib.parse.quote(c)
    creators.append({"name": c, "handle": handle})

with open('creators_list.json', 'w', encoding='utf-8') as f:
    json.dump(creators, f, indent=4)

print(f"Generated {len(creators)} creators.")
