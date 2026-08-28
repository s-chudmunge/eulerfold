import json

with open('creators_list.json', 'r', encoding='utf-8') as f:
    creators = json.load(f)

creators_js = "const CREATORS = " + json.dumps(creators, indent=4) + ";\n"

with open('frontend/src/components/landing/CreatorsTicker.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out_lines = []
in_creators = False
for line in lines:
    if line.startswith('const CREATORS = ['):
        in_creators = True
        out_lines.append(creators_js)
    elif in_creators and line.startswith('];'):
        in_creators = False
    elif not in_creators:
        out_lines.append(line)

with open('frontend/src/components/landing/CreatorsTicker.tsx', 'w', encoding='utf-8') as f:
    f.writelines(out_lines)

print("Updated CreatorsTicker.tsx")
