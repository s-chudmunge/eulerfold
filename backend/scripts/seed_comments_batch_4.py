import os
import random
import datetime
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# --- Batch 4: 5 Roadmaps, 8-12 Humanised Comments Each ---

DATA = {
    "92": { # Unity Game Dev
        "slug": "unity-game-development-roadmap",
        "comments": [
            "wait, the physics module actually fixed my character falling through the floor lol. tysm!!",
            "unity's UI system is usually a nightmare but the way this breaks it down is actually readable.",
            "anyone else stuck on the coroutines part in week 2? my timer just keeps resetting -_-",
            "finally found a guide that doesn't just say 'copy this code'. actually explains the scripting logic.",
            "the shader graph part is so satisfying. my water looks like real water now, not blue jelly.",
            "ngl i almost gave up on C# but this roadmap made it click. just finished the inventory project!",
            "is it just me or is the navmesh agent a bit weird on slopes? any tips for that part?",
            "legit best unity roadmap i've seen in a while. the pacing is perfect for a 4-week grind.",
            "yo the animation controller setup saved my life. was about to lose it with the transition states.",
            "just deployed my first build to itch.io thanks to week 4! hyped.",
            "quick question—does this cover the new input system or the old one? trying to keep things modern.",
            "pro tip: dont skip the memory management part in module 3 if you're targeting mobile. trust me."
        ]
    },
    "99": { # Finance & Trading
        "slug": "finance-for-investing-and-trading-a-2-week-roadmap",
        "comments": [
            "the risk management module is a reality check lol. i was definitely over-leveraged before this.",
            "finally understood what 'the greeks' actually mean in options. delta vs theta is making sense now.",
            "bro the technical analysis section is fire. spotted my first head and shoulders pattern today.",
            "tbh i wish i found this before i started 'investing' last year. would've saved me a lot of money.",
            "fundamental analysis feels like a lot of reading but week 1 breaks it down into simple steps.",
            "anyone using specific apis to track the metrics mentioned in week 2? tryna automate this.",
            "the psychology of trading section is lowkey the most important part. mind games are real.",
            "just finished the 2-week grind. feeling way more confident about the next market open.",
            "is it better to start with etfs or go straight into individual stocks like in the roadmap?",
            "the breakdown of order flow is actually insane. never looked at the depth chart like this before.",
            "simple, logical, and doesn't promise 'get rich quick' bs. appreciate the honesty here.",
            "wait, so i should focus on sharpe ratio more than just raw returns? that actually makes a lot of sense."
        ]
    },
    "95": { # YouTube Growth
        "slug": "youtube-channel-growth-roadmap",
        "comments": [
            "the click-through rate (CTR) section changed how i write my titles. getting way more impressions now.",
            "anyone else struggling with the retention graph? my viewers keep dropping off at the 30s mark.",
            "the thumbnail module is goated. using the contrast tips and my numbers are actually moving up.",
            "ngl i thought the algorithm was just luck until i saw the metadata breakdown in week 1.",
            "finally a youtube guide that isn't just 'make good content'. the technical SEO part is huge.",
            "anyone found a good free tool for the keyword research module? tryna stay budget friendly lol.",
            "the 'hook' templates in week 2 are a lifesaver. my intro's were definitely too long before.",
            "just hit 100 subs thanks to the consistency plan here! small wins but we're moving.",
            "wait, so shorts actually help long-form growth? i always thought it was the opposite.",
            "the niche selection part in module 1 was a bit of a reality check. had to pivot my whole idea.",
            "best 2-week plan ever. feeling much more professional about my channel setup now.",
            "does this roadmap cover sponsor outreach for smaller channels? or just the growth phase?"
        ]
    },
    "82": { # AWS for Developers
        "slug": "aws-for-developers-a-hands-on-4-week-roadmap",
        "comments": [
            "iam policies used to make my head spin but the module 1 breakdown is actually clear.",
            "finally got my lambda function talking to rds without timing out. that vpc setup is tricky!!",
            "the s3 bucket policy section saved me from a massive security headache. tysm.",
            "is it just me or is the aws console a bit overwhelming? the cli tips in week 2 are much better.",
            "yo the serverless architecture in week 3 is actually fire. so much cheaper than running ec2.",
            "anyone else get a surprise bill? definitely use the billing alerts like they say in the first module lol.",
            "aws cdk vs terraform—glad this roadmap focuses on the dev-friendly side of things.",
            "the cognito auth setup was a bit of a grind but it works perfectly now. great instructions.",
            "just deployed my first full-stack app on aws! feel like a real dev now lol.",
            "wait, so i don't need a dedicated server for a simple react app? s3 + cloudfront is a game changer.",
            "the monitoring module with cloudwatch is very thorough. finally know why my app was crashing.",
            "does this cover multi-region deployment for latency or just single region for now?"
        ]
    },
    "74": { # Prompt Engineering Mastery
        "slug": "prompt-engineering-mastery",
        "comments": [
            "chain-of-thought prompting is legit magic. my bot actually gives logical answers now lol.",
            "few-shot vs zero-shot—the comparison in week 1 is so practical. use cases are spot on.",
            "finally found a way to stop the model from hallucinating so much. the 'grounding' tips are key.",
            "prompt injection is scary ngl. glad there's a whole section on security in week 3.",
            "anyone else using the 'persona' pattern? it's actually insane how much the tone changes.",
            "the 'meta-prompting' module is mind blowing. writing prompts to write prompts lol.",
            "just finished the 4-week grind. my ai workflows are 10x faster now, not even kidding.",
            "wait, so adding 'think step-by-step' actually works? thought that was a myth until i tried it.",
            "the structured output part (json/markdown) is a lifesaver for my backend integration.",
            "best prompt engineering guide out there. focused on the logic, not just 'copy this prompt' lists.",
            "how do you handle long-context windows without the model losing its mind by the end?",
            "the 'system prompt' vs 'user prompt' distinction was a bit of an eye-opener for me."
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
                "created_at": (now - datetime.timedelta(days=random.randint(0, 3), hours=random.randint(0, 23))).isoformat()
            })
        
        sb.table("discussion_threads").insert(inserts).execute()
        time.sleep(1)

    print("Batch 4 (Humanised) completed successfully.")

if __name__ == "__main__":
    seed_batch()
