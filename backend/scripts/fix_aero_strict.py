import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

aero_fixes = {
    "Airfoil Nomenclature and Aerodynamic Forces": ("Airfoil Nomenclature Aerodynamics", "nptelhrd"),
    "Kutta-Joukowski Theorem (Lift Generation)": ("Kutta Joukowski Theorem Aerodynamics", "nptelhrd"),
    "Thin Airfoil Theory": ("Thin Airfoil Theory Aerodynamics", "nptelhrd"),
    "Prandtl's Lifting-Line Theory": ("Lifting Line Theory Aerodynamics", "nptelhrd"),
    "Oblique Shock Waves": ("Oblique Shock Waves Gas Dynamics", "nptelhrd"),
    "Prandtl-Meyer Expansion Fans": ("Prandtl Meyer Expansion Gas Dynamics", "nptelhrd"),
    "Swept Wing Aerodynamics": ("Swept Wing Aerodynamics", "nptelhrd"),
    "Boundary Layer Separation on Airfoils": ("Boundary Layer Separation Aerodynamics", "nptelhrd"),
    "Aircraft Equations of Motion": ("Equations of Motion Flight Dynamics", "nptelhrd"),
    "Breguet Range and Endurance Equations": ("Range and Endurance Flight Dynamics", "nptelhrd"),
    "V-n Diagram (Flight Envelope)": ("V-n Diagram Flight Dynamics", "nptelhrd"),
    "Static Longitudinal Stability": ("Static Longitudinal Stability Flight Dynamics", "nptelhrd"),
    "The Neutral Point and Static Margin": ("Neutral Point Flight Dynamics", "nptelhrd"),
    "Phugoid and Short-Period Modes (Dynamic Stability)": ("Dynamic Stability Flight Dynamics", "nptelhrd"),
    "Dutch Roll and Spiral Modes": ("Dutch Roll Flight Dynamics", "nptelhrd"),
    "The Thrust Equation": ("Thrust Equation Aerospace Propulsion", "nptelhrd"),
    "Propeller Momentum Theory": ("Propeller Momentum Theory Aerospace", "nptelhrd"),
    "Turbojet Engine Thermodynamics": ("Turbojet Engine Aerospace Propulsion", "nptelhrd"),
    "Turbofan Engines and Bypass Ratios": ("Turbofan Engine Aerospace Propulsion", "nptelhrd"),
    "Ramjets and Scramjets": ("Ramjet Scramjet Aerospace Propulsion", "nptelhrd"),
    "The Ideal Rocket Equation (Tsiolkovsky)": ("Rocket Equation Propulsion", "nptelhrd"),
    "Solid vs Liquid Rocket Propellants": ("Rocket Propellants Propulsion", "nptelhrd"),
    "Convergent-Divergent (De Laval) Nozzle Flow": ("Nozzle Flow Gas Dynamics", "nptelhrd"),
    "Six Classical Orbital Elements": ("Orbital Elements Astrodynamics", "MIT OpenCourseWare"),
    "Vis-Viva Equation": ("Vis Viva Equation Astrodynamics", "MIT OpenCourseWare"),
    "Hohmann Transfer Orbits": ("Hohmann Transfer Astrodynamics", "MIT OpenCourseWare"),
    "Orbital Plane Changes (Inclination Change)": ("Orbital Plane Change Astrodynamics", "MIT OpenCourseWare"),
    "Interplanetary Trajectories (Patched Conics)": ("Patched Conics Astrodynamics", "MIT OpenCourseWare"),
    "Lambert's Problem": ("Lambert's Problem Astrodynamics", "MIT OpenCourseWare"),
    "Lagrange Points and Stability": ("Lagrange Points Astrodynamics", "MIT OpenCourseWare"),
    "Bending of Asymmetrical Beam Sections": ("Unsymmetrical Bending Aerospace Structures", "nptelhrd"),
    "Shear Flow in Thin-Walled Structures": ("Shear Flow Aerospace Structures", "nptelhrd"),
    "Torsion of Multi-Cell Sections": ("Torsion Multi Cell Aerospace Structures", "nptelhrd")
}

rows = []
count_fixed = 0
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['topic'] in aero_fixes:
            row['status'] = ''  # Reset for reprocessing, overwriting the low quality ones too
            row['ai_known_title'] = aero_fixes[row['topic']][0]
            row['ai_known_channel'] = aero_fixes[row['topic']][1]
            count_fixed += 1
        rows.append(row)

with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Strictly routed {count_fixed} Aerospace topics to NPTEL and MIT OpenCourseWare.")
