import os
import random
import datetime
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

DATA = {
    "60": { # CS Fundamentals & System Design
        "slug": "cs-fundamentals-and-system-design-for-swe-interviews",
        "comments": [
            "bro finally someone explained CAP theorem without making my brain melt. week 3 is a lifesaver for interviews ngl.",
            "consistent hashing is actually so cool when you see how it handles node failures. best part of module 2.",
            "the big O section for recursion is a bit scary at first but the examples helped a lot. thanks!!",
            "anyone got tips for the system design project in week 4? tryna decide between an ad-tracker or a chat app.",
            "ngl i thought i knew data structures until i tried implementing a min-heap from scratch today lol.",
            "wait, so vertical scaling is basically just 'buy a bigger computer'? that's a funny way to put it but it works.",
            "the mock interviews in week 4 are legit. did one with a friend and i actually felt like a real engineer.",
            "tysm for the garbage collection breakdown. finally understand why java's memory can be such a pain.",
            "is it just me or is binary search actually hard to write without bugs the first time? -_-",
            "pacing is great. feeling way more confident about my next tech screen now.",
            "pro tip: dont skip the networking module if you're aiming for big tech. they love that stuff.",
            "holy crap, the bloom filter explanation in week 3 is genius. never knew it worked like that."
        ]
    },
    "65": { # FastAPI & AI Integration
        "slug": "fastapi-and-ai-integration-building-production-ready-agentic-systems",
        "comments": [
            "pydantic v2 is actually goated. saved me so much time trying to parse messy llm outputs lol.",
            "langgraph is pretty complex but week 3 breaks it down perfectly. my agents actually have a brain now.",
            "wait, how do i stop my lambda from timing out with these long ai responses? anyone else hitting this?",
            "the sse streaming setup for the chat is so smooth. feels like a real product now, not just a script.",
            "dependency injection in fastapi is weird at first but so useful for swapping out models. thanks!",
            "ngl the agentic workflows module is mind blowing. moving beyond simple rag is definitely the way.",
            "best way to store embeddings on a budget? tryna use pgvector instead of pinecone for now.",
            "the deployment section is solid. got my first agent running on aws today. hyped!",
            "finally understood how to use 'tools' with openai's functions. module 2 is a must-read.",
            "pacing is intense but worth it. feeling like i'm actually building the future here lol.",
            "anyone else getting weird hallucinations with the prompt templates in week 2?",
            "structured outputs = no more regex nightmares. best part of the whole roadmap tbh."
        ]
    },
    "75": { # DevOps & CI/CD
        "slug": "devops-ci-cd-learning-roadmap",
        "comments": [
            "github actions reusable workflows are a life-saver. my yaml files are actually readable now lol.",
            "k8s ingress setup had me crying for a bit but the week 3 guide actually worked. tysm!!",
            "terraform state files are scary ngl. definitely follow the remote state advice in module 1.",
            "is it just me or is docker multi-stage building legit magic? my image size dropped by half.",
            "monitoring with prometheus/grafana—finally a guide that shows you how to actually use the data.",
            "security in ci/cd section is a reality check. found 3 vulnerabilities in my base image today -_-",
            "blue/green vs canary—loved the comparison. definitely going canary for my next project.",
            "wait, so helm is basically just a package manager for k8s? that makes so much more sense now.",
            "best devops roadmap i've found. focused on the tools people actually use at work.",
            "just deployed my first cluster! feel like a sysadmin wizard lol.",
            "does this cover terraform cloud or should i stick to local for the exercises?",
            "pro tip: use the billing alerts like they say in week 1. aws will eat your wallet otherwise."
        ]
    },
    "76": { # LLM Fine-Tuning
        "slug": "llm-fine-tuning-from-scratch",
        "comments": [
            "lora math is insane but the rank-reduction breakdown actually made it click for me. finally!",
            "using sfttrainer is so much better than writing raw pytorch loops. tysm for the hugginface tips.",
            "anyone else running out of vram on colab? week 2 is a struggle for my poor gpu lol.",
            "garbage in = garbage out. the dataset curation module is definitely the most important part.",
            "perplexity is cool but checking the model on actual logic tests is way more satisfying.",
            "how do i stop my model from forgetting its general knowledge? hitting that catastrophic forgetting hard.",
            "peft is a game changer for compute costs. fine-tuned my first 7b model for like 2 bucks.",
            "is it worth fine-tuning for code or just sticking to general purpose models for now?",
            "vllm for inference is stupid fast. glad this was included in the deployment section.",
            "dpo vs ppo—the alignment module in week 4 is very high-level. love the depth here.",
            "finally understood tokenization at a deep level. no more weird encoding errors!",
            "best part was the 'evaluation' section. actually knowing if your model is better or just lucky."
        ]
    },
    "91": { # SQL Mastery & Database Design
        "slug": "sql-mastery-database-design-roadmap",
        "comments": [
            "normalization usually bores me but the 3nf breakdown was actually practical. fixed my messy schema!",
            "explain analyze is my new best friend lol. found a missing index that was killing my performance.",
            "anyone got tips for window functions on big tables? my queries are still a bit slow in module 3.",
            "acid properties explained without the dry academic fluff. much appreciated.",
            "denormalization is sometimes okay? week 2's tradeoff analysis was an eye-opener tbh.",
            "jsonb in postgres is a lifesaver for my semi-structured data. thanks for including that!",
            "finally understand the difference between b-tree and hash indexes. module 2 is goated.",
            "how do i do schema migrations without locking the whole production database? anyone else scared of this?",
            "complex joins had me spinning but the exercises in week 3 really helped it sink in.",
            "recursive ctes are actually kind of fun? never thought i'd say that about sql lol.",
            "just finished the 3-week grind. feeling like a real database architect now.",
            "pro tip: dont ignore foreign keys. future you will thank you when your data isnt a mess."
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

    print("Batch 1 (Humanised Redo) completed successfully.")

if __name__ == "__main__":
    seed_batch()
