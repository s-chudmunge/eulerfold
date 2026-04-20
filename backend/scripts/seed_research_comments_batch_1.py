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
    "abboud-williams-fine-grained-complexity": [
        "The idea that Edit Distance is fundamentally linked to the hardness of SAT is mind-blowing. It really changes how you look at 'slow' algorithms—they aren't just unoptimized; they're theoretically bottlenecked.",
        "I love the concept of 'Fine-Grained Complexity'. Most CS courses just stop at P vs NP, but this actually explains why we can't just 'optimize' our way out of near-quadratic time for things like LCS.",
        "It's strangely comforting to know that the lack of progress in some of these algorithms isn't for a lack of trying, but because of a deeper mathematical structure."
    ],
    "act-action-chunking-transformer": [
        "Temporal ensembling is such a clever way to handle the 'jitter' in robotics. It's basically the math equivalent of human grace.",
        "I'm obsessed with the ALOHA setup. Seeing fine-grained dexterity like opening a marker with low-cost hardware makes the future of robotics feel so much more accessible.",
        "The shift from step-by-step reaction to 'chunking' sequences of intent is a huge conceptual leap. It's less like playing a game of 'Simon Says' and more like playing a piano piece."
    ],
    "adam-stochastic-optimization": [
        "The bias correction part is a masterclass in handling 'cold starts'. It's rare to see a piece of math that so elegantly handles its own initial uncertainty.",
        "Adam is basically the 'silent partner' of every breakthrough in the last decade. It's wild to think how much manual tuning it saved us.",
        "I never realized the 'moments' in Adam were essentially self-regulating physical systems. It makes gradient descent feel much more organic."
    ],
    "adiabatic-quantum-computation": [
        "Framing computation as a continuous physical process instead of a sequence of gates is such a beautiful perspective shift. It's like letting nature solve the puzzle for you.",
        "The 'spectral gap' being the physical manifestation of NP-hardness is one of the most profound things I've read in a while. Logic literally becomes energy.",
        "I wonder if the scalability of these processors will always be limited by that gap. It feels like we're trying to walk a tightrope across a phase transition."
    ],
    "agentomics-ml-autonomous-ml-genomics": [
        "The way this handles biological 'technical noise' by constraining the agent is a great lesson in prompt engineering vs. system design. Pure autonomy isn't always better.",
        "Hiding the test set from the agent's reasoning process is a critical detail. In the age of LLMs, preventing 'reasoning-level data leakage' is as important as the split itself.",
        "Transitioning from pipeline implementation to 'interpreting insights' is the dream for any computational biologist. Glad to see a system that respects the complexity of RNA interactions."
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
        print(f"Seeded {len(inserts)} comments for Batch 1.")

if __name__ == "__main__":
    seed_batch()
