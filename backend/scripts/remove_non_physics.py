import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

drop_list = [
    "CRISPR-Cas9", "Action Potentials", "The Krebs Cycle", "Mitosis",
    "Fractional Reserve Banking", "Call and Put Options", "Supply and Demand",
    "How the Economic Machine Works", "The Battle of Cannae", "The Battle of Alesia",
    "The French Revolution", "The Cold War", "Le Chatelier's Principle",
    "VSEPR Theory", "Stoichiometry", "Utilitarianism", "Optimistic Nihilism",
    "Classical Conditioning", "The Prisoner's Dilemma"
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
