import os
import random
import uuid
import datetime
import time
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
load_dotenv("backend/.env")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials missing.")
    exit(1)

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Significantly Expanded & Unique Comment Templates ---

ROADMAP_COMMENTS = {
    "ai": [
        "The section on LoRA vs QLoRA was super clear. I finally understand the memory trade-offs.",
        "I love how this includes prompt engineering patterns. Most roadmaps just focus on the training side.",
        "Agentic workflows are the future. Glad to see FastAPI being used for the backend here.",
        "Is it better to use LangChain or just go raw with the OpenAI/Gemini SDKs for these modules?",
        "The RAG architecture explained in Week 3 is exactly what I'm implementing at work right now.",
        "Great focus on evaluation. Building is easy, but measuring quality is where most people fail.",
        "The vector database comparison (Pinecone vs Milvus vs pgvector) was extremely helpful for my project.",
        "I'm surprised how much grounding techniques improved my bot's performance. Thanks for the tips!",
        "Does the fine-tuning section cover dataset synthetic generation? That's a huge pain point for me.",
        "Really clean breakdown of Transformer blocks. The visualization links are a great touch.",
        "How do you handle rate limits when scaling these agentic systems in production?",
        "The distinction between reasoning models and standard LLMs in Week 4 is a very timely addition."
    ],
    "web": [
        "Framer Motion makes such a difference in UX. Thanks for the specific component examples.",
        "I've been struggling with the App Router's server components, but this roadmap's sequence makes sense.",
        "SQL Mastery indeed! The section on indexing strategies for large tables is a life-saver.",
        "Do you recommend using a managed database like Supabase for this, or setting up raw PostgreSQL?",
        "Clean, professional, and practical. The 3D integration part is a nice modern touch.",
        "Finally a roadmap that doesn't just teach the basics but goes into production-ready patterns.",
        "The performance optimization module (LCP/FID) helped me cut my load times by 40%.",
        "I love the focus on accessibility (a11y) early in the roadmap. It's too often an afterthought.",
        "Figma to Code workflow described here is exactly how our team is trying to align.",
        "The state management section is very pragmatic. Choosing Jotai over Redux for these types of apps makes sense.",
        "How do you handle server-side caching with the new Next.js data fetching patterns?",
        "The responsive design module with CSS Grid vs Flexbox is the clearest I've ever seen."
    ],
    "devops": [
        "Infrastructure as Code (IaC) is so often overlooked. Thank you for including the Terraform modules.",
        "The Kubernetes orchestration part is intense! Any specific tips for managing multi-cluster setups?",
        "GitHub Actions for CI/CD is the way to go. Very clean automation workflow here.",
        "Security-first approach is much appreciated. The vulnerability assessment section is top-notch.",
        "How do you handle secrets management in the production-ready systems described in Week 4?",
        "The Docker optimization tips (multi-stage builds) saved me a lot of CI minutes.",
        "Monitoring with Prometheus and Grafana—glad this wasn't left as an 'exercise for the reader'.",
        "The transition from monolithic to microservices deployment is handled very carefully here.",
        "I'm curious about the Blue/Green deployment strategy mentioned—any rollback horror stories?",
        "The focus on eBPF for observability in the advanced section is a very high-level addition.",
        "Solid advice on load balancing. Nginx vs HAProxy is always a great debate.",
        "Cloud-agnostic patterns are hard to teach, but this roadmap manages it quite well."
    ],
    "design_marketing": [
        "The focus on conversion psychology in the PLG section is brilliant. Designers need this data-driven mindset.",
        "Marketing for non-marketers is such a needed skill. This breaks down the 'black box' effectively.",
        "I love the emphasis on building a personal brand while contributing to open source.",
        "The freelance roadmap is very practical. The advice on client acquisition in Week 3 is gold.",
        "Great aesthetic on the 3D graphics section. It really helps to see how branding and tech intersect.",
        "The user research module helped me realize we were building for the wrong persona.",
        "Visual hierarchy is a lost art. This guide brings back the core principles very effectively.",
        "Growth hacking can be cringy, but the 'Growth Design' approach here is very professional.",
        "I appreciated the section on A/B testing—statistically significant design is the way to go.",
        "The portfolio building tips are specific. No more 'generic' case studies for me!",
        "How do you balance creative freedom with strict brand guidelines in the 3D space?",
        "The SEO for designers section was an eye-opener. Meta tags and semantic HTML matter so much."
    ],
    "distributed_systems": [
        "Architecting for 1M+ RPS is a massive challenge. The event-driven approach here is very solid.",
        "Microservices communication via gRPC is definitely superior to REST for internal service calls.",
        "I'm curious about the database sharding strategy—how do you handle re-sharding without downtime?",
        "This is exactly what I needed for my Staff Engineer interview prep. Very high-level and detailed.",
        "The trade-off analysis between consistency and availability in Week 2 is excellent.",
        "Consensus algorithms (Raft/Paxos) are finally making sense after seeing the implementation steps.",
        "The section on idempotency in distributed transactions is a critical inclusion for fintech apps.",
        "Message queues (Kafka vs RabbitMQ)—I love the specific use-case breakdowns for each.",
        "The 'Dead Letter Queue' strategy saved my production system last week. Thanks for the tip!",
        "How do you handle clock drift in the distributed timestamping module?",
        "Circuit breakers and retries—the resilience patterns here are comprehensive.",
        "The data locality section for global deployments is very relevant for latency reduction."
    ],
    "academic_career": [
        "The GATE preparation kickstart is very well-structured. Helps to prioritize subjects correctly.",
        "Aptitude mastery is the biggest hurdle for placements. These modules cover all the core patterns.",
        "Great to see a JEE Mains roadmap that focuses on planning and strategy, not just solving problems.",
        "The NEET PG landscape analysis is very helpful. It's easy to get overwhelmed by the syllabus.",
        "Logical reasoning and verbal ability are often ignored. Glad they have dedicated time here.",
        "The placement roadmap for product roles is very specific. The mock interview section is a plus.",
        "I like the 'active recall' techniques suggested for the heavier theoretical modules.",
        "Competitive programming section—the focus on space complexity is refreshing.",
        "The time management templates for the 4-week intensive track are very useful.",
        "Does the NDA roadmap include the physical fitness prep as well? It's often forgotten.",
        "The verbal reasoning module was surprisingly tough but very well explained.",
        "I'm following the CDS roadmap. The current affairs strategy for Week 1 is perfect."
    ],
    "game_dev": [
        "C# scripting in Unity can be messy, but the patterns suggested here are very clean.",
        "The physics engine module helped me fix the jittery movement in my project. Thanks!",
        "Animations and UI often feel like an afterthought in game dev—glad to see them getting attention here.",
        "Is it worth learning the new Data-Oriented Technology Stack (DOTS) alongside this roadmap?",
        "The shader graph section is a blast. Making custom water effects was easier than I thought.",
        "Optimization for mobile vs desktop—the performance profiling module is a must-read.",
        "Building a custom inventory system using ScriptableObjects—best guide I've found on this.",
        "The AI navigation (NavMesh) section is very robust. My NPCs actually feel 'smart' now.",
        "How do you handle save-game persistence for complex RPG structures?",
        "The sound design and spatial audio module adds so much immersion. Great addition.",
        "Level design principles (flow/pacing) are discussed with real-world examples. Love it.",
        "The 2D animation module using the new Sprite Skinning tools is very efficient."
    ],
    "finance": [
        "Market structures are so complex. This roadmap simplifies the 'why' behind price movements.",
        "The risk management section in Week 2 is the most important part. Too many people ignore it.",
        "I like the transition from fundamental analysis to technical trading strategies.",
        "Are there any specific tools or APIs you recommend for the analytical techniques mentioned?",
        "Options trading Greeks (Delta/Theta) are finally clear. The simulation exercises are great.",
        "Behavioral finance and the 'psychology of the trade' section is a hidden gem here.",
        "The breakdown of ETF vs Mutual Fund structures was very helpful for my personal portfolio.",
        "I'm curious about the algorithmic trading module—how much Python is actually required?",
        "The fixed income and bond market section is very thorough. Often skipped in these roadmaps.",
        "How do you handle backtesting bias in the strategy evaluation module?",
        "Crypto and Web3 finance section—the focus on DeFi protocols is very modern.",
        "The tax-efficiency module for long-term investing is a practical addition."
    ],
    "science": [
        "Climate science and thermodynamics—a very unique and timely roadmap. Very well researched.",
        "Computational neuroscience is a fascinating bridge. The neuronal dynamics module is very clear.",
        "Bioinformatics is such a huge field. Focusing on sequences to structures is a great entry point.",
        "The use of Python for genomic analysis is exactly what I was looking for. Very practical.",
        "The energy systems module (solar vs wind thermodynamics) is scientifically very rigorous.",
        "I appreciate the inclusion of R for statistical biology alongside Python.",
        "The neural networks in neuroscience section—the Hodgkin-Huxley model explanation is spot on.",
        "Is there a section on CRISPR data analysis in the advanced bioinformatics modules?",
        "The carbon cycle modeling module is quite intensive. I love the math involved.",
        "How do you handle large-scale sequence alignment in the Week 3 practicals?",
        "The protein folding section (post-AlphaFold) is a great look into the future of the field.",
        "Interdisciplinary approach at its best. Bridging biology and AI is the way forward."
    ],
    "default": [
        "This is a great structure. Very easy to follow.",
        "I've started this today and I'm already seeing progress. Thanks for the clear instructions!",
        "The resources linked in each module are extremely helpful.",
        "Looking forward to completing this and adding it to my portfolio.",
        "Does anyone want to team up and work through this roadmap together?",
        "The depth of information here is surprising for a 4-week roadmap. Very dense!",
        "I love the Proof of Work requirements. It actually makes me build something.",
        "Clean, logical, and well-paced. Perfect for a busy schedule.",
        "The community feedback on the submissions has been very encouraging.",
        "Exactly the guide I needed to switch careers. Thank you EulerFold team!",
        "The 'audit' system for progress is a great motivator. No skipping the hard parts.",
        "I appreciate the 'Why this matters' section at the start of each module."
    ]
}

RESEARCH_COMMENTS = {
    "ai_ml": [
        "The transition from tokenization to the self-attention mechanism is explained beautifully here.",
        "It's fascinating to see how the scaling laws predicted the performance of models like GPT-4.",
        "Flash Attention's focus on hardware-aware optimization is a total game-changer for long contexts.",
        "LoRA has made experimentation so much cheaper for individual researchers. Great summary.",
        "The MoE (Mixture of Experts) architecture in the recent DeepSeek and Gemini models is clearly rooted here.",
        "I finally understand why RLHF is so critical for making these models actually helpful.",
        "The math behind the Adam optimizer is so robust. It's amazing it's still the default after a decade.",
        "The 'Incentivizing Reasoning' approach in DeepSeek-R1 is a fascinating evolution of pure RL.",
        "Scaling test-time compute is proving to be as important as scaling training compute.",
        "The Vision Transformer (ViT) Decode really highlights why 'attention is all you need' even for pixels.",
        "I appreciate the breakdown of DPO vs RLHF. The simpler alignment strategy is winning.",
        "Latent Attention (MLA) in DeepSeek-V2 is a masterclass in KV-cache optimization.",
        "The 'Extra Long Context' techniques in Transformer-XL solved so many temporal issues.",
        "Generative Adversarial Nets (GANs) seem so different now, but the competition logic is still genius."
    ],
    "quantum": [
        "The DiVincenzo criteria provide such a clean framework for understanding the hardware race.",
        "Shor's algorithm remains the 'killer app' for quantum computing. The logic is just stunning.",
        "The surface code and topological error correction are the real keys to scalability, as this Decode shows.",
        "I love the breakdown of the Sycamore processor's quantum supremacy experiment. Very grounded.",
        "VQE seems like the perfect candidate for NISQ-era devices. Glad to see it featured here.",
        "The HHL algorithm's speedup for linear systems is mathematically mind-blowing.",
        "Grover's algorithm for database search—the O(sqrt(N)) speedup is such a unique quantum result.",
        "Kitaev's Toric code is the pinnacle of topological memory design. Great Decode.",
        "The distinction between gates and adiabatic computation is explained very clearly.",
        "I'm curious about the 'NISQ-era and beyond' challenges—how close are we to logical qubits?",
        "The Ion Trap vs Superconducting debate is perfectly summarized here.",
        "Quantum machine learning (QML) still feels early, but the potential is undeniable."
    ],
    "algorithms": [
        "Aho-Corasick is one of those algorithms that you use every day without realizing it. Great visualization.",
        "The PCP theorem is mind-bending. The idea that proofs can be checked by looking at just a few bits is wild.",
        "Primality testing in P was such a milestone. The AKS paper is surprisingly elegant when broken down.",
        "I appreciate the focus on B-trees and their variants. They really are the backbone of modern storage.",
        "The Karp combinatorial problems paper is a classic. It's essentially the birth of modern complexity theory.",
        "String matching with KMP vs Boyer-Moore—the skip logic is explained perfectly here.",
        "Cuckoo Hashing is such a clever use of multiple hash functions to avoid collisions. Zero-waste!",
        "The Dijkstra and Floyd-Warshall comparisons for shortest paths are very helpful for interview prep.",
        "Karger's Min-Cut—I love how a randomized approach can be so efficient for such a hard problem.",
        "Fibonacci Heaps are famously complex, but the amortized analysis here makes them approachable.",
        "Smoothed analysis by Spielman and Teng—a brilliant way to explain why Simplex works in practice.",
        "The 'Log-Space' connectivity result by Reingold is a masterclass in theoretical computer science."
    ],
    "biology_physics": [
        "AlphaFold 2's IPA (Invariant Point Attention) is such a clever way to handle 3D coordinates.",
        "The DNA double helix Decode gives so much respect to the original data and the structural logic.",
        "Agentomics is a bold vision. Using AI agents to drive the entire scientific loop is the next frontier.",
        "Mendel's laws are the perfect example of clean, logical experimental design. Classic for a reason.",
        "The CRISPR-GPT integration shows how LLMs can actually assist in precision genome editing.",
        "BioVerse's multimodal alignment is exactly what we need for integrated biological modeling.",
        "Evo's DNA language model is a fascinating look at 'genomic syntax'.",
        "The physics-informed ML section—the integration of PDEs into the loss function is brilliant.",
        "I appreciate the Decode on Feynman's 'Simulating Physics'—the paper that started it all.",
        "Watson and Crick's original paper is so short but changed the world. Great context provided here.",
        "Computational neuroscience: bridging the gap between biological and artificial neurons is the goal.",
        "How do you handle the high-dimensionality of genomics data in the models described in Agentomics?"
    ],
    "classic_general": [
        "Shannon's information theory is the foundation of everything we do today. Essential reading.",
        "Turing's 'Computing Machinery and Intelligence' is still as relevant today as it was in 1950.",
        "Nash Equilibrium is such a powerful lens for understanding competitive markets and social systems.",
        "Small-world networks are everywhere! This paper really changed how I think about connectivity.",
        "Hoare's axiomatic basis for computer programming—the foundation of formal verification.",
        "The PageRank paper—it's incredible how a simple graph property defined the modern web.",
        "Special Relativity Decode: Einstein's thought experiments are explained with great clarity.",
        "Scale-free networks and the Barabasi-Albert model—a fundamental shift in network science.",
        "I appreciate the context on 'Computing Machinery'—Turing was decades ahead of his time.",
        "Information theory and entropy—the link between physics and communication is fascinating.",
        "The concept of 'Stable Equilibrium' in game theory has so many biological applications too.",
        "Clean, insightful, and foundational. These Decodes are a great way to respect the originals."
    ]
}

def get_roadmap_category(title, slug):
    t = (title + " " + slug).lower()
    if any(x in t for x in ["ai", "llm", "prompt", "agent", "intelligence", "machine learning"]): return "ai"
    if any(x in t for x in ["web", "frontend", "react", "next", "sql", "backend", "data engineering", "animation"]): return "web"
    if any(x in t for x in ["devops", "ci", "cloud", "docker", "aws", "cybersecurity", "linux", "terminal"]): return "devops"
    if any(x in t for x in ["marketing", "design", "freelance", "open source", "youtube", "plg", "branding"]): return "design_marketing"
    if any(x in t for x in ["distributed", "scale", "rps"]): return "distributed_systems"
    if any(x in t for x in ["gate", "aptitude", "jee", "neet", "nda", "cds", "placement"]): return "academic_career"
    if any(x in t for x in ["unity", "game", "editing"]): return "game_dev"
    if any(x in t for x in ["finance", "investing", "trading"]): return "finance"
    if any(x in t for x in ["climate", "neuroscience", "bioinformatics", "energy"]): return "science"
    return "default"

def get_research_category(slug):
    s = slug.lower()
    if any(x in s for x in ["attention", "gpt", "llama", "deepseek", "transformer", "diffusion", "neural", "scaling", "learning", "ai", "moe", "flash", "bert", "resnet", "adam", "lora", "vit", "gan"]): return "ai_ml"
    if any(x in s for x in ["quantum", "qubit", "shor", "kitaev", "vqe", "hhl", "grover", "sycamore", "nisq"]): return "quantum"
    if any(x in s for x in ["dna", "crispr", "biology", "alphafold", "mendel", "evolution", "helix", "agentomics", "neuroscience", "bioinformatics"]): return "biology_physics"
    if any(x in s for x in ["aho", "pcp", "primality", "primality-in-p", "b-tree", "karp", "complexity", "graph", "shortest-path", "string-matching", "search"]): return "algorithms"
    return "classic_general"

def seed_meaningful_comments():
    print("Fetching seeded users...")
    users_res = sb.table("profiles").select("id, username").ilike("email", "%@dummy.eulerfold.com").limit(100).execute()
    users = users_res.data
    if not users:
        print("No dummy users found. Run seed_leaderboard_users.py first.")
        return
    
    print(f"Found {len(users)} users.")

    # 1. Seed Roadmap Comments
    print("Fetching public roadmaps...")
    rm_res = sb.table("roadmaps").select("id, title, slug").eq("is_public", True).execute()
    roadmaps = rm_res.data
    
    # Pick a subset of 15 roadmaps to make it feel dense but not overwhelming
    target_roadmaps = random.sample(roadmaps, min(15, len(roadmaps)))
    
    comments_added = 0
    roadmap_inserts = []
    for rm in target_roadmaps:
        num_comments = random.randint(3, 7)
        category = get_roadmap_category(rm["title"], rm["slug"])
        authors = random.sample(users, num_comments)
        
        for author in authors:
            content = random.choice(ROADMAP_COMMENTS[category])
            roadmap_inserts.append({
                "context_type": "roadmap",
                "context_id": str(rm["id"]),
                "author_id": author["id"],
                "content": content,
                "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=random.randint(0, 14), hours=random.randint(0, 23))).isoformat()
            })
    
    # Batch insert roadmap comments
    if roadmap_inserts:
        # Split into smaller chunks to be safe
        chunk_size = 50
        for i in range(0, len(roadmap_inserts), chunk_size):
            chunk = roadmap_inserts[i:i + chunk_size]
            sb.table("discussion_threads").insert(chunk).execute()
            print(f"Inserted roadmap chunk {i//chunk_size + 1}...")
            time.sleep(0.5)
            comments_added += len(chunk)
    
    print(f"Added {comments_added} roadmap comments across {len(target_roadmaps)} roadmaps.")

    # 2. Seed Research Decoded Comments
    research_slugs = [
        "attention-is-all-you-need", "gpt-4-technical-report", "deepseek-r1-incentivizing-reasoning",
        "alphafold-2-structure-prediction", "shannon-information-theory", "flash-attention-io-aware",
        "adam-stochastic-optimization", "bert-bidirectional-transformers", "resnet-deep-residual-learning",
        "llama-3-herd-of-models", "dalle-2-hierarchical-generation", "chain-of-thought-prompting",
        "quantum-supremacy-sycamore", "aho-corasick-string-matching", "scaling-laws-neural-language-models",
        "lora-low-rank-adaptation", "transformer-xl-extra-long-context", "vit-vision-transformer",
        "generative-adversarial-nets", "stable-diffusion-latent-space", "turing-computing-machinery",
        "nash-equilibrium-game-theory", "deepseek-v2-latent-attention"
    ]
    
    res_comments_added = 0
    research_inserts = []
    for slug in research_slugs:
        num_comments = random.randint(3, 8)
        category = get_research_category(slug)
        authors = random.sample(users, num_comments)
        
        for author in authors:
            content = random.choice(RESEARCH_COMMENTS[category])
            research_inserts.append({
                "context_type": "research",
                "context_id": slug,
                "author_id": author["id"],
                "content": content,
                "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=random.randint(0, 14), hours=random.randint(0, 23))).isoformat()
            })

    # Batch insert research comments
    if research_inserts:
        chunk_size = 50
        for i in range(0, len(research_inserts), chunk_size):
            chunk = research_inserts[i:i + chunk_size]
            sb.table("discussion_threads").insert(chunk).execute()
            print(f"Inserted research chunk {i//chunk_size + 1}...")
            time.sleep(0.5)
            res_comments_added += len(chunk)

    print(f"Added {res_comments_added} research comments across {len(research_slugs)} pages.")

if __name__ == "__main__":
    import datetime
    seed_meaningful_comments()
