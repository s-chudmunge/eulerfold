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
    "aho-corasick-string-matching": [
        "It's fascinating how Aho-Corasick turns a search problem into a memory problem. Precomputing those failure links is like giving the algorithm a 'sense of history' so it never has to repeat itself.",
        "I love the idea that searching for 1,000 keywords can be just as fast as searching for one. It's the ultimate 'buy one, get the rest free' deal in algorithm design.",
        "The logic of the finite-state processing here is so clean. It really shows that if you structure your 'dictionary of possibilities' correctly, the complexity of the task just melts away."
    ],
    "aks-primality-in-p": [
        "The fact that this was only solved in 2004—literally thousands of years after we started studying primes—is a great reminder that even the most 'basic' arithmetic still has secrets.",
        "I appreciate how AKS removed the need for unproven assumptions like the Riemann Hypothesis. There's something very satisfying about a proof that's completely unconditional.",
        "It's wild that primality went from being this 'mysterious' property to a simple polynomial identity. It makes you wonder what else we're currently overcomplicating."
    ],
    "alexnet-imagenet-classification": [
        "AlexNet really marks the moment we stopped trying to 'teach' computers what an eye looks like and just let them see for themselves. The shift from hand-crafted features to learned representations was the real revolution.",
        "The use of Dropout is such a cool concept—intentionally breaking the system during training to make it stronger. It's basically the AI version of 'what doesn't kill you makes you stronger'.",
        "I never realized how much of the deep learning boom was actually a hardware story. AlexNet was as much a triumph of GPU parallelization as it was of neural architecture."
    ],
    "alphafold-2-structure-prediction": [
        "AlphaFold 2 treating biology as a geometric problem instead of a physical simulation is a masterclass in 're-framing the question'. We were trying to simulate the physics, while DeepMind was learning the geometry.",
        "The Evoformer's ability to sync evolutionary history with 3D spatial constraints is genius. It's using the 'why' of evolution to solve the 'how' of physics.",
        "Invariant Point Attention is such an elegant solution to the coordinate system problem. It's essentially teaching the model to ignore the 'where' and focus on the 'how'."
    ],
    "arora-pcp-theorem": [
        "The PCP Theorem is mind-bending. The idea that you can verify a massive proof by just peeking at a few random bits—and still be confident—feels like a magic trick.",
        "It's sobering to realize that for many problems, even getting a 'near-optimal' answer is just as hard as finding the perfect one. It really defines the limits of what we can practically solve.",
        "This result changed everything. It turned NP from a question of 'how long is the proof' to 'how efficient is the verifier'. Such a profound shift in perspective."
    ]
}

def seed_batch():
    inserts = []
    for slug, comments in COMMENTS_DATA.items():
        # Assign unique random authors for each slug's comments
        authors = random.sample(USER_IDS, len(comments))
        for i, comment in enumerate(comments):
            inserts.append({
                "context_type": "research",
                "context_id": slug,
                "author_id": authors[i],
                "content": comment,
                "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=random.randint(0, 3), hours=random.randint(0, 23))).isoformat()
            })
    
    if inserts:
        res = sb.table("discussion_threads").insert(inserts).execute()
        print(f"Seeded {len(inserts)} comments for Batch 2.")

if __name__ == "__main__":
    seed_batch()
