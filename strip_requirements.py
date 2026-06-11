import re

files = [
    "backend/requirements.prod.txt",
    "backend/app/requirements.txt"
]

for file in files:
    with open(file, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Remove ==, >=, <=, <, > and everything after it
        clean_line = re.split(r'[=><]+', line)[0]
        new_lines.append(clean_line + "\n")
        
    with open(file, 'w') as f:
        f.writelines(new_lines)

print("Versions stripped successfully!")
