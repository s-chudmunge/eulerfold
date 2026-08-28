import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

alternatives = {
    "Dutch Roll and Spiral Modes": ("Dutch Roll Flight Dynamics Lecture", ""),
    "Ramjets and Scramjets": ("Ramjet Scramjet Propulsion Lecture", ""),
    "Six Classical Orbital Elements": ("Classical Orbital Elements Lecture", ""),
    "Vis-Viva Equation": ("Vis Viva Equation Orbital Mechanics Lecture", ""),
    "Hohmann Transfer Orbits": ("Hohmann Transfer Orbit Lecture", ""),
    "Orbital Plane Changes (Inclination Change)": ("Orbital Inclination Change Lecture", ""),
    "Interplanetary Trajectories (Patched Conics)": ("Patched Conics Interplanetary Lecture", "")
}

rows = []
count_fixed = 0
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['status'] != 'DONE' and row['topic'] in alternatives:
            row['status'] = ''  # Reset for reprocessing
            row['ai_known_title'] = alternatives[row['topic']][0]
            row['ai_known_channel'] = alternatives[row['topic']][1]
            count_fixed += 1
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Queued {count_fixed} failed Aerospace topics with alternative lecture queries.")
