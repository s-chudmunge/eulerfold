import os
import random
import datetime
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# --- Batch 2: 5 Roadmaps, 10 Unique Comments Each ---

DATA = {
    "81": { # Machine Learning from Scratch
        "slug": "machine-learning-from-scratch",
        "comments": [
            "Implementing Gradient Descent from scratch with NumPy really helped me visualize the cost function surface.",
            "The section on the Bias-Variance tradeoff is a classic. Essential for understanding model generalization.",
            "I love that this roadmap includes the 'Linear Algebra for ML' module. Most guides just skip to the code.",
            "How do you decide between L1 and L2 regularization for the regression models in Week 2?",
            "The derivation of the backpropagation algorithm using the chain rule was very rigorous and clear.",
            "Are there any specific datasets you recommend for the 'Classification' module beyond Iris or Titanic?",
            "The K-Means clustering visualization part was my favorite. Seeing the centroids shift is so satisfying.",
            "Does this roadmap cover the math behind Kernel SVMs or just the basic linear version?",
            "Really clean focus on model evaluation. Precision-Recall curves are so much better than just Accuracy.",
            "Looking forward to the Neural Networks module. The plan to build them from scratch is bold!"
        ]
    },
    "73": { # Web3 & Blockchain
        "slug": "web3-blockchain-developer-roadmap",
        "comments": [
            "My first smart contract is deployed on Sepolia! The Solidity syntax is surprisingly intuitive.",
            "The section on 'Gas Optimization' in Week 3 is a life-saver for real-world deployment costs.",
            "How do you handle security audits for these types of contracts? Any recommended tools?",
            "I love the focus on the EVM (Ethereum Virtual Machine) internals. Understanding the stack is key.",
            "Are there any examples of using Ethers.js or Viem for the frontend integration in this roadmap?",
            "The 'DeFi Protocols' module is fascinating. Yield farming and liquidity pools explained clearly.",
            "What's the best way to test these contracts? Is Hardhat or Foundry preferred in the later modules?",
            "I finally understand how Merkle Trees work for transaction verification in the block header.",
            "The distinction between ERC-20 and ERC-721 was broken down very well in Module 2.",
            "Looking forward to the 'Security and Hacks' section. Reentrancy attacks are a must-know."
        ]
    },
    "83": { # Cybersecurity & Penetration Testing
        "slug": "cybersecurity-vulnerability-assessment-penetration-testing-simulation",
        "comments": [
            "The Nmap scanning techniques in Week 1 are very comprehensive. Stealth scans are a great addition.",
            "I've been practicing SQL Injection in a lab environment—the 'Blind SQLi' section was quite tough.",
            "How do you ensure you stay within the 'Rules of Engagement' during a real penetration test?",
            "The section on 'Privilege Escalation' in Linux vs Windows is very detailed and practical.",
            "I love the focus on Metasploit for automation, but also the 'manual' exploit parts.",
            "Are there any specific CTF platforms you recommend for practicing these modules?",
            "The 'Cross-Site Scripting (XSS)' module was an eye-opener. Sanitize your inputs, people!",
            "What's the best way to write a professional 'Vulnerability Assessment Report' as discussed in Week 4?",
            "The distinction between 'White Box' and 'Black Box' testing was explained very clearly.",
            "I'm using Kali Linux as the base OS for this roadmap. The tools list provided is excellent."
        ]
    },
    "89": { # Linux & Terminal for Developers
        "slug": "linux-terminal-for-developers-a-2-week-roadmap",
        "comments": [
            "My Bash scripting is finally improving! The section on 'Pipes and Redirection' is pure power.",
            "I've switched to Zsh as recommended. The auto-completion and themes are a productivity boost.",
            "How do you handle process management (top, htop, kill) when a server starts hanging?",
            "The 'SSH and Remote Access' module is essential. Learning to use keys instead of passwords is key.",
            "I love the 'Vim Basics' section. I'm finally not trapped in the editor anymore!",
            "Are there any specific tips for using 'grep' and 'awk' for large log file analysis?",
            "The 'File Permissions' (chmod/chown) module was explained with very logical examples.",
            "I finally understand the difference between 'hard links' and 'soft links'. Great breakdown.",
            "The 'Cron Jobs' module for automation is a simple but extremely effective addition.",
            "Looking forward to the 'Shell Scripting' projects in Week 2. Time to automate my workflow!"
        ]
    },
    "90": { # Frontend Animation & Motion Design
        "slug": "frontend-animation-motion-design-with-css-and-framer-motion",
        "comments": [
            "Framer Motion's 'AnimatePresence' is a game-changer for exit animations. So smooth!",
            "The section on 'Bezier Curves' for timing functions helped me move beyond simple 'ease-in'.",
            "How do you balance heavy animations with core web vitals and overall performance?",
            "The 'SVG Animation' module with CSS path-morphing is my favorite part so far.",
            "I love the focus on 'Micro-interactions'. They add so much polish to a standard UI.",
            "Are there any specific tips for using Framer Motion with the Next.js App Router?",
            "The distinction between 'transform' and 'layout' animations was explained very clearly.",
            "I'm using the 'LayoutId' feature for shared element transitions. It feels like magic!",
            "How do you handle 'Prefers-Reduced-Motion' for accessibility in these animations?",
            "The projects in Week 2 are great. Building a custom motion-driven gallery was very rewarding."
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
        authors = random.sample(users, 10)
        
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
        time.sleep(1)

    print("Batch 2 completed successfully.")

if __name__ == "__main__":
    seed_batch()
