import os
import random
import datetime
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# --- Batch 1: 5 Roadmaps, 10 Unique Comments Each ---

DATA = {
    "60": { # CS Fundamentals & System Design
        "slug": "cs-fundamentals-and-system-design-for-swe-interviews",
        "comments": [
            "The explanation of the CAP theorem in Week 3 is the best I've seen. Really helps for design rounds.",
            "I finally understand why we use consistent hashing for load balancers. Great visual breakdown.",
            "The section on Big O analysis for recursive functions helped me solve a tricky LeetCode Hard today.",
            "Are there any specific case studies you recommend for the 'Distributed Systems' module?",
            "I love that this roadmap doesn't just teach the syntax, but the 'why' behind system architecture.",
            "Does the 'Memory Management' section cover garbage collection in Java vs Go?",
            "The distinction between horizontal and vertical scaling was explained very clearly in Module 2.",
            "I'm using the mock interview templates from Week 4 with a friend. They are very realistic.",
            "Really solid focus on data structures. The heap implementation part was quite challenging but rewarding.",
            "Does this roadmap cover rate-limiting algorithms like Token Bucket or Leaky Bucket?"
        ]
    },
    "65": { # FastAPI & AI Integration
        "slug": "fastapi-and-ai-integration-building-production-ready-agentic-systems",
        "comments": [
            "Using Pydantic v2 for data validation makes the AI response parsing so much more robust.",
            "The integration with LangGraph for agentic state management is a masterclass in modern backend design.",
            "How do you handle asynchronous background tasks when the AI model takes 30+ seconds to respond?",
            "The section on streaming responses (SSE) for the chat interface is exactly what I was looking for.",
            "I appreciate the focus on Dependency Injection in FastAPI. It makes testing AI services much easier.",
            "Are there any examples of using Redis for caching the embeddings in this roadmap?",
            "The 'Agentic Workflows' module in Week 3 is a game-changer. Moving beyond simple RAG is the goal.",
            "How do you secure the API endpoints when exposing them to external LLM providers?",
            "The deployment section using Docker and AWS App Runner is very practical for production setups.",
            "I love the focus on structured outputs. No more regex-ing LLM responses!"
        ]
    },
    "75": { # DevOps & CI/CD
        "slug": "devops-ci-cd-learning-roadmap",
        "comments": [
            "The GitHub Actions workflow examples are very clean. Reusable workflows are a life-saver.",
            "I've been struggling with Kubernetes ingress, but the Module 3 breakdown cleared it up.",
            "Infrastructure as Code (IaC) with Terraform—glad it's introduced early in the roadmap.",
            "How do you handle state files in Terraform when working in a team environment?",
            "The Docker multi-stage build tips reduced my image size by almost 60%. Incredible.",
            "Are there any specific monitoring tools you recommend alongside Prometheus and Grafana?",
            "The 'Security in CI/CD' section is very relevant. Scanned my first image for vulnerabilities today.",
            "I like the emphasis on 'Zero Downtime Deployments'. Blue/Green vs Canary was well explained.",
            "Does the roadmap cover GitOps patterns with tools like ArgoCD or Flux?",
            "The Helm chart creation module was quite advanced but very necessary for scaling."
        ]
    },
    "76": { # LLM Fine-Tuning
        "slug": "llm-fine-tuning-from-scratch",
        "comments": [
            "LoRA and QLoRA are explained with great mathematical intuition. Finally get the rank-reduction part.",
            "I'm using the Hugging Face 'trl' library as suggested. The SFTTrainer is so much simpler.",
            "What's the minimum VRAM required to follow the Week 2 exercises on a local machine?",
            "The dataset curation module is the most important part. Garbage in, garbage out is too true.",
            "I appreciate the focus on evaluation metrics beyond just perplexity—MMLU and HumanEval are key.",
            "How do you handle catastrophic forgetting when fine-tuning on a very specific domain?",
            "The PEFT techniques described here saved me so much on compute costs. Thanks!",
            "Are there any tips for fine-tuning multi-modal models in the advanced section?",
            "The deployment part using vLLM for high-throughput inference is a great practical addition.",
            "I love the section on 'Alignment'—DPO seems much more stable than PPO for my use case."
        ]
    },
    "91": { # SQL Mastery & Database Design
        "slug": "sql-mastery-database-design-roadmap",
        "comments": [
            "The 3rd Normal Form (3NF) breakdown was perfect. I finally understand when to normalize vs denormalize.",
            "I've been using EXPLAIN ANALYZE to debug my slow queries as suggested. Found the missing index!",
            "Are there any specific tips for optimizing Window Functions on very large datasets?",
            "The section on ACID properties was very thorough. Great for understanding transaction isolation.",
            "I love the focus on relational design before even writing a single line of SQL.",
            "Does the roadmap cover PostgreSQL-specific features like JSONB for semi-structured data?",
            "The 'Index Types' module in Week 2 is a must-read. B-Tree vs Hash indexes explained clearly.",
            "How do you handle schema migrations in production without locking the entire table?",
            "The complex joins and subqueries in Module 3 were tough, but the exercises helped a lot.",
            "Recursive CTEs were always a mystery to me until I saw the hierarchy example here."
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
        authors = random.sample(users, 10) # 10 unique users for 10 unique comments
        
        inserts = []
        for i, comment in enumerate(info["comments"]):
            inserts.append({
                "context_type": "roadmap",
                "context_id": rid,
                "author_id": authors[i]["id"],
                "content": comment,
                "created_at": (now - datetime.timedelta(days=random.randint(0, 5), hours=random.randint(0, 23))).isoformat()
            })
        
        sb.table("discussion_threads").insert(inserts).execute()
        time.sleep(1) # Small delay between roadmaps

    print("Batch 1 completed successfully.")

if __name__ == "__main__":
    seed_batch()
