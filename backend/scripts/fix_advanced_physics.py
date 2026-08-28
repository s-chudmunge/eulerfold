import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

updates = {
    "Non-Inertial Reference Frames (Coriolis Effect)": ("Coriolis Effect", "Professor Dave Explains"),
    "Multipole Expansion": ("Multipole Expansion Electromagnetism", "Michel van Biezen"),
    "Waveguides and Resonant Cavities": ("Waveguides Electromagnetism", "Michel van Biezen"),
    "Retarded Potentials and Radiation": ("Retarded Potentials", "Michel van Biezen"),
    "The Partition Function": ("The Partition Function", "MIT OpenCourseWare"),
    "Fermi-Dirac Statistics": ("Fermi-Dirac Statistics", "MIT OpenCourseWare"),
    "Phase Transitions and Critical Phenomena": ("Phase Transitions", "MIT OpenCourseWare"),
    "Band Theory of Solids": ("Band Theory of Solids", "MIT OpenCourseWare"),
    "Nuclear Binding Energy and Mass Defect": ("Nuclear Binding Energy", "Bozeman Science"),
    "Debye Model of Specific Heat": ("Debye Model of Specific Heat", "MIT OpenCourseWare"),
    "Clebsch-Gordan Coefficients": ("Clebsch Gordan Coefficients", "Physics Videos by Eugene Khutoryansky"),
    "Density Matrices": ("Density Matrix", "Quantum Intuition"),
    "Cherenkov Radiation": ("Cherenkov Radiation", "Fermilab"),
    "Poynting Vector and Energy Conservation": ("Poynting Vector", "Physics Videos by Eugene Khutoryansky"),
    "Gravitational Waves": ("Gravitational Waves", "PBS Space Time"),
    "Chandrasekhar Limit": ("Chandrasekhar Limit", "PBS Space Time"),
    "Dirac Equation": ("Dirac Equation", "Fermilab")
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
        # Also catch any silent errors/timeouts that are blank or ERROR
        elif row['status'] in ['FAILED', 'ERROR']:
             row['status'] = ''
             print(f"Reset status for {topic}")
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

