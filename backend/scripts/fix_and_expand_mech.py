import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

fixes = {
    "Rectilinear and Curvilinear Kinematics": ("Curvilinear Kinematics Dynamics Lecture", "Jeff Hanson"),
    "Work and Energy (Dynamics)": ("Work and Energy Dynamics Lecture", "Jeff Hanson"),
    "Buoyancy and Archimedes Principle": ("Buoyancy Fluid Mechanics Lecture", "CPPMechEngTutorials"),
    "Flow in Pipes (Darcy-Weisbach / Moody Chart)": ("Moody Chart Darcy Weisbach Fluid Mechanics", "CPPMechEngTutorials"),
    "Crystal Lattices (BCC/FCC/HCP)": ("Crystal Lattices Materials Science Lecture", "Materials Science"),
    "Dislocations and Plastic Deformation": ("Dislocations Plastic Deformation Materials", "Materials Science"),
    "Fatigue Failure and S-N Curves": ("S-N Curve Fatigue Failure Machine Design", "Machine Design"),
    "Creep in Metals": ("Creep Materials Science Lecture", "Materials Science"),
    "Gear Trains and Gear Ratios": ("Gear Trains Kinematics of Machinery", "Engineering"),
    "Epicyclic (Planetary) Gears": ("Planetary Gears Kinematics of Machinery", "Engineering"),
    "Four-Bar Linkages (Grashof's Condition)": ("Four Bar Linkage Grashof Kinematics", "Engineering"),
    "Clutches and Brakes Mechanics": ("Clutches and Brakes Machine Design", "Engineering"),
    "Forced Vibrations and Resonance": ("Forced Vibrations Mechanical Vibrations", "Mechanical Vibrations")
}

new_topics = [
    {"topic": "Castigliano's Theorem (Energy Methods)", "ai_known_title": "Castigliano's Theorem Mechanics of Materials", "ai_known_channel": "Jeff Hanson", "status": ""},
    {"topic": "Compressible Flow and Normal Shock Waves", "ai_known_title": "Normal Shock Waves Compressible Flow", "ai_known_channel": "Fluid Mechanics", "status": ""},
    {"topic": "Velocity Triangles in Turbomachinery", "ai_known_title": "Velocity Triangles Pumps Turbines", "ai_known_channel": "Fluid Mechanics", "status": ""},
    {"topic": "Forward and Inverse Kinematics (Robotics)", "ai_known_title": "Forward Inverse Kinematics Robotics", "ai_known_channel": "Robotics", "status": ""},
    {"topic": "Metal Casting Processes (Sand and Die Casting)", "ai_known_title": "Sand Casting Die Casting Manufacturing", "ai_known_channel": "Manufacturing", "status": ""},
    {"topic": "Machining Processes (Turning and Milling)", "ai_known_title": "Machining Turning Milling Manufacturing", "ai_known_channel": "Manufacturing", "status": ""},
    {"topic": "Welding Metallurgy and Heat Affected Zones", "ai_known_title": "Welding Metallurgy Heat Affected Zone", "ai_known_channel": "Manufacturing", "status": ""}
]

rows = []
count_fixed = 0
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['status'] != 'DONE':
            row['status'] = ''  # Reset for reprocessing
            if row['topic'] in fixes:
                row['ai_known_title'] = fixes[row['topic']][0]
                row['ai_known_channel'] = fixes[row['topic']][1]
                count_fixed += 1
        rows.append(row)

# Append new topics
rows.extend(new_topics)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Fixed {count_fixed} failed MechE topics and added {len(new_topics)} new advanced topics.")
