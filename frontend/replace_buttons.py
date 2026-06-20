import re
import os
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Regex to find the gamified button classes
    # We want to replace:
    # bg-gradient-to-b from-teal-400 to-teal-600 text-white ... hover:brightness-110 active:border-b-0 active:translate-y-[4px] border-b-[4px] border-teal-800
    # or similar (3px for UserNav)
    
    # We can replace parts of the class string.
    # 1. replace "bg-gradient-to-b from-teal-400 to-teal-600 text-white" with "bg-accent text-white hover:bg-teal-700"
    content = re.sub(r'bg-gradient-to-b from-teal-400 to-teal-600 text-white', r'bg-accent text-white hover:bg-teal-700', content)
    
    # 2. replace "bg-gradient-to-b from-zinc-700 to-zinc-900 text-white" with "bg-zinc-800 text-white hover:bg-zinc-700"
    content = re.sub(r'bg-gradient-to-b from-zinc-700 to-zinc-900 text-white', r'bg-zinc-800 text-white hover:bg-zinc-700', content)

    # 3. remove gamified parts: "hover:brightness-110 active:border-b-0 active:translate-y-[4px] border-b-[4px] border-teal-800"
    content = re.sub(r'hover:brightness-110 active:border-b-0 active:translate-y-\[\dpx\] border-b-\[\dpx\] border-(teal-800|zinc-950)', r'shadow-sm', content)

    # 4. replace rounded-2xl and rounded-xl with rounded-lg to follow the rulebook
    content = re.sub(r'rounded-2xl', r'rounded-lg', content)
    content = re.sub(r'rounded-xl', r'rounded-lg', content)

    # 5. replace "shadow-lg shadow-sm" with just "shadow-sm"
    content = content.replace("shadow-lg shadow-sm", "shadow-sm")
    content = content.replace("shadow-sm shadow-lg", "shadow-sm")

    with open(filepath, 'w') as f:
        f.write(content)

# Find all tsx files
for root, dirs, files in os.walk('/home/sankalp/Documents/projects/eulerfold/frontend/src'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

print("Done replacing gamified buttons.")
