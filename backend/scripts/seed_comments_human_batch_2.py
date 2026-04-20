import os
import random
import datetime
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

DATA = {
    "81": { # Machine Learning from Scratch
        "slug": "machine-learning-from-scratch",
        "comments": [
            "wait, i actually just derived gradient descent on paper. feel like a math god lol.",
            "bias-variance tradeoff is a real mind bender. module 2 finally made it clear though.",
            "linear algebra for ml module is legit. dont skip it if you want to actually understand the code.",
            "is l1 or l2 better for sparse datasets? anyone tried both on the week 2 projects?",
            "backprop derivation had me crying for a bit but it's actually so logical when you use the chain rule.",
            "just finished the classification module. iris is a classic but i used some house price data too.",
            "seeing the k-means centroids move in the visualization was so satisfying. great job on that!!",
            "ngl the kernel svm section is pretty math-heavy. definitely needed a coffee for that one.",
            "precision-recall > accuracy. such a simple concept but so important. thanks for the heads up.",
            "hyped for the neural networks module! tryna build my first perceptron today.",
            "pro tip: visualize your cost function. it helps so much with debugging your learning rate.",
            "finally understood what 'regularization' actually does to the weights. no more overfitting!!"
        ]
    },
    "73": { # Web3 & Blockchain
        "slug": "web3-blockchain-developer-roadmap",
        "comments": [
            "yo i just deployed my first smart contract on sepolia!! solidity is actually kind of fun lol.",
            "gas optimization section is a must-read. my first test deployment cost way too much -_-",
            "security audits are scary. any free tools to check for basic vulnerabilities in my code?",
            "evm internals breakdown was an eye-opener. understanding the stack makes debugging way easier.",
            "ethers.js vs viem—which one are you guys using for the week 3 projects?",
            "defi protocols module is fascinating. liquidity pools make so much more sense now.",
            "foundry is definitely better for testing than hardhat ngl. the speed is insane.",
            "merkle trees for verification—such a clever use of hashing. great explanation in module 1.",
            "erc-20 vs erc-721 is finally clear. ready to build my first nft collection lol.",
            "reentrancy attacks are wild. glad there's a whole section on security in week 4.",
            "is it better to use openzeppelin or write from scratch? the roadmap says both but i'm undecided.",
            "just finished the web3 grind. feeling like a real blockchain dev now. to the moon! 🚀"
        ]
    },
    "83": { # Cybersecurity & Penetration Testing
        "slug": "cybersecurity-vulnerability-assessment-penetration-testing-simulation",
        "comments": [
            "nmap scanning is addictive lol. finally found the open ports on my local lab machine.",
            "blind sqli had me stuck for 3 days but i finally got the database name!! feel like a hacker now.",
            "rules of engagement are so important. stay safe and legal out there, people.",
            "linux privesc is a lot of fun. checking for setuid bits is my new favorite activity lol.",
            "metasploit is cool but doing it manually in module 2 is way more rewarding.",
            "anyone else doing the hackthebox challenges alongside this roadmap? they match up perfectly.",
            "xss is everywhere -_- sanitized all my old projects after reading the module on it.",
            "just wrote my first pen-test report. feels very professional. week 4 is solid.",
            "white box testing feels like cheating sometimes lol. but it's definitely thorough.",
            "kali linux is the goat. the tools list in the roadmap is perfect for a clean install.",
            "pro tip: always check for default credentials first. you'd be surprised how often they're still there.",
            "this roadmap is a reality check on how vulnerable 'simple' apps really are."
        ]
    },
    "89": { # Linux & Terminal for Developers
        "slug": "linux-terminal-for-developers-a-2-week-roadmap",
        "comments": [
            "bash scripting is actually a superpower. automated my whole backup routine today. hyped!",
            "zsh + oh-my-zsh is a total productivity hack. thanks for the recommendation!!",
            "htop is so much better than top. finally know which process is eating my ram lol.",
            "ssh keys > passwords. simple but so important for security. dont skip week 1!!",
            "i can finally exit vim without panicking lol. great breakdown of the core modes.",
            "grep and awk are a bit intimidating but so powerful for logs. fixed a production bug today!",
            "chmod 777 is a bad habit lol. week 1 explained permissions so much better.",
            "hard links vs soft links—finally found a guide that makes the difference clear.",
            "cron jobs for the win. scheduled my first automated cleanup script today.",
            "week 2 shell scripting project was a blast. feel like a real linux power user now.",
            "is it just me or is the 'find' command actually really hard to remember? -_-",
            "tysm for the 'pipes and redirection' section. literally changed how i use the terminal."
        ]
    },
    "90": { # Frontend Animation & Motion Design
        "slug": "frontend-animation-motion-design-with-css-and-framer-motion",
        "comments": [
            "animatepresence is legit magic for exit animations. my app feels so premium now.",
            "bezier curves > linear. my animations actually have 'weight' now. thanks for the timing tips!!",
            "performance is key. definitely follow the 'will-change' advice in the optimization module.",
            "morphing svgs with css is so satisfying to watch. great part of week 2.",
            "micro-interactions are the secret sauce. my users are actually clicking things now lol.",
            "next.js app router + framer motion is a bit tricky but the guide made it work. tysm!!",
            "layoutid for shared element transitions is insane. feels like ios-level polish.",
            "dont forget prefers-reduced-motion!! accessibility matters in animation too.",
            "built a custom motion gallery for my portfolio. week 2 projects are actually useful.",
            "is it better to use framer motion or just raw css for simple hover effects?",
            "finally understood the 'spring' physics. no more bouncy-but-weird animations lol.",
            "cleanest motion design roadmap out there. perfectly balanced between css and libraries."
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

    print("Batch 2 (Humanised Redo) completed successfully.")

if __name__ == "__main__":
    seed_batch()
