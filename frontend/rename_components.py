import re
import os

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace(old_str, new_str)
    with open(filepath, 'w') as f:
        f.write(content)

base = '/home/sankalp/Documents/projects/eulerfold/frontend/src/components/landing'
replace_in_file(f'{base}/GenerateFromLink.tsx', 'UrlGenerator', 'GenerateFromLink')
replace_in_file(f'{base}/GenerateFromLink.tsx', 'Learn From Any Link', 'Generate from Link')

replace_in_file(f'{base}/GenerateFromSyllabus.tsx', 'SyllabusGenerator', 'GenerateFromSyllabus')
replace_in_file(f'{base}/GenerateFromSyllabus.tsx', 'Convert Syllabi to Courses', 'Generate from Syllabus')

replace_in_file(f'{base}/KnowledgeGapQuiz.tsx', 'SkillGapGenerator', 'KnowledgeGapQuiz')
replace_in_file(f'{base}/KnowledgeGapQuiz.tsx', 'Diagnostic Skill Quizzes', 'Knowledge Gap Quiz')

print("Renamed components")
