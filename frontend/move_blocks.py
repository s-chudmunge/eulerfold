import sys

with open("src/components/landing/RoadmapGenerator.tsx", "r") as f:
    lines = f.readlines()

# Find start of AI Engine block
ai_start = -1
for i, line in enumerate(lines):
    if '<div className="mt-8 flex flex-col gap-2 max-w-sm">' in line and 'Select AI Engine' in lines[i+2]:
        ai_start = i
        break

# Find start of Step 2 block
step2_start = -1
for i, line in enumerate(lines):
    if '{/* --- Start of Step 2 content merged --- */}' in line:
        step2_start = i
        break

# Find end of Step 2 block
step2_end = -1
for i in range(step2_start, len(lines)):
    if '{!isGenerating && (' in lines[i]:
        step2_end = i
        break

if ai_start != -1 and step2_start != -1 and step2_end != -1:
    ai_block = lines[ai_start:step2_start]
    step2_block = lines[step2_start:step2_end]
    
    new_lines = lines[:ai_start] + step2_block + ai_block + lines[step2_end:]
    
    with open("src/components/landing/RoadmapGenerator.tsx", "w") as f:
        f.writelines(new_lines)
    print("Successfully moved Step 2 above AI Engine block")
else:
    print(f"Failed to find blocks. ai_start: {ai_start}, step2_start: {step2_start}, step2_end: {step2_end}")

