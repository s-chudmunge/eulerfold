import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
from supabase import create_client, Client

sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

pop_science_topics = [
    "Newton's Laws of Motion", "Kinematics (Projectile Motion)", "Conservation of Momentum",
    "Conservation of Energy", "Rotational Kinematics", "Moment of Inertia",
    "The Laws of Thermodynamics", "Entropy (Statistical Mechanics)", "The Carnot Cycle",
    "Ideal Gas Law", "Coulomb's Law", "Gauss's Law", "Maxwell's Equations",
    "Faraday's Law of Induction", "The Lorentz Force", "The Double Slit Experiment",
    "Heisenberg's Uncertainty Principle", "Quantum Entanglement", "The Schrödinger Equation",
    "Quantum Tunneling", "The Twin Paradox", "Black Hole Information Paradox",
    "Hubble's Law", "The Fermi Paradox"
]

response = sb.table("curated_videos").select("topic").in_("topic", pop_science_topics).execute()

found_topics = [row['topic'] for row in response.data]

if found_topics:
    print(f"Found {len(found_topics)} pop-science topics in DB: {found_topics}")
    print("Cleaning them up now...")
    sb.table("curated_videos").delete().in_("topic", pop_science_topics).execute()
    print("Database cleaned.")
else:
    print("No pop-science topics sneaked into the database. It is clean!")

