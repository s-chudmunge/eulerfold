import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

updates = {
    "Exponential Distribution": ("Exponential Distribution", "jbstatistics"),
    "Optical Flow": ("Optical Flow Explained", "Visually Explained"),
    "Hadamard Gate": ("Hadamard Gate", "Quantum Intuition"),
    "CNOT Gate": ("CNOT Gate", "Quantum Intuition"),
    "N-Grams": ("N-Gram Models", "ritvikmath"),
    "Coin Change Problem": ("Coin Change - Dynamic Programming", "NeetCode"),
    "Angular": ("Angular Crash Course for Beginners", "Codevolution"),
    "Playwright": ("Playwright Testing Tutorial", "The Testing Academy"),
    "Spring Boot Basics": ("Spring Boot in 1 Hour", "Java Brains"),
    "Intro to Shaders": ("Shaders for Beginners", "Brackeys"),
    "Continuity Equation (Fluid Dynamics)": ("Continuity Equation Fluid Mechanics", "The Organic Chemistry Tutor"),
    "Simple Harmonic Motion": ("Simple Harmonic Motion Physics Problems", "The Organic Chemistry Tutor")
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
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

