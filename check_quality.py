import os
import re
from collections import defaultdict

md_files = [os.path.join('content/articles', f) for f in os.listdir('content/articles') if f.endswith('.md')]

future_matches = []
conclusion_matches = []
url_file_map = defaultdict(set)

url_pattern = re.compile(r'https?://[^ )\]"\'>]+')

for fpath in md_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if 'the future of' in line.lower():
                future_matches.append(f"{fpath}:{i+1}: {line}")
                
        non_empty = [l.strip() for l in lines if l.strip()]
        if non_empty:
            last_line = non_empty[-1]
            if re.search(r'\b(requires|depends\s+on)\b', last_line, re.IGNORECASE):
                conclusion_matches.append(f"{fpath}: {last_line}")
                
        for url in url_pattern.findall(content):
            url_file_map[url].add(fpath)

print('--- 1. "the future of" ---')
for m in future_matches:
    print(m)

print('\n--- 2. Concluding sentences with "requires" or "depends on" ---')
for m in conclusion_matches:
    print(m)

print('\n--- 3. URLs in > 3 articles ---')
for url, files in url_file_map.items():
    if len(files) > 3:
        print(f'{len(files)} files: {url}')
