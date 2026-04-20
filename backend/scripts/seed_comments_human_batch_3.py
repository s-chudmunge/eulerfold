import os
import random
import datetime
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

DATA = {
    "106": { # High Scale Distributed Systems
        "slug": "high-scale-distributed-systems-architecting-for-1m-rps",
        "comments": [
            "1M+ RPS is just a scary number until you see the event-driven architecture here. solid stuff.",
            "finally found a guide that explains why grpc > rest for internal services without getting too academic.",
            "how do you guys handle re-sharding without the whole system going down? that part in week 2 is deep.",
            "staff engineer interview prep is hard but this roadmap is a legit cheat code. very detailed.",
            "cap theorem is usually boring but the consistency vs availability tradeoff analysis here is fire.",
            "consensus algorithms like raft finally make sense after seeing the implementation steps. thanks!!",
            "idempotency in distributed transactions—glad this was included. saved my fintech app from a mess lol.",
            "kafka vs rabbitmq—the breakdown in week 3 is perfect for deciding which one to actually use.",
            "the 'dead letter queue' strategy is a lifesaver. my production system is way more resilient now.",
            "how do you handle clock drift in distributed systems? that module was a real brain melter lol.",
            "circuit breakers and retries—the resilience patterns here are comprehensive. great work.",
            "data locality for global deployments is so important for latency. fixed my slow asia-pacific responses!"
        ]
    },
    "114": { # Data Engineering Fundamentals
        "slug": "data-engineering-fundamentals",
        "comments": [
            "etl vs elt—finally a clear explanation of when to use snowflake vs spark. tysm!!",
            "airflow dags used to confuse the hell out of me but the backfilling section cleared it up. hyped!",
            "how do you handle schema evolution in delta lake? week 2's guide is pretty thorough though.",
            "star vs snowflake schema—the data modeling module is foundational. clean and simple breakdown.",
            "is spark memory management always this tricky? -_- any extra tips for optimizing jobs?",
            "dbt is a game changer for data quality. glad it's featured so prominently in the roadmap.",
            "late arriving dimensions are a nightmare lol. week 3's real-time pipeline tips were very helpful.",
            "flink vs kafka for stream processing—great comparison in the later modules. choosing flink now.",
            "data governance isn't 'fun' but the cataloging module with amundsen was actually interesting.",
            "just built my first end-to-end data pipeline! feeling like a real data engineer now lol.",
            "wait, so partitioning can speed up queries that much? my dashboard is actually fast now!!",
            "cloud data warehousing (bigquery vs redshift)—loved the cost/performance analysis. very useful."
        ]
    },
    "109": { # Bioinformatics
        "slug": "bioinformatics-learning-roadmap-from-sequences-to-structures",
        "comments": [
            "bioinformatics is huge but focusing on sequences to structures is such a logical entry point.",
            "python for genomics is exactly what i needed. no more messy spreadsheets lol.",
            "blast alignment math is pretty intense. any tips for handling the smith-waterman practicals?",
            "protein folding after alphafold is the future. glad to see this featured in week 4.",
            "r for statistical biology—tysm for including this alongside python. both are so necessary.",
            "seeing the sequence alignment visualization finally made the dynamic programming part click.",
            "crispr data analysis is a bit of a niche but module 3 explains it perfectly. very cool.",
            "pymol is a blast. finally visualizing these pdb files in 3d is so satisfying!!",
            "how do you handle the high-dimensionality of these datasets without losing your mind? lol.",
            "phylogenetic trees module was tough but the evolution logic is fascinating. great work.",
            "fasta/fastq parsing is a rite of passage lol. week 1 makes it very easy though.",
            "interdisciplinary research is hard but this roadmap bridges biology and cs perfectly."
        ]
    },
    "108": { # Computational Neuroscience
        "slug": "computational-neuroscience-bridging-biology-and-ai",
        "comments": [
            "computational neuroscience is legit mind blowing. biological neurons > artificial ones any day lol.",
            "hodgkin-huxley model explanation was spot on. finally understood the gating variables math.",
            "linking biology to ai is such a cool perspective. makes you think differently about nn architectures.",
            "carbon cycle modeling in the science track—quite intensive but the math is very clear.",
            "is it better to use nest or brian2 for the brain network simulations in week 3?",
            "rate vs temporal coding—finally an eye-opener on how information is actually moving in the brain.",
            "synaptic plasticity and hebbian learning—glad these weren't skipped. foundation of everything.",
            "modeling individual neurons first is very logical. helps you not get overwhelmed by the network.",
            "dynamical systems theory + neuroscience = a lot of math but a lot of fun lol.",
            "how do you get your hands on real electrophys data for the validation module?",
            "predicting behavior from spikes in the decoding section—felt like i was in a sci-fi movie lol.",
            "python notebooks for simulation are a great resource. saved me so much setup time."
        ]
    },
    "72": { # Open Source Contribution
        "slug": "open-source-contribution-roadmap-from-zero-to-recognized-contributor",
        "comments": [
            "building a brand while doing open source is such a big brain move. thanks for the tip!!",
            "just had my first pr merged into a real repo!! week 2's guide on finding issues was key.",
            "is it just me or is reading a new codebase for the first time super intimidating? -_-",
            "open source etiquette is so important. realized my old comments were way too blunt lol.",
            "forking vs branching—finally understood the workflow for contributing to external projects.",
            "gsoc and outreachy section is great. definitely applying for the next cycle.",
            "starting with documentation is so pragmatic. great way to get your feet wet without the fear.",
            "mit vs gpl—glad the license types were explained. simplified the 'legal' side of dev a lot.",
            "balancing open source with a day job is hard but week 5 has some solid time-management tips.",
            "polished my github profile using the module 4 advice. looks way more professional now.",
            "writing clean commit messages makes such a difference. maintainers actually like me now lol.",
            "road to being a maintainer starts here. feeling super motivated after finishing the modules!"
        ]
    }
}

def seed_batch():
    print("Fetching seeded users...")
    users_res = sb.table("profiles").select("id").ilike("email", "%@dummy.eulerfold.com").limit(100).execute()
    users = users_res.data
    if not users:
        print("No dummy users found.")
        return

    now = datetime.datetime.now(datetime.timezone.utc)
    
    for rid, info in DATA.items():
        print(f"Adding humanised comments to {info['slug']}...")
        count = random.randint(8, 12)
        authors = random.sample(users, count)
        comments_pool = random.sample(info["comments"], count)
        
        inserts = []
        for i in range(count):
            inserts.append({
                "context_type": "roadmap",
                "context_id": rid,
                "author_id": authors[i]["id"],
                "content": comments_pool[i],
                "created_at": (now - datetime.timedelta(days=random.randint(0, 4), hours=random.randint(0, 23))).isoformat()
            })
        
        sb.table("discussion_threads").insert(inserts).execute()
        time.sleep(1)

    print("Batch 3 (Humanised Redo) completed successfully.")

if __name__ == "__main__":
    seed_batch()
