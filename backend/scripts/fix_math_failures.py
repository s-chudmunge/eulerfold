import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

updates = {
    "Gradients and Directional Derivatives": ("Directional Derivative and Gradient Vector", "The Organic Chemistry Tutor"),
    "Line Integrals": ("Line Integrals", "The Organic Chemistry Tutor"),
    "Change of Basis": ("Change of Basis", "3Blue1Brown"),
    "Improper Integrals": ("Improper Integrals", "The Organic Chemistry Tutor"),
    "Trigonometric Substitution": ("Trigonometric Substitution", "The Organic Chemistry Tutor"),
    "Sequences and Series": ("Sequences and Series", "The Organic Chemistry Tutor"),
    "Power Series": ("Power Series", "The Organic Chemistry Tutor"),
    "Vector Functions and Space Curves": ("Vector Functions", "The Organic Chemistry Tutor"),
    "Arc Length and Curvature": ("Arc Length Calculus", "The Organic Chemistry Tutor"),
    "Surface Integrals": ("Surface Integrals", "The Organic Chemistry Tutor"),
    "Stokes' Theorem": ("Stokes Theorem", "The Organic Chemistry Tutor"),
    "The Divergence Theorem": ("Divergence Theorem", "The Organic Chemistry Tutor"),
    "Exact Differential Equations": ("Exact Differential Equations", "The Organic Chemistry Tutor"),
    "Propositional Logic": ("Propositional Logic", "The Organic Chemistry Tutor"),
    "Truth Tables": ("Truth Tables", "The Organic Chemistry Tutor"),
    "The Pigeonhole Principle": ("The Pigeonhole Principle", "Dr. Trefor Bazett")
}

rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        topic = row['topic'].strip()
        if topic in updates:
            row['ai_known_title'] = updates[topic][0]
            row['ai_known_channel'] = updates[topic][1]
            row['status'] = ''  # Reset status so it runs again
            print(f"Updated {topic}")
        # Also clear status for any FAILED or ERROR topics just in case
        elif row['status'] in ['FAILED', 'ERROR']:
             row['status'] = ''
             print(f"Reset status for {topic}")
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

