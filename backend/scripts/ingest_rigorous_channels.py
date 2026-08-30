"""
Curated Mass Ingestion of Top Rigorous Technical Channels.

Channels included:
- Gate Smashers (Theory of Computation, Automata, Compiler Design)
- Arpit Bhayani & Gaurav Sen (System Design, Distributed Systems, LSM Trees, Bloom Filters)
- TechWorld with Nana (Docker, Kubernetes, CI/CD, Terraform)
- Traversy Media & Web Dev Simplified (TypeScript, JavaScript Internals, React Hooks)
- Michel van Biezen (Advanced Physics, Circuit Analysis: Thevenin/Norton, Thermodynamics)
- BlackPenRedPen & Mathologer (Advanced Calculus, Residue Theorem, Gaussian Integrals)
- Krish Naik (RAG, LangChain, HuggingFace, MLOps, Statistics)
"""

import os
import asyncio
import httpx
import re
import urllib.parse
import sys

load_dotenv = None
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
except Exception:
    pass

from supabase import create_client

sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
GEMINI_KEY = os.getenv('GEMINI_API_KEY')
YOUTUBE_KEY = os.getenv('YOUTUBE_API_KEY')

def parse_iso8601_duration(duration: str) -> int:
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return 0
    return int(match.group(1) or 0) * 3600 + int(match.group(2) or 0) * 60 + int(match.group(3) or 0)

RIGOROUS_KNOWLEDGE_BANK = [
    # ── 1. THEORY OF COMPUTATION & COMPILER DESIGN (Gate Smashers) ──
    ("Gate Smashers", "Gate Smashers Deterministic Finite Automata DFA introduction examples", "Deterministic Finite Automata (DFA) — States, Transitions, and Language Acceptance"),
    ("Gate Smashers", "Gate Smashers Non-Deterministic Finite Automata NFA conversion DFA", "Nondeterministic Finite Automata (NFA) and Subset Construction to DFA"),
    ("Gate Smashers", "Gate Smashers Regular Expressions to Finite Automata Thompson's construction", "Regular Expressions to Finite Automata Conversion via Thompson's Construction"),
    ("Gate Smashers", "Gate Smashers Pumping Lemma for Regular Languages proof non-regular", "Pumping Lemma for Proving Non-Regularity of Languages"),
    ("Gate Smashers", "Gate Smashers Context-Free Grammars CFG derivations parse tree", "Context-Free Grammars (CFG) — Derivation Trees and Ambiguity"),
    ("Gate Smashers", "Gate Smashers Chomsky Normal Form CNF conversion CFG", "Chomsky Normal Form (CNF) and Grammar Simplification"),
    ("Gate Smashers", "Gate Smashers Pushdown Automata PDA deterministic non-deterministic", "Pushdown Automata (PDA) — Stack Operations and Context-Free Language Acceptance"),
    ("Gate Smashers", "Gate Smashers Turing Machine introduction formal definition transition function", "Turing Machine Architecture, Tape Transitions, and Computability"),
    ("Gate Smashers", "Gate Smashers Halting Problem of Turing Machine undecidability proof", "The Halting Problem and Undecidability Proof via Diagonalization"),
    ("Gate Smashers", "Gate Smashers Chomsky Hierarchy Types of Grammars Type 0 1 2 3", "Chomsky Hierarchy of Formal Grammars and Automata Equivalences"),
    ("Gate Smashers", "Gate Smashers Compiler Design Phases of Compiler Lexical Syntax Semantic", "Phases of a Compiler — Lexical, Syntax, Semantic, and Code Generation"),
    ("Gate Smashers", "Gate Smashers Lexical Analysis Tokenization Lexical Errors Symbol Table", "Lexical Analysis — Token Recognition and Symbol Table Management"),
    ("Gate Smashers", "Gate Smashers First and Follow Sets in Compiler Design LL 1 Parsing", "Computation of FIRST and FOLLOW Sets for LL(1) Parsers"),
    ("Gate Smashers", "Gate Smashers LL 1 Parsing Table Construction non-recursive predictive parsing", "LL(1) Predictive Parsing Table Construction and Grammar Conflict Resolution"),
    ("Gate Smashers", "Gate Smashers LR 0 Parsing Table LR Parser Bottom Up Parsing", "LR(0) Item Sets and Shift-Reduce Parsing in Bottom-Up Compilers"),
    ("Gate Smashers", "Gate Smashers SLR 1 Parsing Table Construction", "Simple LR (SLR 1) Parsing Table Construction and Conflict Handling"),
    ("Gate Smashers", "Gate Smashers Syntax Directed Translation SDT Attributes S-attributed L-attributed", "Syntax-Directed Translation (SDT) — Synthesized and Inherited Attributes"),
    ("Gate Smashers", "Gate Smashers Intermediate Code Generation Three Address Code Quadruples Triples", "Intermediate Code Generation — Three-Address Code (TAC) and Quadruples"),
    ("Gate Smashers", "Gate Smashers Code Optimization Techniques Basic Blocks Flow Graphs", "Code Optimization — Basic Blocks, Control Flow Graphs, and Common Subexpression Elimination"),

    # ── 2. ADVANCED SYSTEM DESIGN & DISTRIBUTED SYSTEMS (Arpit Bhayani, Gaurav Sen) ──
    ("Arpit Bhayani", "Arpit Bhayani LSM Tree Log Structured Merge Tree database storage engine", "Log-Structured Merge-Tree (LSM Tree) Internals and Write-Heavy Workloads"),
    ("Arpit Bhayani", "Arpit Bhayani Bloom Filters probabilistic data structure hash functions", "Bloom Filters — Probabilistic Membership Queries and False Positive Rates"),
    ("Arpit Bhayani", "Arpit Bhayani Database Replication Master Slave Multi Master Quorum Consensus", "Distributed Database Replication — Leader-Follower, Multi-Leader, and Quorum Consensus"),
    ("Arpit Bhayani", "Arpit Bhayani Raft Consensus Algorithm Leader Election Log Replication", "Raft Consensus Protocol — Leader Election, Log Replication, and Safety Invariants"),
    ("Arpit Bhayani", "Arpit Bhayani How B-Trees work database indexing storage engine", "B-Tree Node Splitting, Search Complexity, and On-Disk Page Layout"),
    ("Arpit Bhayani", "Arpit Bhayani Redis Internal Architecture Single Threaded Event Loop IO Multiplexing", "Redis Internal Architecture — Single-Threaded Event Loop and I/O Multiplexing"),
    ("Gaurav Sen", "Gaurav Sen Distributed Caching System Design Redis Memcached eviction policies", "Distributed Caching Architecture, Cache Aside, and Eviction Policies (LRU/LFU)"),
    ("Gaurav Sen", "Gaurav Sen Database Sharding Horizontal Partitioning Routing Key", "Database Sharding Architectures, Range vs Hash Partitioning, and Query Routing"),
    ("Gaurav Sen", "Gaurav Sen System Design WhatsApp Messenger Real-Time Messaging Architecture", "System Design — Real-Time Scalable Messaging Architecture (WhatsApp/Slack)"),
    ("Gaurav Sen", "Gaurav Sen System Design Netflix Video Streaming Content Delivery Network CDN", "System Design — High-Scale Video Streaming and CDN Architecture (Netflix)"),

    # ── 3. DEVOPS, CONTAINERIZATION & CLOUD INFRASTRUCTURE (TechWorld with Nana) ──
    ("TechWorld with Nana", "TechWorld with Nana Docker Tutorial for Beginners What is Docker container image", "Docker Architecture — Containers, Images, Docker Daemon, and Registries"),
    ("TechWorld with Nana", "TechWorld with Nana Dockerfile instructions build run best practices", "Writing Production Dockerfiles — Layer Caching and Multi-Stage Builds"),
    ("TechWorld with Nana", "TechWorld with Nana Docker Compose tutorial multi container yaml", "Docker Compose Multi-Container Orchestration and Networking"),
    ("TechWorld with Nana", "TechWorld with Nana Kubernetes Architecture Master Node Worker Node API Server", "Kubernetes Control Plane Architecture — API Server, etcd, Kubelet, and Controller Manager"),
    ("TechWorld with Nana", "TechWorld with Nana Kubernetes Pods Deployments Services Ingress tutorial", "Kubernetes Core Resources — Pods, Deployments, Services (ClusterIP/NodePort), and Ingress"),
    ("TechWorld with Nana", "TechWorld with Nana Kubernetes ConfigMap and Secret volume mounting", "Kubernetes Configuration Management — ConfigMaps and Secrets"),
    ("TechWorld with Nana", "TechWorld with Nana Terraform Tutorial for Beginners Infrastructure as Code IaC", "Terraform Infrastructure as Code (IaC) — State Files, Providers, and Resources"),
    ("TechWorld with Nana", "TechWorld with Nana CI CD Pipeline Explained Jenkins GitHub Actions", "CI/CD Pipeline Architecture — Automated Testing, Building, and Continuous Deployment"),

    # ── 4. WEB PROTOCOLS, TYPESCRIPT & JAVASCRIPT INTERNALS (Web Dev Simplified, Traversy Media) ──
    ("Web Dev Simplified", "Web Dev Simplified JavaScript Event Loop Microtasks Macrotasks Call Stack", "JavaScript Runtime Engine — Call Stack, Event Loop, Microtasks, and Macrotasks"),
    ("Web Dev Simplified", "Web Dev Simplified JavaScript Closures explained practical examples", "JavaScript Closures, Lexical Scoping, and Memory Retention"),
    ("Web Dev Simplified", "Web Dev Simplified JavaScript Promises Async Await error handling", "Asynchronous JavaScript — Promises, Async/Await, and Microtask Resolution"),
    ("Web Dev Simplified", "Web Dev Simplified React useState useEffect Custom Hooks complete guide", "React State and Lifecycle — useState, useEffect, and Dependency Arrays"),
    ("Web Dev Simplified", "Web Dev Simplified React useMemo and useCallback performance optimization", "React Performance Optimization — useMemo and useCallback Memoization"),
    ("Web Dev Simplified", "Web Dev Simplified React useContext useReducer state management", "React State Management — useContext and useReducer Patterns"),
    ("Web Dev Simplified", "Web Dev Simplified TypeScript Tutorial for Beginners Types Interfaces Generics", "TypeScript Fundamentals — Type Annotations, Interfaces, Generics, and Union Types"),
    ("Traversy Media", "Traversy Media TypeScript Crash Course Generics Enums Interfaces", "TypeScript Architecture — Static Typing, Type Inference, Enums, and Utility Types"),
    ("Traversy Media", "Traversy Media Node.js Crash Course Core Modules File System HTTP Events", "Node.js Core Architecture — V8 Engine, Libuv, Event Emitter, and File System (fs)"),

    # ── 5. CIRCUIT ANALYSIS & ADVANCED PHYSICS (Michel van Biezen / iLectureOnline) ──
    ("Michel van Biezen", "Michel van Biezen Circuit Analysis Thevenin's Theorem equivalent circuit", "Thevenin's Theorem — Calculating Thevenin Voltage (Vth) and Resistance (Rth)"),
    ("Michel van Biezen", "Michel van Biezen Circuit Analysis Norton's Theorem equivalent circuit", "Norton's Theorem — Short-Circuit Current (In) and Norton Resistance Calculation"),
    ("Michel van Biezen", "Michel van Biezen Circuit Analysis Maximum Power Transfer Theorem proof", "Maximum Power Transfer Theorem in Direct Current Circuits"),
    ("Michel van Biezen", "Michel van Biezen Circuit Analysis Mesh Current Analysis Kirchhoff Voltage Law", "Mesh Current Circuit Analysis Method Using Kirchhoff's Voltage Law"),
    ("Michel van Biezen", "Michel van Biezen Circuit Analysis Node Voltage Analysis Nodal Analysis", "Nodal Voltage Circuit Analysis Method Using Kirchhoff's Current Law"),
    ("Michel van Biezen", "Michel van Biezen Circuit Analysis Superposition Theorem dependent sources", "Superposition Theorem for Linear Multi-Source Circuits"),
    ("Michel van Biezen", "Michel van Biezen Fluid Mechanics Viscosity Poiseuille's Law laminar flow", "Fluid Viscosity, Shear Stress, and Poiseuille's Law for Laminar Pipe Flow"),
    ("Michel van Biezen", "Michel van Biezen Thermodynamics Carnot Cycle P-V Diagram Efficiency", "Thermodynamic Carnot Cycle — Isothermal and Adiabatic Stages on P-V Diagrams"),
    ("Michel van Biezen", "Michel van Biezen Thermodynamics Clausius-Clapeyron Equation phase transition", "The Clausius-Clapeyron Equation and Phase Boundary Thermodynamics"),
    ("Michel van Biezen", "Michel van Biezen Quantum Physics Photoelectric Effect Einstein equation", "Quantum Photoelectric Effect and Stopping Potential Analysis"),
    ("Michel van Biezen", "Michel van Biezen Quantum Physics Compton Scattering Compton Shift wavelength", "Compton Scattering Effect — Photon-Electron Collisions and Wavelength Shift"),

    # ── 6. ADVANCED MATHEMATICS & CALCULUS (blackpenredpen, Mathologer) ──
    ("blackpenredpen", "blackpenredpen Gaussian Integral integral e^(-x^2) polar coordinates proof", "The Gaussian Integral (∫e^(-x²)dx) Evaluated via Polar Coordinates"),
    ("blackpenredpen", "blackpenredpen Gamma Function definition derivation factorial extension", "The Gamma Function (Γ(z)) — Definition, Properties, and Analytic Continuation of Factorials"),
    ("blackpenredpen", "blackpenredpen Laplace Transform of Derivatives and Integrals formula", "Laplace Transforms of Function Derivatives and Definite Integrals"),
    ("blackpenredpen", "blackpenredpen Complex Numbers Euler's Formula e^(ix) geometric proof", "Euler's Formula (e^(iθ) = cosθ + i sinθ) and Complex Exponential Geometry"),
    ("blackpenredpen", "blackpenredpen Complex Integration Cauchy Integral Formula residue theorem", "Cauchy's Integral Theorem and the Residue Theorem in Complex Analysis"),
    ("Mathologer", "Mathologer Basel Problem Euler proof sum 1/n^2 pi^2/6", "The Basel Problem (∑ 1/n² = π²/6) — Euler's Sinc Function Product Proof"),
    ("Mathologer", "Mathologer Riemann Hypothesis primes zeta function zeros visual", "The Riemann Hypothesis, Analytic Continuation of the Zeta Function, and Non-Trivial Zeros"),

    # ── 7. PRACTICAL AI & RAG ARCHITECTURES (Krish Naik) ──
    ("Krish Naik", "Krish Naik LangChain Tutorial Beginners LLM Chains PromptTemplates", "LangChain Framework Architecture — Chains, PromptTemplates, and Model Wrappers"),
    ("Krish Naik", "Krish Naik Retrieval Augmented Generation RAG pipeline ChromaDB FAISS", "Retrieval-Augmented Generation (RAG) Architecture with Vector Databases (Chroma/FAISS)"),
    ("Krish Naik", "Krish Naik Hugging Face Transformers Pipelines Tokenizers fine tuning", "HuggingFace Transformers Ecosystem — Pipelines, AutoModel, and Tokenizers"),
    ("Krish Naik", "Krish Naik Quantization LLMs BitsAndBytes GGUF AWQ 4-bit 8-bit", "Large Language Model Quantization — 4-bit/8-bit Quantization with BitsAndBytes and GGUF"),
    ("Krish Naik", "Krish Naik MLOps pipeline MLflow model tracking deployment", "MLOps Lifecycle Management — Experiment Tracking and Model Registry with MLflow"),
]

async def search_video(query: str, client: httpx.AsyncClient) -> dict | None:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
        r = await client.get(url, headers=headers, timeout=12.0)
        video_ids = list(dict.fromkeys(re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', r.text)))
        if not video_ids:
            return None

        r2 = await client.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={"part": "contentDetails,snippet,statistics", "id": ",".join(video_ids[:5]), "key": YOUTUBE_KEY},
            timeout=12.0,
        )
        videos = r2.json().get("items", [])
        for v in videos:
            dur = parse_iso8601_duration(v.get("contentDetails", {}).get("duration", ""))
            if dur >= 300:
                return v
    except Exception as e:
        print(f"  Search error for '{query}': {e}")
    return None

async def generate_embedding(text: str, client: httpx.AsyncClient) -> list | None:
    try:
        r = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={GEMINI_KEY}",
            json={"model": "models/gemini-embedding-2", "outputDimensionality": 768, "content": {"parts": [{"text": text}]}},
            timeout=15.0,
        )
        return r.json().get("embedding", {}).get("values") if r.status_code == 200 else None
    except Exception as e:
        print(f"  Embedding error: {e}")
        return None

async def main():
    # Load all existing video IDs to guarantee 0 duplication
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
    print(f"Loaded {len(already_done)} existing videos. Starting batch of {len(RIGOROUS_KNOWLEDGE_BANK)} new topics...\n")

    inserted = 0
    skipped_existing = 0
    skipped_not_found = 0

    async with httpx.AsyncClient(timeout=25.0) as client:
        for idx, (channel, query, topic_label) in enumerate(RIGOROUS_KNOWLEDGE_BANK, 1):
            video = await search_video(query, client)
            if not video:
                print(f"[{idx}/{len(RIGOROUS_KNOWLEDGE_BANK)}] MISS  {topic_label[:60]}")
                skipped_not_found += 1
                await asyncio.sleep(0.1)
                continue

            vid_id = video["id"]
            if vid_id in already_done:
                skipped_existing += 1
                await asyncio.sleep(0.05)
                continue

            title = video["snippet"]["title"]
            dur_mins = parse_iso8601_duration(video["contentDetails"]["duration"]) // 60

            embedding = await generate_embedding(topic_label, client)
            if not embedding:
                print(f"[{idx}/{len(RIGOROUS_KNOWLEDGE_BANK)}] EMBED_ERR  {topic_label[:60]}")
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
                print(f"[{idx}/{len(RIGOROUS_KNOWLEDGE_BANK)}] OK  [{vid_id}] {dur_mins}m | {channel}: {topic_label[:55]}")
            except Exception as e:
                print(f"[{idx}/{len(RIGOROUS_KNOWLEDGE_BANK)}] DB_ERR  {e}")

            await asyncio.sleep(0.1)

    print(f"\n============================================================")
    print(f"RIGOROUS BATCH COMPLETE")
    print(f"Newly Inserted: {inserted}")
    print(f"Skipped Existing (Deduplicated): {skipped_existing}")
    print(f"Not Found: {skipped_not_found}")
    
    total = sb.table("curated_videos").select("id", count="exact").execute()
    print(f"Total Unique Curated Videos in Database: {total.count}")

if __name__ == "__main__":
    asyncio.run(main())
EOF
