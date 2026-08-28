import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

duration_fixes = {
    "Types of Selection": ("Directional Stabilizing Disruptive Selection Lecture", "Bozeman Science"),
    "Convergent vs Divergent Evolution": ("Convergent Divergent Evolution Lecture", "Bozeman Science"),
    "Sharpless Asymmetric Epoxidation": ("Sharpless Epoxidation Mechanism", "Chemistry"),
    "Debye-Hückel Theory of Electrolytes": ("Debye Huckel Theory Physical Chemistry", "TMP Chem"),
    "Lanthanide Contraction": ("Lanthanide Contraction Inorganic Chemistry", "Chemistry"),
    "Hox Genes and Body Patterning": ("Hox Genes Embryology", "Bozeman Science"),
    "Stem Cells and Induced Pluripotency (iPSCs)": ("Induced Pluripotent Stem Cells Lecture", "Shomu's Biology"),
    "RNA-Seq and Transcriptomics": ("RNA Sequencing Transcriptomics Bioinformatics", "Bioinformatics"),
    "Long-Term Potentiation (LTP) and Memory": ("Long Term Potentiation LTP Neuroscience", "Ninja Nerd"),
    "Xylem and Phloem Transport (Cohesion-Tension Theory)": ("Xylem and Phloem Transport Plant Biology", "Bozeman Science")
}

rows = []
count = 0
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['status'] != 'DONE':
            row['status'] = ''
            count += 1
            if row['topic'] in duration_fixes:
                row['ai_known_title'] = duration_fixes[row['topic']][0]
                row['ai_known_channel'] = duration_fixes[row['topic']][1]
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Reset {count} topics for re-ingestion.")
