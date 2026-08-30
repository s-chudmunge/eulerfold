"""
Ingest a hand-curated list of known high-quality educational videos.

Each entry is:  (channel_name, search_title_to_find_video, descriptive_topic_label)

The topic_label is what gets embedded — it must describe what the video actually
teaches, NOT be a copy of the video title. This is what pgvector searches against.

Run from backend/ directory:
    python scripts/ingest_known_videos.py
"""

import asyncio
import httpx
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

YOUTUBE_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_KEY  = os.getenv("GEMINI_API_KEY")
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# ---------------------------------------------------------------------------
# CURATED VIDEO LIST
# (channel_name, exact_search_query_to_find_video, descriptive_topic_label)
# ---------------------------------------------------------------------------
VIDEOS = [

    # ── 3Blue1Brown: Essence of Calculus ──────────────────────────────────
    ("3Blue1Brown", "3Blue1Brown essence of calculus chapter 1",
        "Introduction to Calculus — The Paradox of the Derivative"),
    ("3Blue1Brown", "3Blue1Brown the paradox of the derivative",
        "What is a Derivative? The Paradox of Calculus"),
    ("3Blue1Brown", "3Blue1Brown derivative formulas through geometry",
        "Derivative Formulas Through Geometric Intuition"),
    ("3Blue1Brown", "3Blue1Brown visualizing chain rule product rule",
        "Chain Rule and Product Rule in Calculus Visualized"),
    ("3Blue1Brown", "3Blue1Brown Euler's number e what makes it special",
        "What Makes Euler's Number e Special in Calculus"),
    ("3Blue1Brown", "3Blue1Brown implicit differentiation",
        "Implicit Differentiation Explained Visually"),
    ("3Blue1Brown", "3Blue1Brown integration fundamental theorem calculus",
        "Integration and the Fundamental Theorem of Calculus"),
    ("3Blue1Brown", "3Blue1Brown what does area have to do with slope",
        "Why Integration Is the Inverse of Differentiation"),
    ("3Blue1Brown", "3Blue1Brown Taylor series",
        "Taylor Series and Polynomial Approximations"),
    ("3Blue1Brown", "3Blue1Brown limits L'Hopital epsilon delta",
        "Limits, L'Hopital's Rule, and Epsilon-Delta Definition"),

    # ── 3Blue1Brown: Essence of Linear Algebra ────────────────────────────
    ("3Blue1Brown", "3Blue1Brown vectors what even are they linear algebra",
        "What are Vectors? Linear Algebra from Scratch"),
    ("3Blue1Brown", "3Blue1Brown linear combinations span basis vectors",
        "Linear Combinations, Span, and Basis Vectors"),
    ("3Blue1Brown", "3Blue1Brown linear transformations and matrices",
        "Linear Transformations and How Matrices Represent Them"),
    ("3Blue1Brown", "3Blue1Brown matrix multiplication as composition",
        "Matrix Multiplication as Function Composition"),
    ("3Blue1Brown", "3Blue1Brown the determinant 3blue1brown",
        "What is the Determinant of a Matrix?"),
    ("3Blue1Brown", "3Blue1Brown inverse matrices column space null space",
        "Inverse Matrices, Column Space, and Null Space"),
    ("3Blue1Brown", "3Blue1Brown dot products duality",
        "Dot Products and Duality in Linear Algebra"),
    ("3Blue1Brown", "3Blue1Brown change of basis linear algebra",
        "Change of Basis in Linear Algebra"),
    ("3Blue1Brown", "3Blue1Brown eigenvectors eigenvalues",
        "Eigenvectors and Eigenvalues Explained Visually"),
    ("3Blue1Brown", "3Blue1Brown abstract vector spaces",
        "Abstract Vector Spaces in Linear Algebra"),

    # ── 3Blue1Brown: Neural Networks ──────────────────────────────────────
    ("3Blue1Brown", "3Blue1Brown but what is a neural network deep learning chapter 1",
        "What is a Neural Network and How Does It Compute"),
    ("3Blue1Brown", "3Blue1Brown gradient descent how neural networks learn",
        "Gradient Descent and How Neural Networks Learn"),
    ("3Blue1Brown", "3Blue1Brown what is backpropagation really doing",
        "What is Backpropagation and What is it Really Doing"),
    ("3Blue1Brown", "3Blue1Brown backpropagation calculus deep learning",
        "The Calculus Behind Backpropagation"),

    # ── 3Blue1Brown: Other Math ────────────────────────────────────────────
    ("3Blue1Brown", "3Blue1Brown Fourier transform visual introduction",
        "What is the Fourier Transform? A Visual Introduction"),
    ("3Blue1Brown", "3Blue1Brown differential equations introduction",
        "Introduction to Differential Equations"),
    ("3Blue1Brown", "3Blue1Brown Bayes theorem medical test paradox",
        "Bayes Theorem Explained with the Medical Test Paradox"),
    ("3Blue1Brown", "3Blue1Brown but what is a Fourier series",
        "What is a Fourier Series? From Heat Equation to Sine Waves"),
    ("3Blue1Brown", "3Blue1Brown simulating physics with neural networks",
        "Simulating Physics with Neural Networks"),

    # ── StatQuest: Machine Learning ───────────────────────────────────────
    ("StatQuest with Josh Starmer", "StatQuest linear regression clearly explained",
        "Linear Regression Explained from Scratch"),
    ("StatQuest with Josh Starmer", "StatQuest logistic regression clearly explained",
        "Logistic Regression Explained Step by Step"),
    ("StatQuest with Josh Starmer", "StatQuest support vector machines clearly explained",
        "Support Vector Machines (SVM) Explained"),
    ("StatQuest with Josh Starmer", "StatQuest decision trees clearly explained",
        "Decision Trees Explained from Root to Leaf"),
    ("StatQuest with Josh Starmer", "StatQuest random forests clearly explained",
        "Random Forests Explained — Ensemble Learning"),
    ("StatQuest with Josh Starmer", "StatQuest gradient boost regression main ideas",
        "Gradient Boosting for Regression Explained"),
    ("StatQuest with Josh Starmer", "StatQuest XGBoost part 1 regression",
        "XGBoost Explained — How It Builds Trees"),
    ("StatQuest with Josh Starmer", "StatQuest PCA main ideas principal component analysis",
        "Principal Component Analysis (PCA) Clearly Explained"),
    ("StatQuest with Josh Starmer", "StatQuest k-means clustering",
        "K-Means Clustering Algorithm Explained"),
    ("StatQuest with Josh Starmer", "StatQuest naive bayes clearly explained",
        "Naive Bayes Classifier Explained"),
    ("StatQuest with Josh Starmer", "StatQuest t-SNE clearly explained",
        "t-SNE Dimensionality Reduction Explained"),
    ("StatQuest with Josh Starmer", "StatQuest UMAP clearly explained",
        "UMAP Dimensionality Reduction Explained"),
    ("StatQuest with Josh Starmer", "StatQuest neural networks part 1 inside black box",
        "How Neural Networks Are Structured — Inside the Black Box"),
    ("StatQuest with Josh Starmer", "StatQuest recurrent neural networks RNN clearly explained",
        "Recurrent Neural Networks (RNN) Clearly Explained"),
    ("StatQuest with Josh Starmer", "StatQuest LSTM long short term memory clearly explained",
        "Long Short-Term Memory (LSTM) Networks Explained"),
    ("StatQuest with Josh Starmer", "StatQuest word2vec clearly explained",
        "Word2Vec Word Embeddings Explained"),
    ("StatQuest with Josh Starmer", "StatQuest transformer neural networks clearly explained",
        "Transformer Neural Networks Explained from Scratch"),
    ("StatQuest with Josh Starmer", "StatQuest encoder decoder attention",
        "Encoder-Decoder Architecture and Attention Mechanism"),

    # ── Abdul Bari: Algorithms & Data Structures ──────────────────────────
    ("Abdul Bari", "Abdul Bari introduction to algorithms analysis",
        "Introduction to Algorithm Analysis and Asymptotic Notation"),
    ("Abdul Bari", "Abdul Bari recursion tree method",
        "Recursion Tree Method for Time Complexity"),
    ("Abdul Bari", "Abdul Bari master theorem",
        "Master Theorem for Solving Recurrence Relations"),
    ("Abdul Bari", "Abdul Bari heap sort algorithm",
        "Heap Sort Algorithm — How It Works"),
    ("Abdul Bari", "Abdul Bari merge sort algorithm",
        "Merge Sort Algorithm — Divide and Conquer Explained"),
    ("Abdul Bari", "Abdul Bari quick sort algorithm",
        "QuickSort Algorithm — Partition and Recursion"),
    ("Abdul Bari", "Abdul Bari dynamic programming introduction",
        "Introduction to Dynamic Programming"),
    ("Abdul Bari", "Abdul Bari 0/1 knapsack dynamic programming",
        "0/1 Knapsack Problem Using Dynamic Programming"),
    ("Abdul Bari", "Abdul Bari longest common subsequence dynamic programming",
        "Longest Common Subsequence (LCS) Dynamic Programming"),
    ("Abdul Bari", "Abdul Bari graph BFS breadth first search",
        "Breadth First Search (BFS) Algorithm on Graphs"),
    ("Abdul Bari", "Abdul Bari graph DFS depth first search",
        "Depth First Search (DFS) Algorithm on Graphs"),
    ("Abdul Bari", "Abdul Bari Dijkstra algorithm shortest path",
        "Dijkstra's Shortest Path Algorithm"),
    ("Abdul Bari", "Abdul Bari Bellman Ford algorithm",
        "Bellman-Ford Algorithm for Shortest Paths with Negative Edges"),
    ("Abdul Bari", "Abdul Bari Floyd Warshall algorithm",
        "Floyd-Warshall All-Pairs Shortest Path Algorithm"),
    ("Abdul Bari", "Abdul Bari AVL tree rotations",
        "AVL Trees and Rotations Explained"),
    ("Abdul Bari", "Abdul Bari hashing hash table",
        "Hashing and Hash Tables Explained"),
    ("Abdul Bari", "Abdul Bari minimum spanning tree Prim Kruskal",
        "Minimum Spanning Trees — Prim's and Kruskal's Algorithms"),
    ("Abdul Bari", "Abdul Bari tree traversal inorder preorder postorder",
        "Binary Tree Traversals — Inorder, Preorder, Postorder"),

    # ── Corey Schafer: Python ─────────────────────────────────────────────
    ("Corey Schafer", "Corey Schafer Python OOP classes instances",
        "Python Object-Oriented Programming — Classes and Instances"),
    ("Corey Schafer", "Corey Schafer Python decorators",
        "Python Decorators Explained Step by Step"),
    ("Corey Schafer", "Corey Schafer Python generators",
        "Python Generators — When and How to Use Them"),
    ("Corey Schafer", "Corey Schafer Python context managers with statement",
        "Python Context Managers and the with Statement"),
    ("Corey Schafer", "Corey Schafer Python threading multiprocessing",
        "Python Threading vs Multiprocessing Explained"),
    ("Corey Schafer", "Corey Schafer Python comprehensions list dict set",
        "Python List, Dict, and Set Comprehensions"),
    ("Corey Schafer", "Corey Schafer Git tutorial for beginners",
        "Git and Version Control for Beginners"),
    ("Corey Schafer", "Corey Schafer Django tutorial beginners series",
        "Django Web Framework for Beginners — Full Series"),
    ("Corey Schafer", "Corey Schafer Python pandas tutorial",
        "Pandas for Data Analysis in Python"),

    # ── NeetCode: Algorithms / DSA ────────────────────────────────────────
    ("NeetCode", "NeetCode dynamic programming patterns explained",
        "Dynamic Programming Patterns for Coding Interviews"),
    ("NeetCode", "NeetCode graph algorithms BFS DFS explained",
        "Graph Algorithms — BFS and DFS Patterns"),
    ("NeetCode", "NeetCode sliding window technique explained",
        "Sliding Window Technique for Array and String Problems"),
    ("NeetCode", "NeetCode two pointers technique",
        "Two Pointers Technique for Array Problems"),
    ("NeetCode", "NeetCode binary search explained",
        "Binary Search — Patterns and Applications"),
    ("NeetCode", "NeetCode trees explained binary search tree",
        "Binary Trees and Binary Search Trees Explained"),
    ("NeetCode", "NeetCode tries explained prefix tree",
        "Trie Data Structure Explained"),
    ("NeetCode", "NeetCode heap priority queue explained",
        "Heap and Priority Queue Data Structure Explained"),
    ("NeetCode", "NeetCode backtracking explained",
        "Backtracking Algorithm Explained with Examples"),

    # ── MIT OpenCourseWare: Linear Algebra (Gilbert Strang) ───────────────
    ("MIT OpenCourseWare", "MIT OpenCourseWare Gilbert Strang lecture 1 geometry of linear equations",
        "Geometry of Linear Equations — MIT Linear Algebra"),
    ("MIT OpenCourseWare", "MIT OpenCourseWare Gilbert Strang elimination matrices",
        "Elimination with Matrices — Gaussian Elimination"),
    ("MIT OpenCourseWare", "MIT OpenCourseWare Gilbert Strang multiplication inverses",
        "Matrix Multiplication and Matrix Inverses"),
    ("MIT OpenCourseWare", "MIT OpenCourseWare Gilbert Strang four fundamental subspaces",
        "The Four Fundamental Subspaces of a Matrix"),
    ("MIT OpenCourseWare", "MIT OpenCourseWare Gilbert Strang eigenvalues eigenvectors lecture",
        "Eigenvalues and Eigenvectors — MIT Linear Algebra"),

    # ── The Organic Chemistry Tutor: Physics ──────────────────────────────
    ("The Organic Chemistry Tutor", "organic chemistry tutor Newton's laws of motion",
        "Newton's Three Laws of Motion Explained"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor kinematics equations",
        "Kinematics — Equations of Motion Explained"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor work energy theorem",
        "Work, Energy, and the Work-Energy Theorem"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor conservation of momentum",
        "Conservation of Momentum in Collisions"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor electric field and force",
        "Electric Fields and Coulomb's Law"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor circuits Ohm's law",
        "Ohm's Law and Basic Circuits"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor waves frequency wavelength",
        "Waves — Frequency, Wavelength, and the Wave Equation"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor thermodynamics laws",
        "Laws of Thermodynamics Explained"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor ideal gas law",
        "Ideal Gas Law — PV = nRT Explained"),

    # ── The Organic Chemistry Tutor: Chemistry ────────────────────────────
    ("The Organic Chemistry Tutor", "organic chemistry tutor Lewis structures",
        "How to Draw Lewis Structures Step by Step"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor electronegativity polarity",
        "Electronegativity and Molecular Polarity"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor reaction kinetics rate law",
        "Chemical Kinetics and Rate Laws"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor thermochemistry enthalpy",
        "Thermochemistry — Enthalpy and Hess's Law"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor equilibrium constant Ka Kb",
        "Chemical Equilibrium and Equilibrium Constants"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor nucleophilic substitution SN1 SN2",
        "SN1 and SN2 Nucleophilic Substitution Reactions"),
    ("The Organic Chemistry Tutor", "organic chemistry tutor alkene reactions addition",
        "Alkene Addition Reactions and Mechanisms"),

    # ── Khan Academy: Physics (for foundational topics) ───────────────────
    ("Khan Academy", "Khan Academy Newton's first law of motion",
        "Newton's First Law of Motion — Inertia"),
    ("Khan Academy", "Khan Academy Newton's second law force mass acceleration",
        "Newton's Second Law — Force, Mass, and Acceleration"),
    ("Khan Academy", "Khan Academy Newton's third law action reaction",
        "Newton's Third Law — Action and Reaction Pairs"),
    ("Khan Academy", "Khan Academy projectile motion",
        "Projectile Motion — Horizontal and Vertical Components"),
    ("Khan Academy", "Khan Academy work energy theorem",
        "Work-Energy Theorem in Physics"),
    ("Khan Academy", "Khan Academy electric potential energy voltage",
        "Electric Potential Energy and Voltage"),
    ("Khan Academy", "Khan Academy quantum mechanics introduction wave-particle duality",
        "Introduction to Quantum Mechanics and Wave-Particle Duality"),
    ("Khan Academy", "Khan Academy special relativity introduction",
        "Introduction to Special Relativity and Time Dilation"),

    # ── Khan Academy: Math ────────────────────────────────────────────────
    ("Khan Academy", "Khan Academy limits introduction calculus",
        "Introduction to Limits in Calculus"),
    ("Khan Academy", "Khan Academy derivatives introduction",
        "Introduction to Derivatives — The Derivative Rules"),
    ("Khan Academy", "Khan Academy definite integral introduction",
        "Introduction to Definite Integrals"),
    ("Khan Academy", "Khan Academy probability introduction",
        "Introduction to Probability — Basic Rules"),
    ("Khan Academy", "Khan Academy conditional probability Bayes theorem",
        "Conditional Probability and Bayes Theorem"),
    ("Khan Academy", "Khan Academy normal distribution Z score",
        "Normal Distribution and Z-Scores Explained"),
    ("Khan Academy", "Khan Academy hypothesis testing introduction",
        "Introduction to Hypothesis Testing"),
    ("Khan Academy", "Khan Academy p-value explained",
        "What is a P-Value and How Do You Interpret It"),
    ("Khan Academy", "Khan Academy vectors introduction",
        "Introduction to Vectors — Magnitude and Direction"),
    ("Khan Academy", "Khan Academy matrix operations multiplication",
        "Matrix Operations — Addition, Multiplication, and Inverses"),
    ("Khan Academy", "Khan Academy complex numbers introduction",
        "Introduction to Complex Numbers"),

    # ── Computerphile: CS Concepts ────────────────────────────────────────
    ("Computerphile", "Computerphile how computers work transistors",
        "How Computers Work — Transistors to Logic Gates"),
    ("Computerphile", "Computerphile TCP/IP networking explained",
        "TCP/IP Networking Explained — How the Internet Works"),
    ("Computerphile", "Computerphile public key cryptography",
        "Public Key Cryptography and RSA Explained"),
    ("Computerphile", "Computerphile SQL injection explained",
        "SQL Injection Attack Explained"),
    ("Computerphile", "Computerphile floating point numbers",
        "Floating Point Numbers — How Computers Store Decimals"),
    ("Computerphile", "Computerphile recursion computer science",
        "Recursion Explained — The Stack and Base Case"),
    ("Computerphile", "Computerphile how does a CPU work",
        "How a CPU Works — Fetch, Decode, Execute Cycle"),
    ("Computerphile", "Computerphile hashing password security",
        "Password Hashing and Why You Should Never Store Plaintext"),
    ("Computerphile", "Computerphile regular expressions",
        "Regular Expressions Explained from Scratch"),
    ("Computerphile", "Computerphile functional programming lambda calculus",
        "Functional Programming and Lambda Calculus"),
    ("Computerphile", "Computerphile natural language processing NLP",
        "Natural Language Processing — How Computers Understand Text"),
    ("Computerphile", "Computerphile Turing machine explained",
        "Turing Machines — The Theory Behind All Computation"),
    ("Computerphile", "Computerphile P vs NP problem",
        "P vs NP — The Biggest Unsolved Problem in Computer Science"),
    ("Computerphile", "Computerphile binary number system explained",
        "Binary Numbers — How Computers Count"),

    # ── Bozeman Science: Biology ──────────────────────────────────────────
    ("Bozeman Science", "Bozeman Science DNA replication explained",
        "DNA Replication — How Cells Copy Their Genome"),
    ("Bozeman Science", "Bozeman Science transcription translation protein synthesis",
        "Transcription and Translation — How Genes Make Proteins"),
    ("Bozeman Science", "Bozeman Science photosynthesis light reactions",
        "Photosynthesis — The Light Reactions and Electron Transport"),
    ("Bozeman Science", "Bozeman Science cellular respiration glycolysis",
        "Cellular Respiration — Glycolysis, Krebs Cycle, and ATP"),
    ("Bozeman Science", "Bozeman Science mitosis explained",
        "Mitosis — The Stages of Cell Division"),
    ("Bozeman Science", "Bozeman Science meiosis explained",
        "Meiosis — Cell Division for Sexual Reproduction"),
    ("Bozeman Science", "Bozeman Science natural selection evolution",
        "Natural Selection and How Evolution Works"),
    ("Bozeman Science", "Bozeman Science Mendelian genetics inheritance",
        "Mendelian Genetics and the Laws of Inheritance"),
    ("Bozeman Science", "Bozeman Science CRISPR gene editing",
        "CRISPR-Cas9 Gene Editing — How It Works"),

    # ── Numberphile: Math ─────────────────────────────────────────────────
    ("Numberphile", "Numberphile Riemann hypothesis explained",
        "The Riemann Hypothesis — The Most Important Unsolved Problem"),
    ("Numberphile", "Numberphile prime numbers infinity",
        "Why There Are Infinitely Many Prime Numbers — Euclid's Proof"),
    ("Numberphile", "Numberphile pi explained",
        "What is Pi and Why is it Irrational"),
    ("Numberphile", "Numberphile golden ratio",
        "The Golden Ratio — Mathematics in Nature and Art"),

    # ── CS50 Harvard ──────────────────────────────────────────────────────
    ("CS50", "CS50 2023 lecture 1 C programming",
        "Introduction to C Programming — Memory, Variables, and Data Types"),
    ("CS50", "CS50 2023 lecture 2 arrays",
        "Arrays in C — Memory Layout and String Manipulation"),
    ("CS50", "CS50 2023 lecture 3 algorithms",
        "Sorting and Searching Algorithms — Linear, Binary, Bubble, Merge"),
    ("CS50", "CS50 2023 lecture 4 memory pointers",
        "Memory, Pointers, and Dynamic Allocation in C"),
    ("CS50", "CS50 2023 lecture 5 data structures",
        "Data Structures — Linked Lists, Hash Tables, and Trees"),
    ("CS50", "CS50 SQL databases lecture",
        "SQL Databases — Tables, Queries, Joins, and Indexes"),
    ("CS50", "CS50 Python introduction lecture",
        "Introduction to Python — Syntax, Functions, and Libraries"),
    ("CS50", "CS50 web programming HTML CSS JavaScript lecture",
        "Web Programming — HTML, CSS, and JavaScript Fundamentals"),
]

# ---------------------------------------------------------------------------

def parse_duration(duration: str) -> int:
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return 0
    return int(match.group(1) or 0) * 3600 + int(match.group(2) or 0) * 60 + int(match.group(3) or 0)


async def search_video(query: str, client: httpx.AsyncClient) -> dict | None:
    """Search YouTube for a video by query and return its full details."""
    r = await client.get(
        "https://www.googleapis.com/youtube/v3/search",
        params={
            "part": "snippet", "q": query, "type": "video",
            "maxResults": 3, "key": YOUTUBE_KEY, "relevanceLanguage": "en",
        },
        timeout=15.0,
    )
    items = r.json().get("items", [])
    if not items:
        return None

    vid_ids = ",".join(i["id"]["videoId"] for i in items)
    r2 = await client.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={"part": "contentDetails,snippet,statistics", "id": vid_ids, "key": YOUTUBE_KEY},
        timeout=15.0,
    )
    videos = r2.json().get("items", [])
    # Return the first that's >= 5 min
    for v in videos:
        if parse_duration(v.get("contentDetails", {}).get("duration", "")) >= 300:
            return v
    return None


async def generate_embedding(text: str, client: httpx.AsyncClient) -> list | None:
    r = await client.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={GEMINI_KEY}",
        json={
            "model": "models/gemini-embedding-2",
            "outputDimensionality": 768,
            "content": {"parts": [{"text": text}]},
        },
        timeout=15.0,
    )
    return r.json().get("embedding", {}).get("values") if r.status_code == 200 else None


async def main():
    # Get existing video_ids to skip
    existing = sb.table("curated_videos").select("video_id").execute()
    already_done = {r["video_id"] for r in existing.data}
    print(f"Already in DB: {len(already_done)} videos")
    print(f"Processing: {len(VIDEOS)} known videos\n")

    inserted = 0
    skipped_existing = 0
    skipped_no_result = 0

    async with httpx.AsyncClient(timeout=20.0) as client:
        for channel, search_query, topic_label in VIDEOS:
            video = await search_video(search_query, client)
            if not video:
                print(f"  MISS  {topic_label[:60]}")
                skipped_no_result += 1
                await asyncio.sleep(0.1)
                continue

            vid_id = video["id"]
            if vid_id in already_done:
                skipped_existing += 1
                await asyncio.sleep(0.05)
                continue

            title = video["snippet"]["title"]
            dur_mins = parse_duration(video["contentDetails"]["duration"]) // 60

            embedding = await generate_embedding(topic_label, client)
            if not embedding:
                print(f"  EMBED_ERR  {topic_label[:60]}")
                await asyncio.sleep(0.2)
                continue

            try:
                sb.table("curated_videos").upsert({
                    "video_id": vid_id,
                    "clean_title": title,
                    "channel": channel,
                    "topic": topic_label,
                    "duration_mins": dur_mins,
                    "topic_embedding": embedding,
                }, on_conflict="video_id").execute()
                already_done.add(vid_id)
                inserted += 1
                print(f"  OK  [{vid_id}] {dur_mins}m | {topic_label[:55]}")
            except Exception as e:
                print(f"  DB_ERR  {e}")

            await asyncio.sleep(0.1)

    print(f"\nDone. Inserted: {inserted} | Already existed: {skipped_existing} | Not found: {skipped_no_result}")
    total = sb.table("curated_videos").select("id", count="exact").execute()
    print(f"Total in DB now: {total.count}")


if __name__ == "__main__":
    asyncio.run(main())
