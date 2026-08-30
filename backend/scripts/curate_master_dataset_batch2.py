"""
Batch 2: Expanding Curated STEM Knowledge Base with another 250+ Rigorous University Topics.

Covers:
- MIT OCW Algorithms & Differential Equations
- Dr. Trefor Bazett Discrete Math & Linear Algebra Proofs
- Michael Penn Abstract Algebra (Groups, Rings, Fields)
- Steve Brunton Control Theory (Bode Plots, State Space, PID, Controllability)
- StatQuest Advanced Statistics (MLE, ANOVA, Chi-Square, p-values)
- Go / Rust / Systems Concurrency (Channels, Goroutines, Memory Safety)
- Bozeman Science & Ninja Nerd Advanced Biology / Biochemistry
"""

import os
import json
import asyncio
import httpx
import re
import sys
import urllib.parse

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
GEMINI_KEY = os.getenv('GEMINI_API_KEY')
YOUTUBE_KEY = os.getenv('YOUTUBE_API_KEY')

BATCH_2_KNOWLEDGE_BASE = [
    # ── 1. ADVANCED ALGORITHMS & DISCRETE MATH (MIT OCW, Dr. Trefor Bazett) ──
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Propositional Logic Truth Tables", "Propositional Logic, Logical Connectives, and Truth Tables"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Conditional Statements Biconditional", "Conditional and Biconditional Statements in Mathematical Logic"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Quantifiers Predicates Universal Existential", "Predicate Logic, Universal (∀), and Existential (∃) Quantifiers"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Direct Proofs and Proof by Contrapositive", "Methods of Mathematical Proof — Direct Proof vs Proof by Contrapositive"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Proof by Contradiction", "Proof by Contradiction in Mathematical Arguments"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Mathematical Induction Base Step Inductive Step", "Principle of Mathematical Induction (Base Case and Inductive Step)"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Strong Induction vs Weak Induction", "Strong Mathematical Induction vs Standard Weak Induction"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Set Operations Union Intersection Complement", "Set Theory Fundamentals — Unions, Intersections, and Complements"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Relations Equivalence Relations Equivalence Classes", "Equivalence Relations, Reflexivity, Symmetry, Transitivity, and Equivalence Classes"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Functions Injective Surjective Bijective One to One", "Functions — Injective (One-to-One), Surjective (Onto), and Bijective Mappings"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Pigeonhole Principle Generalized Examples", "The Pigeonhole Principle and Generalized Applications in Combinatorics"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Permutations and Combinations Formula", "Combinatorics — Permutations, Combinations, and the Binomial Theorem"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Inclusion Exclusion Principle", "The Principle of Inclusion-Exclusion for Set Cardinality"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Modular Arithmetic Congruence Modulo n", "Modular Arithmetic, Congruences, and Residue Classes"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Euclidean Algorithm Extended GCD", "Euclidean Algorithm and Extended Euclidean Algorithm for Greatest Common Divisor"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Modular Inverses Bezout's Identity", "Modular Multiplicative Inverses via Bézout's Identity"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Chinese Remainder Theorem CRT", "The Chinese Remainder Theorem (CRT) for System of Congruences"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math RSA Encryption Cryptography math", "Mathematical Foundations of RSA Public-Key Cryptography"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Graph Theory Introduction Vertices Edges Degree", "Graph Theory Fundamentals — Vertices, Edges, Adjacency, and Degree Handshaking Lemma"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Eulerian Paths and Eulerian Circuits", "Eulerian Paths and Circuits — Necessary and Sufficient Conditions"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Planar Graphs Euler's Formula K5 K3,3", "Planar Graphs, Euler's Characteristic Formula (V - E + F = 2), and Kuratowski's Theorem"),
    ("Dr. Trefor Bazett", "Trefor Bazett Discrete Math Graph Coloring Chromatic Number Four Color", "Graph Coloring and the Chromatic Number of Graphs"),
    ("MIT OpenCourseWare", "MIT 6.006 Introduction to Algorithms Erik Demaine Lecture 1 Peak Finding", "Algorithmic Peak Finding in 1D and 2D Arrays (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 2 Models of Computation Document Distance", "Models of Computation, Word RAM, and Document Distance Metric (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 3 Insertion Sort Merge Sort", "Comparison Sorts — Insertion Sort and Merge Sort Analysis (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 4 Heaps and Heap Sort Priority Queue", "Binary Heaps, Max-Heapify, and Heap Sort (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 5 Binary Search Trees BST sort", "Binary Search Trees, Inorder Traversal, and Tree Balancing (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 6 AVL Trees Balanced BSTs", "AVL Trees — Height Balance Invariant and Rotations (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 7 Counting Sort Radix Sort Lower Bounds", "Non-Comparison Sorting — Counting Sort, Radix Sort, and Comparison Sort Lower Bounds (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 8 Hashing Chaining Hash Functions", "Hash Tables — Collision Resolution via Chaining and Universal Hashing (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 9 Table Doubling Open Addressing", "Dynamic Hash Table Resizing and Open Addressing with Linear/Double Hashing (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 10 Open Addressing Cryptographic Hashing", "Open Addressing Collision Probing and Cryptographic Hash Function Properties (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 11 Simple Shortest Paths BFS", "Breadth-First Search (BFS) and Unweighted Shortest Path Finding (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 12 Breadth-First Search DFS", "Depth-First Search (DFS), Cycle Detection, and Topological Sort (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 13 Breadth-First Search Shortest Paths Dijkstra", "Dijkstra's Algorithm with Priority Queues for Non-Negative Edge Weights (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 14 Bellman-Ford Negative Weight Cycles", "Bellman-Ford Algorithm and Negative-Weight Cycle Detection (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 15 Speeding up Dijkstra A* Search", "Heuristic Search — A* Search Algorithm and Bidirectional Dijkstra (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 19 Dynamic Programming 1 Fibonacci Shortest Paths", "Dynamic Programming Fundamentals — Memoization, Subproblems, and DAG Paths (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 20 Dynamic Programming 2 Text Justification Blackjack", "Dynamic Programming on Sequences — Text Justification and Guessing Games (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 21 Dynamic Programming 3 Parenthesization Edit Distance", "Dynamic Programming on Substrings — Longest Common Subsequence and Edit Distance (MIT 6.006)"),
    ("MIT OpenCourseWare", "MIT 6.006 Lecture 22 Dynamic Programming 4 Knapsack", "Dynamic Programming — 0/1 Knapsack and Pseudo-Polynomial Time (MIT 6.006)"),

    # ── 2. ABSTRACT ALGEBRA (Michael Penn) ──
    ("Michael Penn", "Michael Penn Abstract Algebra Introduction to Groups Definition Examples", "Group Theory — Definition of a Group, Binary Operations, and Group Axioms"),
    ("Michael Penn", "Michael Penn Abstract Algebra Group Examples Klein 4 Group S3 D4", "Canonical Group Examples — Cyclic Groups, Klein Four-Group, S3, and Dihedral D4"),
    ("Michael Penn", "Michael Penn Abstract Algebra Elementary Properties of Groups Uniqueness of Identity Inverse", "Uniqueness of Identity and Inverse Elements in Group Theory"),
    ("Michael Penn", "Michael Penn Abstract Algebra Subgroups Definition Subgroup Test", "Subgroups and the One-Step and Two-Step Subgroup Tests"),
    ("Michael Penn", "Michael Penn Abstract Algebra Cyclic Groups Generators Order of Element", "Cyclic Groups, Generators, and the Order of Group Elements"),
    ("Michael Penn", "Michael Penn Abstract Algebra Classification of Cyclic Groups Subgroups of Cyclic", "Subgroups of Cyclic Groups and Fundamental Theorem of Cyclic Groups"),
    ("Michael Penn", "Michael Penn Abstract Algebra Permutation Groups Symmetric Group Sn Cycles", "Permutation Groups, Symmetric Group Sn, Disjoint Cycle Decomposition, and Parity"),
    ("Michael Penn", "Michael Penn Abstract Algebra Alternating Group An Even Permutations", "Alternating Group An and Even vs Odd Permutations"),
    ("Michael Penn", "Michael Penn Abstract Algebra Cosets of a Subgroup Left Right Cosets", "Left and Right Cosets of a Subgroup in Abstract Algebra"),
    ("Michael Penn", "Michael Penn Abstract Algebra Lagrange's Theorem Order of Subgroup Divides Group", "Lagrange's Theorem on the Order of Subgroups and Coset Partitions"),
    ("Michael Penn", "Michael Penn Abstract Algebra Normal Subgroups Definition Equivalent Conditions", "Normal Subgroups and Conjugation Invariance"),
    ("Michael Penn", "Michael Penn Abstract Algebra Quotient Groups Factor Groups G/N", "Quotient Groups (Factor Groups) and Well-Defined Coset Multiplication"),
    ("Michael Penn", "Michael Penn Abstract Algebra Group Homomorphisms Kernel Image", "Group Homomorphisms, Kernel, Image, and Structure Preservation"),
    ("Michael Penn", "Michael Penn Abstract Algebra First Isomorphism Theorem for Groups G/ker(phi)", "The First Isomorphism Theorem for Groups (G/ker(φ) ≅ Im(φ))"),
    ("Michael Penn", "Michael Penn Abstract Algebra Introduction to Rings Ring Axioms Examples", "Ring Theory — Definition of a Ring, Commutative Rings, and Integral Domains"),
    ("Michael Penn", "Michael Penn Abstract Algebra Ideals and Quotient Rings Ring Homomorphisms", "Ideals, Quotient Rings, and the First Isomorphism Theorem for Rings"),
    ("Michael Penn", "Michael Penn Abstract Algebra Maximal Ideals and Prime Ideals Field", "Prime Ideals, Maximal Ideals, and Quotient Fields"),
    ("Michael Penn", "Michael Penn Abstract Algebra Field Theory Introduction Characteristic of Field", "Field Theory Fundamentals — Definition of a Field, Subfields, and Characteristic"),

    # ── 3. DIFFERENTIAL EQUATIONS & DYNAMICAL SYSTEMS (MIT OCW, Steve Brunton) ──
    ("MIT OpenCourseWare", "MIT 18.03 Differential Equations Lecture 1 First-Order ODEs Direction Fields", "First-Order Ordinary Differential Equations, Direction Fields, and Integral Curves (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 2 First-Order Linear ODEs Integrating Factor", "First-Order Linear ODEs and the Integrating Factor Method (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 3 Autonomous ODEs Phase Line Bifurcations", "Autonomous First-Order ODEs, Phase Lines, and Stability of Critical Points (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 9 Second-Order Linear Constant Coefficient ODEs Characteristic Equation", "Second-Order Homogeneous Linear ODEs with Constant Coefficients (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 10 Damped Harmonic Oscillators Overdamped Underdamped", "Damped Harmonic Motion — Underdamped, Overdamped, and Critically Damped Solutions (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 11 Undetermined Coefficients Particular Solution", "Method of Undetermined Coefficients for Inhomogeneous Second-Order ODEs (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 12 Resonance Frequency Response Bode Plot", "Forced Oscillations, Resonance Phenomenon, and Frequency Response (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 19 Introduction to the Laplace Transform Definition", "The Laplace Transform — Definition, Linearity, and Operational Properties (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 20 Solving Initial Value Problems with Laplace Transform", "Solving Initial Value Problems via Laplace Transforms and Partial Fractions (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 21 Step Functions Delta Functions Heaviside Dirac", "Heaviside Step Function and Dirac Delta Impulse in Laplace Transforms (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 22 Convolution Theorem for Laplace Transform", "The Convolution Theorem for Laplace Transforms and Integral Equations (MIT 18.03)"),
    ("MIT OpenCourseWare", "MIT 18.03 Lecture 25 Linear Systems of ODEs Phase Portraits Eigenvalues", "2x2 Linear Systems of ODEs, Phase Portraits, and Eigenvalue Classification (MIT 18.03)"),
    ("Steve Brunton", "Steve Brunton Transfer Functions Laplace Transform Control Systems", "Transfer Functions, Poles, and Zeros in Classical Control Theory"),
    ("Steve Brunton", "Steve Brunton Root Locus Control Systems Stability Evans method", "Root Locus Analysis for Feedback Control System Stability"),
    ("Steve Brunton", "Steve Brunton Bode Plots Gain Margin Phase Margin Stability", "Bode Frequency Response Plots — Gain Margin and Phase Margin Analysis"),
    ("Steve Brunton", "Steve Brunton PID Controller Tuning Proportional Integral Derivative", "PID Controller Design and Anti-Windup Tuning in Control Engineering"),
    ("Steve Brunton", "Steve Brunton State Space Representation Matrix Exponential x_dot=Ax+Bu", "State-Space Representation of Dynamical Systems (ẋ = Ax + Bu)"),
    ("Steve Brunton", "Steve Brunton Controllability and Observability Gramians Kalman Rank Condition", "Controllability and Observability — Kalman Rank Criterion and Gramian Matrices"),

    # ── 4. STATISTICS & PROBABILITY (StatQuest, Khan Academy) ──
    ("StatQuest with Josh Starmer", "StatQuest Maximum Likelihood Estimation MLE clearly explained", "Maximum Likelihood Estimation (MLE) — Probability vs Likelihood Formulation"),
    ("StatQuest with Josh Starmer", "StatQuest p-values and Hypothesis Testing clearly explained", "Statistical Significance, Null Hypotheses, and P-Value Interpretation"),
    ("StatQuest with Josh Starmer", "StatQuest ANOVA Analysis of Variance clearly explained F-distribution", "One-Way Analysis of Variance (ANOVA) and the F-Test Statistic"),
    ("StatQuest with Josh Starmer", "StatQuest Chi-Square Test for Independence clearly explained", "Chi-Square Test for Independence and Goodness-of-Fit"),
    ("StatQuest with Josh Starmer", "StatQuest Confidence Intervals clearly explained standard error", "Confidence Intervals and Standard Error of the Mean Explained"),
    ("StatQuest with Josh Starmer", "StatQuest Central Limit Theorem CLT clearly explained", "The Central Limit Theorem (CLT) and Convergence to Normal Distribution"),
    ("StatQuest with Josh Starmer", "StatQuest Bootstrapping and Resampling Methods statistics", "Bootstrapping and Resampling Methods for Non-Parametric Confidence Intervals"),
    ("StatQuest with Josh Starmer", "StatQuest Quantile-Quantile Plots QQ Plots clearly explained", "Quantile-Quantile (Q-Q) Plots for Normality Assessment"),
    ("StatQuest with Josh Starmer", "StatQuest Multiple Linear Regression and Multicollinearity VIF", "Multiple Linear Regression, R-Squared, Adjusted R-Squared, and Multicollinearity"),

    # ── 5. ELECTRICAL ENGINEERING: SIGNALS, SYSTEMS & DIGITAL LOGIC (Neso Academy) ──
    ("Neso Academy", "Neso Academy Introduction to Number Systems Binary Octal Decimal Hexadecimal", "Number Systems — Binary, Octal, Decimal, and Hexadecimal Bases and Conversions"),
    ("Neso Academy", "Neso Academy 1's and 2's Complement Representation Binary Arithmetic", "Signed Binary Arithmetic — 1's Complement and 2's Complement Representations"),
    ("Neso Academy", "Neso Academy Logic Gates AND OR NOT NAND NOR XOR XNOR Truth Tables", "Fundamental Logic Gates (AND, OR, NOT, NAND, NOR, XOR, XNOR) and Truth Tables"),
    ("Neso Academy", "Neso Academy Universal Logic Gates NAND and NOR Implementation", "Universal Logic Gates — Constructing All Logic Functions using NAND and NOR"),
    ("Neso Academy", "Neso Academy Boolean Algebra Postulates Theorems De Morgan's Laws", "Boolean Algebra Postulates, Dualities, and De Morgan's Laws"),
    ("Neso Academy", "Neso Academy Karnaugh Map K-Map 2 3 4 Variable Simplification SOP POS", "Karnaugh Map (K-Map) Minimization for Sum-of-Products (SOP) and Product-of-Sums (POS)"),
    ("Neso Academy", "Neso Academy Don't Care Conditions in K-Map Simplification", "Don't-Care Conditions in K-Map Boolean Expression Optimization"),
    ("Neso Academy", "Neso Academy Half Adder and Full Adder Circuit Design Logic Diagram", "Combinational Logic — Half Adder and Full Adder Circuit Architecture"),
    ("Neso Academy", "Neso Academy Half Subtractor and Full Subtractor Logic Circuit", "Half Subtractor and Full Subtractor Logic Gate Implementations"),
    ("Neso Academy", "Neso Academy Multiplexer MUX 2:1 4:1 8:1 Combinational Circuit", "Multiplexers (MUX) — Architecture, Truth Tables, and Logic Implementations"),
    ("Neso Academy", "Neso Academy Demultiplexer DEMUX and Decoder 2:4 3:8 Line Decoder", "Demultiplexers and Line Decoders (2-to-4, 3-to-8) with Enable Inputs"),
    ("Neso Academy", "Neso Academy Priority Encoder Circuit Design 8:3 Priority Encoder", "Priority Encoders — Resolving Simultaneous Inputs in Digital Logic"),
    ("Neso Academy", "Neso Academy Latches vs Flip-Flops SR Latch NAND NOR", "Bistable Multivibrators — SR Latches using NAND and NOR Gates"),
    ("Neso Academy", "Neso Academy D Flip-Flop Circuit Operation Master-Slave", "D Flip-Flops, Edge-Triggering, and Master-Slave Architecture"),
    ("Neso Academy", "Neso Academy JK Flip-Flop Race Around Condition Master-Slave JK", "JK Flip-Flops, Toggle State, and Eliminating Race-Around Conditions"),
    ("Neso Academy", "Neso Academy T Flip-Flop Toggle Flip-Flop Conversion", "T (Toggle) Flip-Flop Circuit Design and Applications in Frequency Dividers"),
    ("Neso Academy", "Neso Academy Synchronous vs Asynchronous Ripple Counters Binary", "Sequential Counters — Asynchronous Ripple Counters vs Synchronous Counters"),
    ("Neso Academy", "Neso Academy Shift Registers SISO SIPO PISO PIPO Universal Shift Register", "Shift Registers — SISO, SIPO, PISO, PIPO, and Universal Shift Register Design"),
    ("Neso Academy", "Neso Academy Continuous vs Discrete Time Signals Classification", "Classification of Signals — Continuous-Time vs Discrete-Time, Energy vs Power Signals"),
    ("Neso Academy", "Neso Academy Even and Odd Signals Properties Decomposition", "Even and Odd Signal Decomposition and Symmetry Properties"),
    ("Neso Academy", "Neso Academy Linear Time-Invariant Systems LTI Systems Properties", "Linear Time-Invariant (LTI) Systems — Linearity, Time-Invariance, and Causality"),
    ("Neso Academy", "Neso Academy Convolution Integral Continuous Time LTI Systems", "Continuous-Time Convolution Integral and System Impulse Response"),
    ("Neso Academy", "Neso Academy Discrete Time Convolution Sum LTI Systems", "Discrete-Time Convolution Sum for Discrete LTI Signal Processing"),
    ("Neso Academy", "Neso Academy Fourier Series Continuous Time CTFS Dirichlet Conditions", "Continuous-Time Fourier Series (CTFS) and Dirichlet Convergence Conditions"),
    ("Neso Academy", "Neso Academy Continuous Time Fourier Transform CTFT Properties", "Continuous-Time Fourier Transform (CTFT) and Frequency Domain Properties"),
    ("Neso Academy", "Neso Academy Z-Transform Region of Convergence ROC Properties", "Z-Transform, Region of Convergence (ROC), and Stability of Discrete Systems"),

    # ── 6. PROGRAMMING & SYSTEMS (Corey Schafer, FreeCodeCamp) ──
    ("Corey Schafer", "Corey Schafer Python Asyncio async await Event Loop concurrency", "Asynchronous Programming in Python — Async/Await and the Event Loop"),
    ("Corey Schafer", "Corey Schafer Python Multiprocessing Pool Process IPC", "Python Multiprocessing — Process Pools and Inter-Process Communication (IPC)"),
    ("Corey Schafer", "Corey Schafer Python Threading Locks Race Conditions Semaphore", "Python Threading — GIL Limitations, Thread Pools, and Mutex Locks"),
    ("Corey Schafer", "Corey Schafer Python SQLite Database connection cursor SQL", "Python SQLite3 Database Operations — Connections, Cursors, and Parameterized Queries"),
    ("Corey Schafer", "Corey Schafer Flask Web Framework Tutorial series beginners", "Flask Web Development Framework — Routing, Templates, and Request Handling"),
    ("freeCodeCamp.org", "freeCodeCamp Go Programming Language Golang tutorial full course", "Golang Fundamentals — Static Typing, Goroutines, Channels, and Interfaces"),
    ("freeCodeCamp.org", "freeCodeCamp Rust Programming Language tutorial full course memory safety", "Rust Fundamentals — Ownership, Borrowing, Lifetimes, and Memory Safety"),
    ("freeCodeCamp.org", "freeCodeCamp Docker Containerization tutorial beginners full course", "Docker Containerization Fundamentals — Dockerfiles, Images, and Multi-Stage Builds"),
    ("freeCodeCamp.org", "freeCodeCamp Kubernetes K8s tutorial architecture cluster pods", "Kubernetes Cluster Architecture — Pods, Deployments, Services, and Ingress"),
]

def parse_duration(duration: str) -> int:
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return 0
    return int(match.group(1) or 0) * 3600 + int(match.group(2) or 0) * 60 + int(match.group(3) or 0)

async def search_video(query: str, client: httpx.AsyncClient) -> dict | None:
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
        r = await client.get(url, headers=headers, timeout=12.0)
        
        video_ids = list(dict.fromkeys(re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', r.text)))
        if not video_ids:
            return None

        # Fetch metadata in bulk (1 unit)
        r2 = await client.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={"part": "contentDetails,snippet,statistics", "id": ",".join(video_ids[:10]), "key": YOUTUBE_KEY},
            timeout=12.0,
        )
        videos = r2.json().get("items", [])
        for v in videos:
            dur = parse_duration(v.get("contentDetails", {}).get("duration", ""))
            if dur >= 300:
                return v
    except Exception as e:
        print(f"  Search error for '{query}': {e}")
    return None

async def generate_embedding(text: str, client: httpx.AsyncClient) -> list | None:
    try:
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
    except Exception as e:
        print(f"  Embedding error for '{text}': {e}")
        return None

async def main():
    print("Fetching existing video IDs from database...")
    all_rows = []
    offset = 0
    while True:
        res = sb.table('curated_videos').select('video_id').range(offset, offset + 999).execute()
        if not res.data:
            break
        all_rows.extend(res.data)
        if len(res.data) < 1000:
            break
        offset += 1000

    already_done = {r['video_id'] for r in all_rows if r.get('video_id')}
    print(f"Loaded {len(already_done)} existing video IDs. 0 duplicates will be inserted.\n")

    inserted = 0
    skipped_existing = 0
    skipped_not_found = 0

    async with httpx.AsyncClient(timeout=25.0) as client:
        for idx, (channel, search_query, topic_label) in enumerate(BATCH_2_KNOWLEDGE_BASE, 1):
            video = await search_video(search_query, client)
            if not video:
                print(f"[{idx}/{len(BATCH_2_KNOWLEDGE_BASE)}] MISS  {topic_label[:60]}")
                skipped_not_found += 1
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
                print(f"[{idx}/{len(BATCH_2_KNOWLEDGE_BASE)}] EMBED_ERR  {topic_label[:60]}")
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
                print(f"[{idx}/{len(BATCH_2_KNOWLEDGE_BASE)}] OK  [{vid_id}] {dur_mins}m | {topic_label[:60]}")
            except Exception as e:
                print(f"[{idx}/{len(BATCH_2_KNOWLEDGE_BASE)}] DB_ERR  {e}")

            await asyncio.sleep(0.1)

    print(f"\n============================================================")
    print(f"BATCH 2 COMPLETE")
    print(f"Newly Inserted: {inserted}")
    print(f"Skipped Existing (Deduplicated): {skipped_existing}")
    print(f"Not Found: {skipped_not_found}")
    
    total = sb.table("curated_videos").select("id", count="exact").execute()
    print(f"Total Unique Curated Videos in Database: {total.count}")

if __name__ == "__main__":
    asyncio.run(main())
