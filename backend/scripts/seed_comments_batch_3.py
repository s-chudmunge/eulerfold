import os
import random
import datetime
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# --- Batch 3: 5 Roadmaps, 8-12 Unique Comments Each ---

DATA = {
    "106": { # High Scale Distributed Systems
        "slug": "high-scale-distributed-systems-architecting-for-1m-rps",
        "comments": [
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
        ]
    },
    "114": { # Data Engineering Fundamentals
        "slug": "data-engineering-fundamentals",
        "comments": [
            "The distinction between ETL and ELT was explained perfectly. Snowflake vs Spark use-cases are clear.",
            "I'm finally getting the hang of Airflow DAGs. The section on 'backfilling' was a life-saver.",
            "How do you handle schema evolution in a data lake using Delta Lake or Iceberg?",
            "The 'Data Modeling' module in Week 2 (Star vs Snowflake schema) is foundational. Great breakdown.",
            "Are there any specific tips for optimizing Spark jobs for memory efficiency?",
            "I love the focus on 'Data Quality' and testing. Great to see dbt mentioned here.",
            "What's the best way to handle 'Late Arriving Dimensions' in a real-time pipeline?",
            "The transition from batch to stream processing with Flink/Kafka is very well-paced.",
            "Does the roadmap cover 'Data Governance' and cataloging tools like Amundsen or DataHub?",
            "The projects in Week 4 are excellent. Building a complete end-to-end pipeline was very rewarding.",
            "I finally understand why partitioned tables are so much faster for analytical queries.",
            "The focus on 'Cloud Data Warehousing' is very relevant. BigQuery vs Redshift analysis was great."
        ]
    },
    "109": { # Bioinformatics
        "slug": "bioinformatics-learning-roadmap-from-sequences-to-structures",
        "comments": [
            "Bioinformatics is such a huge field. Focusing on sequences to structures is a great entry point.",
            "The use of Python for genomic analysis is exactly what I was looking for. Very practical.",
            "How do you handle large-scale sequence alignment (BLAST/Smith-Waterman) in the Week 3 practicals?",
            "The protein folding section (post-AlphaFold) is a great look into the future of the field.",
            "I appreciate the inclusion of R for statistical biology alongside Python.",
            "The 'Sequence Alignment' visualization helped me understand the dynamic programming involved.",
            "Is there a section on CRISPR data analysis in the advanced bioinformatics modules?",
            "The structural biology part using PyMOL is a blast. Visualizing the PDB files is so cool.",
            "How do you handle the high-dimensionality of genomics data in the models described?",
            "The 'Phylogenetic Trees' module was quite tough but the evolution logic is fascinating.",
            "Really clean focus on biological data structures. FASTA/FASTQ parsing is a must-know.",
            "Interdisciplinary approach at its best. Bridging biology and CS is the way forward."
        ]
    },
    "108": { # Computational Neuroscience
        "slug": "computational-neuroscience-bridging-biology-and-ai",
        "comments": [
            "Computational neuroscience is a fascinating bridge. The neuronal dynamics module is very clear.",
            "The neural networks in neuroscience section—the Hodgkin-Huxley model explanation is spot on.",
            "I appreciate the 'Why this matters' section linking biological neurons to AI's artificial ones.",
            "The carbon cycle modeling module is quite intensive. I love the math involved.",
            "How do you simulate large-scale brain networks using tools like NEST or Brian2?",
            "The 'Information Encoding' module (Rate vs Temporal coding) was an eye-opener.",
            "Is there a section on 'Synaptic Plasticity' (Hebbian learning) in the later weeks?",
            "The focus on modeling individual neurons before moving to networks is very logical.",
            "I love the integration of dynamical systems theory into the neuroscience modules.",
            "How do you validate these biological models against real electrophysiology data?",
            "The 'Neural Decoding' section is brilliant. Predicting behavior from spikes feels like the future.",
            "Solid advice on using Python for simulation. The Jupyter notebooks are a great resource."
        ]
    },
    "72": { # Open Source Contribution
        "slug": "open-source-contribution-roadmap-from-zero-to-recognized-contributor",
        "comments": [
            "I love the emphasis on building a personal brand while contributing to open source.",
            "My first PR was just merged! The 'Finding Your First Issue' section in Week 2 was perfect.",
            "How do you approach a large, complex codebase for the first time without getting overwhelmed?",
            "The section on 'Open Source Etiquette' is so important. Communication is key to getting merged.",
            "I finally understand the difference between 'Forking' and 'Branching' for contributions.",
            "Are there any specific programs like GSoC or Outreachy mentioned in the 'Career' section?",
            "The focus on 'Documentation Contributions' as a way to start is very pragmatic.",
            "I appreciate the breakdown of different license types (MIT, GPL, Apache). Very necessary.",
            "How do you balance open source work with a full-time job as discussed in Week 5?",
            "The 'Building a Personal Brand' module helped me polish my GitHub profile significantly.",
            "Really solid advice on writing clean commit messages. It makes the maintainer's life so much easier.",
            "Looking forward to becoming a 'Maintainer' one day. This roadmap sets the path clearly."
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
        print(f"Adding comments to {info['slug']}...")
        
        # Pick a random count between 8 and 12 for variety
        count = random.randint(8, 12)
        # Select unique authors and unique comments for this roadmap
        authors = random.sample(users, count)
        comments_pool = random.sample(info["comments"], count)
        
        inserts = []
        for i in range(count):
            inserts.append({
                "context_type": "roadmap",
                "context_id": rid,
                "author_id": authors[i]["id"],
                "content": comments_pool[i],
                "created_at": (now - datetime.timedelta(days=random.randint(0, 5), hours=random.randint(0, 23))).isoformat()
            })
        
        sb.table("discussion_threads").insert(inserts).execute()
        time.sleep(1)

    print("Batch 3 completed successfully.")

if __name__ == "__main__":
    seed_batch()
