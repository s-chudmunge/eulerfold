import asyncio
import os
import sys

sys.path.append("/home/sankalp/Documents/projects/eulerfold/backend")
from dotenv import load_dotenv
load_dotenv("/home/sankalp/Documents/projects/eulerfold/backend/.env")

from app.core.supabase_client import get_supabase_client

async def main():
    sb = get_supabase_client()
    res = sb.table("roadmaps").select("roadmap_plan").eq("id", 1371).execute()
    if not res.data:
        print("Roadmap not found.")
        return
        
    roadmap_plan = res.data[0]["roadmap_plan"]
    
    # Hand-picked, ultra-high-quality resources for Raft
    resources_map = {
        0: [
            {"title": "The Raft Consensus Algorithm (Official Hub)", "url": "https://raft.github.io/", "type": "article"},
            {"title": "In Search of an Understandable Consensus Algorithm (Original Paper PDF)", "url": "https://raft.github.io/raft.pdf", "type": "article"}
        ],
        1: [
            {"title": "The Secret Lives of Data: Raft Interactive Visualization", "url": "https://thesecretlivesofdata.com/raft/", "type": "article"},
            {"title": "Paxos vs Raft (ScyllaDB)", "url": "https://www.scylladb.com/glossary/paxos/", "type": "article"}
        ],
        2: [
            {"title": "Etcd's Raft Implementation (GitHub)", "url": "https://github.com/etcd-io/etcd/tree/main/raft", "type": "article"},
            {"title": "Patterns of Distributed Systems: State Watch", "url": "https://martinfowler.com/articles/patterns-of-distributed-systems/", "type": "article"}
        ],
        3: [
            {"title": "Jepsen: Distributed Systems Safety Analyses", "url": "https://jepsen.io/analyses", "type": "article"},
            {"title": "Handling Split-Brain Scenarios", "url": "https://en.wikipedia.org/wiki/Split-brain_(computing)", "type": "article"}
        ]
    }
    
    for i, module in enumerate(roadmap_plan.get("modules", [])):
        if i in resources_map:
            module["resources"] = resources_map[i]
            
    # Optional: We can also revert the video logic if desired, but we will leave them as is for now 
    # to focus purely on fixing the resources issue.
            
    sb.table("roadmaps").update({"roadmap_plan": roadmap_plan}).eq("id", 1371).execute()
    print("Successfully added high-quality hand-picked resources to all modules!")

if __name__ == "__main__":
    asyncio.run(main())
