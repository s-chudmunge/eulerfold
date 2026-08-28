import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

drop_list = [
    "Newton's Laws of Motion", "Kinematics (Projectile Motion)", "Conservation of Momentum",
    "Conservation of Energy", "Rotational Kinematics", "Moment of Inertia",
    "The Laws of Thermodynamics", "Entropy (Statistical Mechanics)", "The Carnot Cycle",
    "Ideal Gas Law", "Coulomb's Law", "Gauss's Law", "Maxwell's Equations",
    "Faraday's Law of Induction", "The Lorentz Force", "The Double Slit Experiment",
    "Heisenberg's Uncertainty Principle", "Quantum Entanglement", "The Schrödinger Equation",
    "Quantum Tunneling", "The Twin Paradox", "Black Hole Information Paradox",
    "Hubble's Law", "The Fermi Paradox"
]

rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['topic'].strip() not in drop_list:
            rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
