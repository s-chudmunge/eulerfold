# EulerFold

<div align="center">
  <img src="frontend/public/android-chrome-512x512.png" alt="EulerFold" width="90">

  [![License](https://img.shields.io/github/license/s-chudmunge/eulerfold?style=for-the-badge&color=0F766E)](LICENSE)
  [![Stars](https://img.shields.io/github/stars/s-chudmunge/eulerfold?style=for-the-badge&color=0F766E)](https://github.com/s-chudmunge/eulerfold/stargazers)
  [![Forks](https://img.shields.io/github/forks/s-chudmunge/eulerfold?style=for-the-badge&color=0F766E)](https://github.com/s-chudmunge/eulerfold/network/members)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

  [Generate Roadmap](https://www.eulerfold.com/) · [Explore Roadmaps](https://www.eulerfold.com/explore) · [Research Decoded](https://www.eulerfold.com/research-decoded) · [Study Planner](https://www.eulerfold.com/planner)
</div>

---

### What is EulerFold?

Suppose you want to learn a complex technical subject—say, distributed consensus, GPU kernel optimization, or modern LLM inference architectures. Traditional platforms present disconnected videos without structure. Learning paths require manual curation. Knowledge gaps remain hidden.

EulerFold is a technical roadmap aggregator and learning platform. It takes your target subject, current background, and realistic timeframe, then constructs a personalized curriculum from verified video lectures, research papers, interactive checkpoints, and AI-guided problem sets.

---

### How it Works

EulerFold organizes learning into five integrated stages:

#### **Stage 1: Goal & Curriculum Initialization**
You specify *what* you want to learn, *why*, and *when*. Provide a topic, job description, URL, or even a syllabus.

The platform analyzes your inputs and creates a structured roadmap with topic sequencing, time estimates, and prerequisite chains.

**Example:** "Learn LLM inference optimization for production" → roadmap auto-generates modules on transformers, quantization, batching, and cache optimization in dependency order.

#### **Stage 2: Curated Lecture & Resource Matching**
For each topic, the system performs **semantic vector search** across 1,800+ verified educational lectures curated from top educators (MIT, Stanford, etc.).

If a perfect lecture match isn't found, it falls back to intelligent YouTube filtering (validated by duration, title relevance, and engagement signals).

Topics are enriched with research papers, primary documentation, and reference carousels—no cookie-cutter playlists.

**Example:** For "Transformer Attention Mechanisms," the system surfaces Andrej Karpathy's "Attention is All You Need" walkthrough alongside Hugging Face documentation and the original paper.

#### **Stage 3: Interactive Adaptive Checkpoints**
At the end of each topic, complete a **checkpoint quiz** that adapts difficulty based on your demonstrated comprehension.

Questions are dynamically generated to reinforce weak concepts and progressively unlock deeper topics. When you pass, the next module automatically unlocks.

**Features:**
- Concept mastery detection prevents advancement without understanding
- Multi-attempt support with cooldowns (Beginner-level attempts have 10-minute cooldowns)
- Real-time feedback from AI technical reviewer

#### **Stage 4: Proof-of-Work Homework & Technical Review**
Submit code implementations, mathematical derivations, or written analysis for graded assignments.

A **single-pass AI technical reviewer** provides 2–4 lines of concise, analytical feedback—no fluff, no generic encouragement. Only substantive evaluations.

Successful submissions (Solid/Developing ratings) automatically trigger skill score updates. Failed submissions ("Beginner") include a cooldown before retry.

**Example:** Submit a CUDA kernel for GPU optimization; receive: "Good thread block tuning. Missing shared memory optimization for 16KB+ data. See NVIDIA best practices guide p.8."

#### **Stage 5: Verified Credentials & Progress Tracking**
Your **Skill Score** is calculated via a fixed weighting formula:

$$\text{Score} = 40\% \text{ (Homework PoW)} + 30\% \text{ (Practice Score)} + 15\% \text{ (Topic Completion)} + 15\% \text{ (Concept Depth)}$$

Earn **EulerCoins** for completed assignments, maintain study streaks, and build your **personal study forest** (Grove) with a Pomodoro-style deep-work tracker.

Export a **QR-verified PDF credential** displaying your badges, completion date, and verifiable skill attestation—perfect for LinkedIn, portfolios, or job applications.

---

### End-to-End Visual Flow

```
┌─────────────────────────────────────────────────────┐
│  [1] User Goal Input                                │
│  "I want to learn GPU kernel optimization"          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  [2] Roadmap Generated                              │
│  └─ Module 1: CUDA Fundamentals & Memory Model      │
│  └─ Module 2: Thread Blocks & Shared Memory         │
│  └─ Module 3: Warp Optimization & Atomics           │
│  └─ Module 4: Real-World Kernel Design              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  [3] Learn & Practice                               │
│  ├─ Watch curated lectures (NVIDIA docs + YouTube)  │
│  ├─ Read reference papers & code samples            │
│  └─ Complete adaptive checkpoint quiz               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  [4] Submit Homework Assignment                     │
│  "Implement memory-coalesced matrix multiply"       │
│  AI Reviewer: "Correct coalescing pattern. Add      │
│               occupancy analysis for validation."   │
└──────────────────┬─────────────────────��────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  [5] Skill Score Updates & Credential Earned       │
│  ├─ Proof of Work: +8 points                        │
│  ├─ Skill Badge: "GPU Optimization (Intermediate)"  │
│  ├─ EulerCoins: +25 credited                        │
│  └─ QR-Verified PDF credential generated           │
└─────────────────────────────────────────────────────┘
```

---

### Key Components

- **[Roadmap Generator](https://www.eulerfold.com/#hero-prompt-input)**: Build custom roadmaps from text prompts, job descriptions, URLs, or syllabi.
- **[Explore Directory](https://www.eulerfold.com/explore)**: Browse and clone existing community roadmaps across computer science, math, and engineering.
- **[Learn Platform](https://www.eulerfold.com/dashboard)**: Topic workspace featuring verified lectures, interactive checkpoints, reference carousels, transcripts, and progress tracking.
- **[Goldfish AI Co-Pilot](https://www.eulerfold.com/dashboard)**: Companion for on-demand concept explanations, schedule creation, and daily briefings.
- **[Study Planner & Grove Pomodoro](https://www.eulerfold.com/planner)**: Schedule study tasks, track deep work blocks, and plant trees in your personal study forest upon session completion.
- **[Research Decoded](https://www.eulerfold.com/research-decoded)**: Read first-principles breakdowns of foundation research papers (e.g., Attention, DeepSeek-R1).
- **[Verified Credentials](https://www.eulerfold.com/account)**: Public profile displaying verified badges, EulerCoins balance, study streaks, and downloadable PDF certificates with QR verification.

---

### Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Backend**: FastAPI (Python 3.11+), Uvicorn, Pydantic v2.
- **Database & Vector Search**: Supabase (PostgreSQL + `pgvector` embedding index + Supabase Auth).
- **AI Models & Embeddings**: Google Gemini (`gemini-2.5-flash`, `gemini-embedding-2`), OpenRouter (BYOK), and WebGPU local browser inference.
- **PDF Generation**: ReportLab engine for credential export.
- **Email**: Resend for transactional alerts.

---

### Local Development

#### 1. Clone the Repository
```bash
git clone https://github.com/s-chudmunge/eulerfold.git
cd eulerfold
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r app/requirements.txt
```

Create a `.env` file inside `backend/`:
```env
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

Run the backend server:
```bash
uvicorn app.main:app --port 8080 --reload
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env.local` file inside `frontend/`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the Next.js development server:
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

### Database Triggers & Routing Notes

EulerFold relies on Supabase for data persistence and authentication.

- **Auto-Profile Creation**: A Postgres trigger (`on_auth_user_created`) automatically creates a row in `public.profiles` whenever a new user signs up.
- **Data Order Gotcha**: FastAPI routes match parameters in order. Static routes (e.g., `/roadmaps/me`, `/tasks/range`) must always be defined before dynamic parameterized routes (`/roadmaps/{id}`, `/tasks/{task_id}`). Reversing this order causes 422 validation errors.

---

### License

MIT License. See [LICENSE](LICENSE) for details.
