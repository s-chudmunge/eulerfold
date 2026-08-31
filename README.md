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

Suppose you want to learn a complex technical subject—say, distributed consensus, GPU kernel optimization, or modern LLM inference architectures. Traditional platforms present disconnected video playlists or surface-level tutorials. You watch passively, assume you understand the concepts, and hit a wall when attempting to write real code.

EulerFold is a technical roadmap aggregator and learning platform. It takes your target subject, current background, and realistic timeframe, and pulls together video lectures from top educators, research papers, technical blogs, and official documentation into a structured, step-by-step path. It pairs this with diagnostic exercises and AI-evaluated proof-of-work submissions to test your understanding.

---

### How it Works (The Pipeline)

EulerFold organizes learning into a 5-step loop:

```
[ User Goal & Background ]
           │
           ▼
[ 1. Diagnostic / Intent Input ] ── (Target topic, experience level & realistic timeline)
           │
           ▼
[ 2. Roadmap Generation ]        ── (Curated pgvector semantic video matching, docs & web references)
           │
           ▼
[ 3. Interactive Practice ]      ── (MCQ recall sessions & concept depth tracking)
           │
           ▼
[ 4. Technical Evaluation ]      ── (1-pass AI code/submission reviewer with cooldowns)
           │
           ▼
[ 5. Verified Credentials ]      ── (Calculated skill score + exportable PDF certificate with QR code)
```

1. **Goal & Background Input**: Specify what you want to learn, your starting level, and a target timeframe.
2. **Roadmap Generation**: The backend builds a week-by-week roadmap. For each topic, it performs pgvector semantic search against 1,800+ verified educational lectures (falling back to YouTube search filtered strictly to trusted channels), accompanied by documentation and paper references.
3. **Interactive Practice**: Complete topic quizzes and practice sessions to test recall.
4. **Proof-of-Work Homework**: Submit your code or written derivation for module assignments. A technical AI reviewer evaluates your submission in a single pass (2–4 lines of analytical feedback). Failed attempts enforce a 10-minute cooldown before retaking.
5. **Skill Scoring**: Your overall score uses a fixed weighting formula:
   $$\text{Score} = 40\% \text{ (Homework Proof of Work)} + 30\% \text{ (Practice Score)} + 15\% \text{ (Topic Completion)} + 15\% \text{ (Concept Depth)}$$

---

### Key Components

- **[Roadmap Generator](https://www.eulerfold.com/#hero-prompt-input)**: Build custom roadmaps from text prompts, job descriptions, URLs, or syllabi.
- **[Explore Directory](https://www.eulerfold.com/explore)**: Browse and clone existing community roadmaps across computer science, math, and engineering.
- **[Learn Platform](https://www.eulerfold.com/dashboard)**: Topic workspace featuring verified lectures, interactive reference carousels, transcripts, and progress tracking.
- **[Study Planner](https://www.eulerfold.com/planner)**: Schedule study tasks based on your weekly availability (Casual, Balanced, or Intense).
- **[Research Decoded](https://www.eulerfold.com/research-decoded)**: Read first-principles breakdowns of foundation research papers (e.g. Attention, DeepSeek-R1).
- **[Verified Credentials](https://www.eulerfold.com/account)**: Public profile displaying verified badges and downloadable PDF certificates with QR verification.

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
- **Data Order Gotcha**: FastAPI routes match parameters in order. Static routes (e.g. `/roadmaps/me`, `/tasks/range`) must always be defined before dynamic parameterized routes (`/roadmaps/{id}`, `/tasks/{task_id}`).

---

### License

MIT License. See [LICENSE](LICENSE) for details.
