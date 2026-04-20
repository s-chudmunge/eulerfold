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
    "baker-gill-solovay-relativization": [
        "The Relativization Barrier is probably the most humbling result in computer science. It basically says, 'Your favorite proof technique won't work here.' It's like a scientific way of proving we need a completely new language for P vs NP.",
        "It's wild that a problem can have different answers depending on the 'oracles' you give it. It makes you realize how much of our logic is tied to the specific model of reality we're using.",
        "Solovay and his colleagues essentially shut the door on 19th-century mathematics for solving 20th-century complexity. We're still looking for the 'non-relativizing' key they told us we need."
    ],
    "barabasi-albert-scale-free-networks": [
        "Preferential attachment explains so much about the modern web. The rich really do get richer, not because of a conspiracy, but because it's the most efficient way for a growing system to stay connected.",
        "The vulnerability of hubs is a scary thought for cybersecurity. We built a world that's incredibly robust to random accidents but uniquely vulnerable to targeted intent.",
        "I love the idea that these power-law distributions emerge from simple local rules. No one planned for the internet to have 'hubs,' it just grew its own nervous system."
    ],
    "batch-normalization-accelerating-training": [
        "Batch Norm turned the 'black art' of initialization into actual engineering. It's the reason we can train deep models without having a panic attack about the learning rate.",
        "The stochastic regularization effect is a fascinating 'happy accident.' Using mini-batch noise to help generalize is basically turning a bug into a feature.",
        "I never realized that 'Internal Covariate Shift' was the real enemy. We were blaming model capacity when the real problem was just the ground shifting beneath the layers."
    ],
    "bellman-routing-problem": [
        "The Principle of Optimality is one of those 'obvious in hindsight' ideas that changed everything. It turns a massive routing maze into a series of local, manageable decisions.",
        "Dijkstra is faster, but Bellman-Ford's ability to handle negative weights and cycles makes it feel much more 'real world.' It handles the instabilities that simple greedy algorithms ignore.",
        "It's incredible that 1950s routing math is still the heartbeat of decentralized internet protocols today. Good logic never expires."
    ],
    "bert-bidirectional-transformers": [
        "BERT was the moment we realized that reading left-to-right is actually a limitation. Language is a global puzzle, and you need the context from the end of the sentence to understand the beginning.",
        "The Masked Language Model (MLM) is such a clever way to force bidirectional learning without 'cheating.' It's like teaching a model to solve a crossword puzzle to understand a book.",
        "BERT consolidated everything. It proved that one massive, bidirectional foundation is better than a hundred specialized architectures. Scale is a type of quality in its own right."
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
        print(f"Seeded {len(inserts)} comments for Batch 3.")

if __name__ == "__main__":
    seed_batch()
