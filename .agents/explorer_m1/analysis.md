# Detailed Analysis Report: EulerFold Course Automation Pipeline

**Explorer M1** | **Working Directory:** `/home/sankalp/Documents/projects/eulerfold/.agents/explorer_m1`

---

## 1. Niche Courses Inspection (`niche_courses.csv`)

### 1.1 Line Count & Status Summary
- **File path:** `/home/sankalp/Documents/projects/eulerfold/niche_courses.csv`
- **Total lines:** 87 lines (Line 1 is header, Lines 2–86 are 85 course rows, Line 87 is empty line).
- **Total course rows:** 85 courses.
- **`[DONE]` courses count:** 17 courses (14 in contiguous block lines 2–15, plus 3 at lines 20, 24, 28).
- **Remaining courses count:** 68 courses remaining to be processed into blueprints and seeded.

### 1.2 List of 17 Completed (`[DONE]`) Courses
1. Line 2: `[DONE] Advanced RAG with pgvector & Hybrid Search`
2. Line 3: `[DONE] Writing Custom LLM Evaluators`
3. Line 4: `[DONE] Local LLM Inference (GGUF & llama.cpp)`
4. Line 5: `[DONE] Type-Safe Full-Stack with Next.js & FastAPI`
5. Line 6: `[DONE] Supabase Row Level Security Deep Dive`
6. Line 7: `[DONE] Distributed Consensus: Implementing Raft`
7. Line 8: `[DONE] Writing eBPF Programs for Linux Observability`
8. Line 9: `[DONE] LLM Inference Optimization (KV Cache & Batching)`
9. Line 10: `[DONE] Custom Shaders in React Three Fiber`
10. Line 11: `[DONE] WebAssembly Beyond the Browser`
11. Line 12: `[DONE] State Machines for Complex UI (XState)`
12. Line 13: `[DONE] Crafting DSLs (Domain Specific Languages) in Python`
13. Line 14: `[DONE] Rust FFI: Calling C from Rust Safely`
14. Line 15: `[DONE] Real-time Collaboration with CRDTs`
15. Line 20: `[DONE] Advanced PostgreSQL: Indexing Strategies (GIN & GiST & BRIN)`
16. Line 24: `[DONE] Implementing OAuth2 and OIDC from Scratch`
17. Line 28: `[DONE] Network Programming: Building a TCP Stack`

### 1.3 Categorized Remaining 68 Courses

#### Category 1: AI, ML & LLM Engineering (13 courses)
- Multi-Agent Orchestration Patterns (Line 21)
- Structured Output & Tool Calling for AI Agents (Line 26)
- Fine-tuning Vision-Language Models (Line 29)
- Physics-Informed Neural Networks (PINNs) (Line 31)
- Graph Neural Networks for Drug Discovery (Line 33)
- Fine-tuning Diffusion Models (DreamBooth & LoRA) (Line 43)
- Vector Search Internals: HNSW from Scratch (Line 50)
- RLHF & DPO: Aligning Language Models (Line 51)
- Prompt Engineering for Structured Retrieval (Line 66)
- Streaming LLM Responses: SSE & WebSockets in Production (Line 76)
- Building MCP Servers (Model Context Protocol) (Line 77)
- Adversarial Machine Learning: Attack & Defense (Line 80)
- Genetic Algorithms & Evolutionary Computation (Line 79)

#### Category 2: Systems, Compilers & Low-Level Engineering (11 courses)
- V8 Engine Internals: Hidden Classes & JIT (Line 23)
- Implementing B-Trees and LSM Trees from Scratch (Line 32)
- GPU Programming with CUDA (Line 37)
- Writing a Programming Language: Lexer to Interpreter (Line 40)
- Building a Toy OS Kernel in Rust (Line 53)
- Low-Latency Systems in C++ (Trading & Networking) (Line 55)
- Tree-sitter: Building Parsers for Code Intelligence (Line 58)
- Compiler Optimization Passes (SSA & Dead Code Elimination) (Line 69)
- Writing Async Runtimes (Tokio & Event Loops) (Line 73)
- Implementing a Key-Value Store (LSM & WAL) (Line 74)
- Writing a Garbage Collector (Line 85)

#### Category 3: Cloud, DevOps, Security & Infrastructure (23 courses)
- Building Custom Kubernetes Operators in Go (Line 16)
- Edge Computing with Cloudflare Workers (Line 19)
- Building Custom GitHub Actions (Line 25)
- Android Security: APK Reverse Engineering (Line 30)
- Web Scraping at Scale: Defenses & Countermeasures (Line 44)
- Memory Corruption Exploitation & Defense (Line 46)
- Fuzz Testing with AFL & LibFuzzer (Line 52)
- Reverse Engineering iOS Binaries (Mach-O & Frida) (Line 54)
- Modern Data Lakes: Apache Iceberg & Trino (Line 56)
- Continuous Profiling in Production (Line 57)
- OpenTelemetry: Distributed Tracing & Metrics (Line 59)
- Systems Design: Designing for Scale & Failure (Line 60)
- API Design: Building RESTful & GraphQL APIs That Last (Line 61)
- Nix & Reproducible Development Environments (Line 62)
- Formal Verification with TLA+ and Alloy (Line 65)
- Container Security: Escaping & Hardening Docker (Line 67)
- Database Migration Strategies Without Downtime (Line 68)
- Building a Search Engine: Inverted Indexes & TF-IDF (Line 70)
- Kubernetes Networking: CNI & Service Mesh Internals (Line 71)
- Linux Performance Tuning: perf & ftrace & bpftrace (Line 72)
- Financial Data Pipelines with dbt & Snowflake (Line 78)
- Building a Load Balancer from Scratch (Line 83)
- Infrastructure as Code: Pulumi vs Terraform Deep Dive (Line 84)

#### Category 4: Frontend, Graphics, Mobile & Design (11 courses)
- WebGPU: Next-Gen Browser Graphics (Line 18)
- Building Neovim Plugins in Lua (Line 22)
- Semantic Design Tokens & Themeable UI Systems (Line 27)
- Building Figma Plugins with the Canvas API (Line 38)
- Browser Audio: Building Synthesizers with Web Audio API (Line 39)
- React Server Components: How They Actually Work (Line 42)
- Building Browser Extensions (Manifest V3) (Line 47)
- React Native Performance: Hermes & Reanimated (Line 48)
- Accessible Web Development (WCAG Deep Dive) (Line 63)
- Advanced CSS: Layout Algorithms & Rendering Pipeline (Line 75)
- Functional Programming Patterns in TypeScript (Line 81)

#### Category 5: Networking, Protocols & Distributed Systems (4 courses)
- WebRTC: Peer-to-Peer Video from Scratch (Line 34)
- Git Internals: Objects & Plumbing Commands (Line 36)
- Event-Driven Architecture with Kafka (Line 41)
- Implementing BitTorrent from Scratch (Line 49)

#### Category 6: Niche Specialized Fields (6 courses)
- Zero-Knowledge Proofs: From Theory to Circom (Line 17)
- Applied Homomorphic Encryption (Line 35)
- Practical Quantum Computing with Qiskit (Line 45)
- Technical Writing for Engineers (Line 64)
- Digital Signal Processing for Audio Engineers (Line 82)
- Autonomous Drone Navigation with ROS2 (Line 86)

---

## 2. Backend Inspection & Seed Pipeline Analysis

### 2.1 Existing Seed Scripts
Located in `/home/sankalp/Documents/projects/eulerfold/backend`:
1. `seed_batch_1.py` (48 KB) - Seeds 2 courses: RAG Pipeline Engineering & LLM Inference Internals.
2. `seed_batch_2.py` (72 KB) - Seeds 10 courses: Custom LLM Evaluators, Local LLM Inference, Next.js+FastAPI, Supabase RLS, eBPF, R3F Shaders, Wasm, XState, Python DSLs, Rust FFI.
3. `seed_crdts.py` (17 KB) - Seeds 1 course: Real-time Collaboration with CRDTs.
4. `seed_raft.py` (5.5 KB) - Seeds 1 course: Distributed Consensus: Implementing Raft.

Total seeded roadmaps across these scripts = 14 courses.

### 2.2 Structure of `roadmaps` JSON Blueprint
Roadmaps are stored in Supabase `public.roadmaps` table in the `roadmap_plan` JSONB column.

```json
{
  "title": "Course Title",
  "description": "Comprehensive course description.",
  "subject": "AI Engineering",
  "modules": [
    {
      "id": "<uuid4>",
      "title": "Module Title",
      "description": "Deep dive into module content.",
      "outcome": "By the end of this module you will be able to...",
      "timeline": "Week 1",
      "proof_of_work_instructions": {
        "what_to_build": "Specific system, script, or model component to construct.",
        "what_counts_as_evidence": "Concrete evidence required for submission verification.",
        "eval_criteria": [
          "Criterion 1",
          "Criterion 2"
        ]
      },
      "resources": [
        {
          "title": "Documentation Title",
          "url": "https://example.com/docs",
          "type": "docs|article|video"
        }
      ],
      "topics": [
        {
          "id": "topic_1_1",
          "uuid": "<uuid4>",
          "title": "Topic Name",
          "description": "Topic details.",
          "youtube_search_query": "specific search string for video enrichment",
          "subtopics": [
            {
              "id": "<uuid4>",
              "title": "Subtopic Name"
            }
          ]
        }
      ]
    }
  ]
}
```

Key observations on schema fields:
- `uuid.uuid4()`: Generated as a 36-character string (`str(uuid.uuid4())`) for every module ID, topic UUID, and subtopic ID. This provides unique node identifiers across the course tree.
- `proof_of_work_instructions`: Every module must contain an explicit `what_to_build`, `what_counts_as_evidence`, and a list of `eval_criteria`. This feeds directly into the AI Technical Reviewer grading pass during homework submissions.
- `resources`: Initial array of documentation or reference links attached to each module.

### 2.3 `httpx` Link Verification Gate
`seed_batch_2.py` implements an asynchronous URL verification gate:

```python
async def verify_url(url):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            resp = await client.head(url, headers=headers, follow_redirects=True)
            if resp.status_code < 400:
                return True
            resp = await client.get(url, headers=headers, follow_redirects=True)
            return resp.status_code < 400
    except Exception:
        return False
```

Before inserting into Supabase, `seed_batch_2.py` loops over all resource links in each module and strips out broken URLs where `verify_url` returns `False`.

### 2.4 Enrichment Scripts Analysis

#### A. `smart_video_enrich.py`
- **Execution Command:** `python smart_video_enrich.py <roadmap_id>`
- **Dependencies:** `httpx`, `yt_dlp`, `app.core.supabase_client`, `app.core.config.settings` (requires `YOUTUBE_API_KEY`).
- **Pipeline Architecture:**
  1. Candidate pool generation: Runs 4 search strategies via `yt_dlp` (`ytsearch25:`) to gather video IDs without triggering scraping blocks (broad course search, title search, per-module search, per-topic `youtube_search_query`).
  2. Batch metadata query: Calls official Google YouTube Data API v3 (`/youtube/v3/videos`) in batches of 50 to get duration, view count, snippet, and channel title.
  3. Strict filtering: Rejects non-English/Cyrillic/CJK titles and negative keywords (games, vlogs, etc.). Enforces duration between 8 and 60 minutes (`MIN_DURATION_MINUTES = 8`, `MAX_DURATION_MINUTES = 60`).
  4. Relevancy scoring: Weighted keyword scoring on title (3.0x weight), description/tags (1.0x), course keywords, channel trust bonus (+5.0 pts for recognized technical channels like MIT OpenCourseWare, Stanford Online, ByteByteGo, Hussein Nasser, Martin Kleppmann, etc.), and normalized view count bonus (+0 to +3 pts). Minimum score threshold is 2.0.
  5. DB update: Assigns `youtube_video_id`, `youtube_video_title`, and `duration` to each topic in `roadmap_plan` and updates Supabase.

#### B. `smart_resource_enrich.py`
- **Execution Command:** `python smart_resource_enrich.py <roadmap_id>`
- **Dependencies:** `duckduckgo_search` / `ddgs`, `app.core.supabase_client`, `dotenv`.
- **Pipeline Architecture:**
  1. Fetches roadmap by `roadmap_id`.
  2. For each module, uses `optimal_search_query` or constructs `"{subject} {module_title} documentation tutorial"`.
  3. Queries DuckDuckGo for top 3 search results, filtering out YouTube domain links.
  4. Overwrites `module['resources']` with live web articles/documentation links.
  5. Updates `roadmaps` table in Supabase.

---

## 3. Environment Setup & Readiness Verification

### 3.1 Environment File (`/home/sankalp/Documents/projects/eulerfold/backend/.env`)
- `SUPABASE_URL`: `https://yddnqnbpnrjnhwzhmlht.supabase.co`
- `SUPABASE_KEY` & `SUPABASE_SERVICE_KEY`: Service role JWT keys present.
- `YOUTUBE_API_KEY`: Configured (`AIzaSy...`).
- `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY`: All present.
- `DATABASE_URL`: Postgres connection string present.

### 3.2 Python Virtual Environment (`/home/sankalp/Documents/projects/eulerfold/backend/venv`)
- **Python version:** 3.14.4 (configured via `/usr/bin/python3.14` in `pyvenv.cfg`).
- **Verified Installed Site-Packages:**
  - `httpx` (v0.28.1)
  - `supabase` (v2.31.0)
  - `yt_dlp` (v2026.7.4)
  - `duckduckgo_search` (v8.1.1) & `ddgs` (v9.14.4)
  - `fastapi` (v0.137.0)
  - `pydantic` (v2.13.4)
  - `reportlab` (v4.5.1)
  - `sqlalchemy`, `asyncpg`, `redis`, `cohere`, `google_genai`, etc.

The environment is fully populated with all required dependencies for seeding and enrichment.
