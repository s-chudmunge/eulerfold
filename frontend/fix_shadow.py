import re
import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # remove shadow-lg entirely from lines that also have shadow-sm from my previous script
    # actually, just removing shadow-lg from the lines that have 'bg-accent text-white' is safer
    
    def replacer(match):
        line = match.group(0)
        return line.replace('shadow-lg', '')
        
    content = re.sub(r'bg-accent text-white.*', replacer, content)

    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('/home/sankalp/Documents/projects/eulerfold/frontend/src'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

print("Fixed shadows.")
