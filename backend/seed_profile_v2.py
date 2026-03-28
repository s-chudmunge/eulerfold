import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

USER_UUID = "b083da08-835f-458a-9b53-1ee01e3036ba"
USERNAME = "sankalp"

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: Supabase credentials missing.")
    exit(1)

sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def cleanup():
    print(f"Cleaning up existing data for user {USER_UUID}...")
    # Get profile ID
    p_res = sb.table("profiles").select("id, email").eq("supabase_uid", USER_UUID).execute()
    if not p_res.data: return
    pid = p_res.data[0]["id"]
    email = p_res.data[0]["email"]

    # Delete roadmaps (cascades to submissions and progress)
    sb.table("roadmaps").delete().eq("user_id", pid).execute()
    # Delete user skills
    sb.table("user_skills").delete().eq("user_id", USER_UUID).execute()
    # Delete practice
    sb.table("practice_sessions").delete().eq("user_id", USER_UUID).execute()
    print("Cleanup complete.")
    return pid, email

def seed():
    pid, email = cleanup()
    now = datetime.now(timezone.utc)

    # 1. Roadmaps with specific metadata
    roadmaps = [
        {
            "title": "DSA and Coding", "depth": 91, "months_ago": 5,
            "modules": [
                {"title": "Advanced Data Structures", "sub": "Min-Heap Implementation in Python", "feedback": "Excellent handling of the heapify-up logic. The time complexity analysis for insertions was spot on."},
                {"title": "Dynamic Programming", "sub": "Optimal Substructure in Matrix Chain Multiplication", "feedback": "The memoization table was correctly implemented. Your explanation of the overlapping subproblems was very clear."},
                {"title": "Graph Theory", "sub": "Dijkstra's Shortest Path Algorithm", "feedback": "Clean implementation using a priority queue. Correct usage of adjacency lists for memory efficiency."},
                {"title": "Algorithm Analysis", "sub": "Recursive Big O Proofs", "feedback": "Strong mathematical grounding. The master theorem application was correctly identified for all cases."}
            ],
            "skills": ["Heap Data Structures", "Big O Analysis", "Dynamic Programming", "Graph Algorithms (BFS/DFS)"]
        },
        {
            "title": "Python Mastery", "depth": 78, "months_ago": 4,
            "modules": [
                {"title": "Pythonic Patterns", "sub": "List Comprehensions and Generators", "feedback": "Good use of generator expressions to handle large datasets. Very efficient memory usage."},
                {"title": "OOP in Python", "sub": "Class Inheritance and Mixins", "feedback": "The mixin pattern was applied correctly here. I liked how you handled multiple inheritance with super()."},
                {"title": "File I/O and Modules", "sub": "Context Managers for CSV Parsing", "feedback": "Solid usage of the 'with' statement. Error handling for missing headers was a nice touch."}
            ],
            "skills": ["Python Basics", "Object Oriented Programming", "File I/O and Modules"]
        },
        {
            "title": "System Design Fundamentals", "depth": 85, "months_ago": 2,
            "modules": [
                {"title": "Architecture Patterns", "sub": "Microservices Communication via gRPC", "feedback": "Great implementation of the Protocol Buffers. The service-to-service discovery logic was robust."},
                {"title": "Database Scaling", "sub": "Horizontal Sharding Strategy", "feedback": "The sharding key selection was logical. You correctly addressed the 'hot spot' problem in your design."},
                {"title": "API Design", "sub": "RESTful API with Rate Limiting", "feedback": "Clean endpoint structure. The token bucket algorithm implementation for the middleware was impressive."}
            ],
            "skills": ["System Design Patterns", "SQL Database Design", "REST API Design"]
        },
        {
            "title": "C Language and DSA", "depth": 72, "months_ago": 1,
            "modules": [
                {"title": "Memory Management", "sub": "Dynamic Memory Allocation in C", "feedback": "Good use of malloc/free. The pointer arithmetic for the custom array resize was bug-free."},
                {"title": "Low Level DSA", "sub": "Doubly Linked List Implementation", "feedback": "Pointer management for the prev/next nodes was solid. No memory leaks detected in Valgrind."},
                {"title": "Process Control", "sub": "Fork and Exec System Calls", "feedback": "Developing. The waitpid() logic was correct, but you missed some edge cases for zombie processes."},
                {"title": "File Descriptors", "sub": "Custom Shell Implementation", "feedback": "Excellent handling of standard input/output redirection. The parser handles quoted arguments well."}
            ],
            "skills": ["Pointer Arithmetic", "Memory Management"]
        },
        {
            "title": "Aptitude and Reasoning", "depth": 65, "months_ago": 0,
            "modules": [
                {"title": "Logical Reasoning", "sub": "Syllogisms and Venn Diagrams", "feedback": "Precise identification of invalid arguments. The logical flow in your proofs was very clear."},
                {"title": "Quantitative Aptitude", "sub": "Probability and Combinatorics", "feedback": "Developing. You handled the permutations well, but need more practice on independent event probability."}
            ],
            "skills": ["Logical Reasoning", "Quantitative Aptitude"]
        }
    ]

    # Fetch canonical skills
    cs_res = sb.table("canonical_skills").select("id, name").execute()
    skill_map = {s["name"]: s["id"] for s in cs_res.data}
    
    skill_to_rds = {}

    for rd in roadmaps:
        # Insert Roadmap
        r_plan = []
        for m in rd["modules"]:
            r_plan.append({
                "title": m["title"],
                "topics": [{"title": f"Topic {i}", "uuid": str(str(uuid.uuid4()))} for i in range(3)],
                "proof_of_work_instructions": {"what_to_build": m["sub"]}
            })
        
        rid = sb.table("roadmaps").insert({
            "user_id": pid, "email": email, "title": rd["title"], "description": f"Proven skills in {rd['title']}",
            "roadmap_plan": {"modules": r_plan}, "depth_score": rd["depth"], "skills_extracted": True
        }).execute().data[0]["id"]

        for sname in rd["skills"]:
            if sname not in skill_to_rds: skill_to_rds[sname] = []
            skill_to_rds[sname].append(rid)

        # Insert Submissions & Progress
        for m_idx, m in enumerate(rd["modules"]):
            m_num = m_idx + 1
            # Random date in last 90 days
            sub_date = now - timedelta(days=random.randint(1, 90))
            eval_lv = "Developing" if "Developing" in m["feedback"] else "Solid"
            
            sb.table("submissions").insert({
                "roadmap_id": rid, "module_number": m_num, "user_email": email,
                "link": f"https://github.com/eulerfold-verified/{rd['title'].lower().replace(' ', '-')}-repo",
                "description": m["sub"], "evaluation": m["feedback"], "evaluation_level": eval_lv,
                "submitted_at": sub_date.isoformat()
            }).execute()

            for t_idx in range(3):
                sb.table("module_progress").insert({
                    "roadmap_id": rid, "user_email": email, "module_number": m_num,
                    "topic_index": t_idx, "completed": True, "completed_at": sub_date.isoformat()
                }).execute()

            # Practice
            sess = sb.table("practice_sessions").insert({
                "user_id": USER_UUID, "roadmap_id": rid, "subtopic_id": str(uuid.uuid4()), "resources": []
            }).execute().data[0]
            for _ in range(5):
                sb.table("practice_progress").insert({
                    "user_id": USER_UUID, "session_id": sess["id"], "resource_id": str(uuid.uuid4()),
                    "completed": True, "updated_at": sub_date.isoformat()
                }).execute()

    # Final User Skills with correct thresholds
    for sname, rids in skill_to_rds.items():
        if sname not in skill_map: continue
        
        # Calculate realistic score
        score = random.uniform(68, 96)
        if "Developing" in sname or "Arithmetic" in sname or "Aptitude" in sname:
            score = random.uniform(72, 79)
        
        score = round(score, 1)
        tier = "strong" if score >= 80 else "developing"
        
        sb.table("user_skills").insert({
            "user_id": USER_UUID, "canonical_skill_id": skill_map[sname],
            "confidence_score": score, "tier": tier, "pow_score": score, "practice_score": score,
            "topic_completion": 100, "depth_score": 80, "time_invested": random.randint(15, 50),
            "contributing_roadmap_ids": rids, "last_updated": now.isoformat()
        }).execute()

    print("Seeding V2 complete.")

if __name__ == "__main__":
    seed()
