import sys

with open("src/components/landing/RoadmapGenerator.tsx", "r") as f:
    text = f.read()

ai_split = text.split('            <div className="mt-8 flex flex-col gap-2 max-w-sm">')
before_ai = ai_split[0]
after_ai = '            <div className="mt-8 flex flex-col gap-2 max-w-sm">' + ai_split[1]

# Now split after_ai by the step 2 comment
step2_split = after_ai.split('            {/* --- Start of Step 2 content merged --- */}')
ai_block = step2_split[0]
after_step2 = '            {/* --- Start of Step 2 content merged --- */}' + step2_split[1]

# Now split after_step2 by the !isGenerating
final_split = after_step2.split('            {!isGenerating && (')
step2_block = final_split[0]
rest = '            {!isGenerating && (' + final_split[1]

new_text = before_ai + step2_block + ai_block + rest

with open("src/components/landing/RoadmapGenerator.tsx", "w") as f:
    f.write(new_text)

print("Swapped successfully")
