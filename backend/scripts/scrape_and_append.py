import urllib.request
import urllib.parse
import re
import csv
import os
import time

def get_yt_id(query):
    try:
        url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req).read().decode("utf-8")
        video_ids = re.findall(r"watch\?v=([a-zA-Z0-9_-]{11})", html)
        return video_ids[0] if video_ids else None
    except Exception as e:
        print(f"Error scraping {query}: {e}")
        return None

failed_fixes = [
    ("Euler's Totient Function", "Euler's Totient Function Michael Penn"),
    ("Hamiltonian Mechanics", "Hamiltonian Mechanics Physics Videos by Eugene Khutoryansky"),
    ("Method of Images (Electrodynamics)", "Method of Images Physics Videos by Eugene Khutoryansky"),
    ("Multipole Expansion", "Multipole Expansion Physics Videos by Eugene Khutoryansky"),
    ("Waveguides and Resonant Cavities", "Waveguides Physics Videos by Eugene Khutoryansky"),
    ("Retarded Potentials and Radiation", "Retarded Potentials Physics Videos by Eugene Khutoryansky"),
    ("The Partition Function", "The Partition Function Physics Videos by Eugene Khutoryansky"),
    ("Phase Transitions and Critical Phenomena", "Phase Transitions Physics Videos by Eugene Khutoryansky"),
    ("Band Theory of Solids", "Band Theory of Solids Physics Videos by Eugene Khutoryansky"),
    ("Nuclear Binding Energy and Mass Defect", "Nuclear Binding Energy The Organic Chemistry Tutor"),
    ("Non-Inertial Reference Frames (Coriolis Effect)", "Coriolis Effect Michel van Biezen"),
    ("Fermi-Dirac Statistics", "Fermi-Dirac Statistics Michel van Biezen"),
    ("Bose-Einstein Statistics", "Bose-Einstein Statistics Michel van Biezen"),
    ("The Schwarzschild Metric", "Schwarzschild Metric ScienceClic English"),
    ("Bloch's Theorem", "Bloch's Theorem Solid State Physics")
]

new_topics = [
    ("Navier-Stokes Equations", "Navier-Stokes Equations Numberphile"),
    ("Reynolds Number and Turbulence", "Reynolds Number and Turbulence Fluid Mechanics"),
    ("Viscosity and Poiseuille Flow", "Viscosity and Poiseuille Flow The Organic Chemistry Tutor"),
    ("Capillary Action and Surface Tension", "Capillary Action and Surface Tension The Organic Chemistry Tutor"),
    ("Maxwell-Boltzmann Distribution", "Maxwell-Boltzmann Distribution The Organic Chemistry Tutor"),
    ("Equipartition Theorem", "Equipartition Theorem Michel van Biezen"),
    ("Ising Model (Ferromagnetism)", "Ising Model Statistical Mechanics"),
    ("Gibbs Free Energy and Chemical Potential", "Gibbs Free Energy The Organic Chemistry Tutor"),
    ("Debye Model of Specific Heat", "Debye Model Solid State Physics"),
    ("Fokker-Planck Equation", "Fokker-Planck Equation"),
    ("Brownian Motion and Random Walks", "Brownian Motion MIT OpenCourseWare"),
    ("Quantum Harmonic Oscillator (Ladder Operators)", "Quantum Harmonic Oscillator Ladder Operators MIT OpenCourseWare"),
    ("Stern-Gerlach Experiment", "Stern-Gerlach Experiment MIT OpenCourseWare"),
    ("Quantum Decoherence", "Quantum Decoherence PBS Space Time"),
    ("Bell's Theorem and Hidden Variables", "Bell's Theorem Veritasium"),
    ("Zeeman Effect and Stark Effect", "Zeeman Effect Physics"),
    ("Clebsch-Gordan Coefficients", "Clebsch-Gordan Coefficients Quantum Mechanics"),
    ("Density Matrices", "Density Matrix Quantum Mechanics MIT"),
    ("Path Integrals (Feynman)", "Feynman Path Integral PBS Space Time"),
    ("Aharonov-Bohm Effect", "Aharonov-Bohm Effect Physics"),
    ("Poynting Vector and Energy Conservation", "Poynting Vector The Organic Chemistry Tutor"),
    ("Larmor Formula", "Larmor Formula Radiation"),
    ("Synchrotron Radiation", "Synchrotron Radiation Physics"),
    ("Cherenkov Radiation", "Cherenkov Radiation Physics Girl"),
    ("Magnetic Monopoles", "Magnetic Monopoles PBS Space Time"),
    ("Plasma Physics (Debye Shielding)", "Plasma Physics Debye Shielding"),
    ("Gravitational Waves", "Gravitational Waves Explained PhD Comics"),
    ("Kerr Metric (Rotating Black Holes)", "Kerr Metric Rotating Black Holes ScienceClic"),
    ("Cosmic Microwave Background (CMB)", "Cosmic Microwave Background PBS Space Time"),
    ("Dark Matter (Evidence and Theories)", "Dark Matter Evidence Kurzgesagt"),
    ("Dark Energy and the Cosmological Constant", "Dark Energy PBS Space Time"),
    ("Inflationary Cosmology", "Inflationary Cosmology PBS Space Time"),
    ("Chandrasekhar Limit", "Chandrasekhar Limit Physics"),
    ("Pulsars and Neutron Stars", "Neutron Stars Kurzgesagt"),
    ("Kepler's Laws Derived", "Kepler's Laws Derivation Physics"),
    ("Higgs Mechanism", "Higgs Mechanism Fermilab"),
    ("Gauge Invariance", "Gauge Invariance Physics"),
    ("Quantum Electrodynamics (QED)", "Quantum Electrodynamics QED Fermilab"),
    ("Quantum Chromodynamics (QCD) Color Charge", "Quantum Chromodynamics QCD Color Charge Fermilab"),
    ("Dirac Equation", "Dirac Equation PBS Space Time"),
    ("Klein-Gordon Equation", "Klein-Gordon Equation Physics"),
    ("Antimatter and CPT Symmetry", "Antimatter and CPT Symmetry Fermilab"),
    ("Neutrino Oscillations", "Neutrino Oscillations Fermilab"),
    ("Quantum Hall Effect", "Quantum Hall Effect Physics"),
    ("Topological Insulators", "Topological Insulators Physics"),
    ("Magnetic Resonance (NMR Physics)", "NMR Physics Basics"),
    ("Josephson Junctions", "Josephson Junctions Superconductivity")
]

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

# Load existing rows
rows = []
existing_topics = set()
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        rows.append(row)
        existing_topics.add(row['topic'].strip())

# Fix failed topics
updates = {t[0]: t[1] for t in failed_fixes}
for row in rows:
    topic = row['topic'].strip()
    if topic in updates:
        print(f"Scraping ID for failed: {topic}")
        vid_id = get_yt_id(updates[topic])
        if vid_id:
            row['ai_known_title'] = vid_id
            row['ai_known_channel'] = '' # Blank triggers ID bypass
            row['status'] = ''
        time.sleep(0.5)

# Append new topics
for t, query in new_topics:
    if t not in existing_topics:
        print(f"Scraping ID for new: {t}")
        vid_id = get_yt_id(query)
        if vid_id:
            rows.append({
                'topic': t,
                'ai_known_title': vid_id,
                'ai_known_channel': '',
                'status': ''
            })
        time.sleep(0.5)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
print("Finished scraping and updating CSV!")
