import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
from supabase import create_client, Client

sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

rigorous_topics = [
    "Bernoulli's Equation",
    "Archimedes' Principle (Buoyancy)",
    "Continuity Equation (Fluid Dynamics)",
    "Lagrangian Mechanics (Introduction)",
    "Simple Harmonic Motion",
    "Damped Harmonic Oscillators",
    "Biot-Savart Law",
    "Ampere's Law",
    "RC Circuits",
    "Lenz's Law",
    "Snell's Law",
    "Thin Lens Equation",
    "Young's Double Slit Experiment (Derivation)",
    "Relativistic Momentum",
    "Photoelectric Effect",
    "Compton Scattering"
]

response = sb.table("curated_videos").select("topic").in_("topic", rigorous_topics).execute()
found_topics = [row['topic'] for row in response.data]

print(f"✅ Successfully ingested {len(found_topics)} rigorous topics:")
for t in found_topics:
    print(f" - {t}")
