import asyncio
import os
import json
import requests
import time
from dotenv import load_dotenv
load_dotenv()

import sys
sys.path.append(os.getcwd())

from app.routers.roadmaps import update_learning_progress
from app.routers.submissions import create_submission, request_re_evaluation
from app.routers.profiles import get_public_profile
from app.schemas import ProgressUpdate, User
from app.core.supabase_client import get_supabase_client
from fastapi import BackgroundTasks

# --- HELPERS ---
def bold(text): return f"\033[1m{text}\033[0m"
def green(text): return f"\033[92m{text}\033[0m"
def yellow(text): return f"\033[93m{text}\033[0m"
def cyan(text): return f"\033[96m{text}\033[0m"

async def flush_tasks(bg_tasks):
    for task in bg_tasks.tasks:
        if asyncio.iscoroutinefunction(task.func):
            await task.func(*task.args, **task.kwargs)
        else:
            task.func(*task.args, **task.kwargs)

# --- MAIN INTERACTIVE TEST ---
async def interactive_test():
    print(bold("\n🐢 EULERFOLD INTERACTIVE LIFECYCLE TESTER"))
    print("-" * 40)

    # 0. USER SETUP
    email = input(cyan("Enter User Email [jukeask@gmail.com]: ")) or "jukeask@gmail.com"
    uid = input(cyan("Enter User UID [b083da08-835f-458a-9b53-1ee01e3036ba]: ")) or "b083da08-835f-458a-9b53-1ee01e3036ba"
    username = input(cyan("Enter Username [sankalp]: ")) or "sankalp"
    
    current_user = User(
        id=100, email=email, username=username, supabase_uid=uid,
        is_active=True, profile_completed=True, onboarding_completed=True
    )

    # 1. ROADMAP GENERATION
    print(bold("\nStep 1: Roadmap Generation"))
    subject = input("  Subject: ")
    goal = input("  Specific Goal: ")
    duration = input("  Duration (e.g., 4 weeks): ")
    
    gen_payload = {
        "subject": subject,
        "goal": goal,
        "time_value": int(duration.split()[0]),
        "time_unit": duration.split()[1] if len(duration.split()) > 1 else "weeks",
        "email": email,
        "model": "models/gemini-2.5-flash"
    }

    print(yellow("\n⏳ Generating Roadmap via AI (this takes ~60-90s)..."))
    res = requests.post("http://127.0.0.1:8001/roadmaps/generate", json=gen_payload, timeout=180)
    
    if res.status_code != 200:
        print(f"❌ Failed: {res.text}")
        return
    
    roadmap = res.json()
    roadmap_id = roadmap["id"]
    print(green(f"✅ Roadmap Created! ID: {roadmap_id} | Title: {roadmap['title']}"))

    # Fetch fresh plan from DB
    sb = get_supabase_client()
    r_data = sb.table("roadmaps").select("roadmap_plan").eq("id", roadmap_id).single().execute()
    plan = r_data.data.get("roadmap_plan")
    if isinstance(plan, str): plan = json.loads(plan)
    modules = plan.get("modules", [])

    # 2. MODULE LOOP
    for m_idx, module in enumerate(modules):
        mod_num = m_idx + 1
        print(bold(f"\n📂 MODULE {mod_num}: {module.get('title')}"))
        
        # A. Completion
        topics = module.get("topics", [])
        print(f"  Topics: {', '.join([t.get('title') if isinstance(t, dict) else t for t in topics])}")
        input(yellow(f"  [Press Enter to mark all {len(topics)} topics as COMPLETE] "))
        
        for t_idx in range(len(topics)):
            await update_learning_progress(
                roadmap_id=roadmap_id,
                payload=ProgressUpdate(module_number=mod_num, topic_index=t_idx, completed=True),
                current_user=current_user
            )
        print(green("  ✅ System signals updated: Topics complete."))

        # B. Submission
        print(bold(f"\n  📝 SUBMISSION FOR MODULE {mod_num}"))
        link = input(cyan("  Enter Proof Link: "))
        print("  Enter Description (min 300 chars):")
        description = input("  > ")
        
        # Ensure description length for test convenience
        if len(description) < 300:
            print(yellow("  ⚠️ Description too short. Adding padding for test purposes..."))
            description = description.ljust(305, ".")

        bg_tasks = BackgroundTasks()
        print(yellow("\n  ⏳ AI Lead Auditor is reviewing your work..."))
        
        res_sub = await create_submission(bg_tasks, {
            "roadmap_id": roadmap_id,
            "module_number": mod_num,
            "link": link,
            "description": description,
            "files": []
        }, current_user)
        
        eval_data = res_sub["evaluation"]
        level = eval_data["evaluation_level"]
        sub_id = res_sub["submission"]["id"]
        
        if level == "Beginner":
            print(f"  ❌ {bold('REJECTED')} ({level})")
            print(f"  💬 Feedback: {eval_data['evaluation']}")
            
            do_dispute = input(cyan("\n  Would you like to DISPUTE this result? (y/n): "))
            if do_dispute.lower() == 'y':
                context = input("  Enter dispute reasoning for Senior Auditor: ")
                print(yellow("  ⏳ Senior Auditor is re-evaluating..."))
                
                res_dispute = await request_re_evaluation(bg_tasks, sub_id, {"dispute_context": context}, current_user)
                level = res_dispute["evaluation"]["evaluation_level"]
                print(green(f"  ✅ New Audit Result: {level}"))
        else:
            print(green(f"  ✅ {bold('PASSED')} ({level})"))
            print(f"  💬 Feedback: {eval_data['evaluation'][:200]}...")

        # C. Flush Skills
        print(yellow("\n  📈 Syncing technical identity background tasks..."))
        await flush_tasks(bg_tasks)
        print(green("  ✅ Scores and mappings updated."))

        cont = input(cyan("\nContinue to next module? (y/n): "))
        if cont.lower() != 'y': break

    # 3. FINAL PROFILE CHECK
    print(bold("\nStep 3: Final Identity Verification"))
    input(yellow("  [Press Enter to fetch your updated Public Profile] "))
    
    profile = await get_public_profile(username)
    print(f"\n👤 PUBLIC PROFILE: @{profile.username}")
    print(f"🗺️ Total Units: {profile.total_roadmaps}")
    print(f"🏗️ Verification Logs: {len(profile.submissions)}")
    
    if profile.skills:
        print("\n" + bold("🏆 UPDATED TECHNICAL INVENTORY:"))
        for s in profile.skills:
            print(f"  • {s.name}: {bold(s.confidence_score)}% (Grade: {s.tier})")
            print(f"    [P: {s.pow_score*40:.1f} | R: {s.practice_score*30:.1f} | C: {s.topic_completion*15:.1f} | D: {s.depth_score*15:.1f}]")
    
    print(bold("\n🏁 TEST COMPLETE. See your dashboard for the visual Technical Signature!"))

if __name__ == "__main__":
    asyncio.run(interactive_test())
