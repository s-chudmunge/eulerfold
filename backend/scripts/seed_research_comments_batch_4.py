import os
import datetime
import random
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
load_dotenv("backend/.env")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# User IDs from previous check
USER_IDS = [249, 251, 253, 257, 259, 261, 263, 265, 267, 269, 271, 273, 275, 277, 279, 281, 283, 285, 287, 289]

COMMENTS_DATA = {
    "bioverse-multimodal-biological-foundation-model-alignment": [
        "The concept of 'soft token injection' for biological data is so clever. It's essentially teaching an LLM to 'speak protein' without having to re-train the entire model from scratch.",
        "I'm impressed that an 8B parameter model like Granite can beat 120B giants just by having better multimodal alignment. It really shows that architecture and data relevance matter more than raw size.",
        "The privacy aspect of being able to deploy this locally for genomic research is a huge deal. You can't just send sensitive patient data to a cloud API."
    ],
    "boyer-moore-string-searching": [
        "Boyer-Moore is like the 'anti-brute-force' algorithm. The fact that it actually gets faster the more mismatched it is feels so counter-intuitive until you understand the skip logic.",
        "I love the 'right-to-left' comparison strategy. It's such a simple shift that unlocks sub-linear efficiency. It's basically the math version of looking at the end of a sentence to see if it's the one you're looking for.",
        "The 'Bad-Character Rule' is a masterclass in information theory—using a failure to provide the maximum possible guidance for the next step."
    ],
    "bqp-and-the-polynomial-hierarchy": [
        "Aaronson's work on the 'Boolean Hidden Shift' really clarifies why quantum speedup isn't just about 'fast searching'. It's about detecting global structures that classical logic literally can't see.",
        "The idea that quantum computers are 'orthogonal' to the Polynomial Hierarchy is mind-blowing. It means we might find problems that are easy for a quantum computer but impossible even for a theoretical classical computer with infinite depth.",
        "It's fascinating that phase interference can detect global patterns in a single query. It really frames quantum states as waves of information rather than just bits."
    ],
    "calderbank-shor-css-codes": [
        "CSS codes are the moment quantum error correction became a real science. Nestering two classical codes to handle bit-flips and phase-flips simultaneously is such a clean mathematical solution.",
        "I never realized that 'digitizing' quantum noise into discrete Pauli errors was possible. It's like turning an analog, messy reality into a digital, correctable one.",
        "The proof that 'good' quantum codes exist with linear scaling is the only reason we're even trying to build large-scale quantum computers today. Without it, the overhead would be impossible."
    ],
    "cirac-zoller-ion-trap": [
        "Using collective vibrations (phonons) as a 'data bus' to connect distant ions is genius. It's like using the sound waves in a room to make two people at opposite ends talk.",
        "The Cirac-Zoller paper is basically the 'blueprints' for the first quantum computer. It's wild to think that we're using the fundamental forces that hold matter together as our wires.",
        "Trapped ions are still one of the most promising architectures precisely because of the long coherence times mentioned here. It's the ultimate 'stable' qubit platform."
    ]
}

def seed_batch():
    inserts = []
    for slug, comments in COMMENTS_DATA.items():
        # Assign unique random authors for each slug's comments
        authors = random.sample(USER_IDS, len(comments))
        for i, comment in enumerate(comments):
            inserts.append({
                "context_type": "research-decoded",
                "context_id": slug,
                "author_id": authors[i],
                "content": comment,
                "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=random.randint(0, 3), hours=random.randint(0, 23))).isoformat()
            })
    
    if inserts:
        res = sb.table("discussion_threads").insert(inserts).execute()
        print(f"Seeded {len(inserts)} comments for Batch 4.")

if __name__ == "__main__":
    seed_batch()
