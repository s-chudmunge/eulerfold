# EulerFold

<div align="center">
  <img src="frontend/public/android-chrome-512x512.png" alt="EulerFold" width="90">

  [![License](https://img.shields.io/github/license/s-chudmunge/eulerfold?style=for-the-badge&color=0F766E)](LICENSE)
  [![Stars](https://img.shields.io/github/stars/s-chudmunge/eulerfold?style=for-the-badge&color=0F766E)](https://github.com/s-chudmunge/eulerfold/stargazers)
  [![Forks](https://img.shields.io/github/forks/s-chudmunge/eulerfold?style=for-the-badge&color=0F766E)](https://github.com/s-chudmunge/eulerfold/network/members)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

  [Generate Course](https://www.eulerfold.com/) · [Explore Courses](https://www.eulerfold.com/explore) · [Research Lab](https://www.eulerfold.com/research-lab) · [Planner](https://www.eulerfold.com/planner)
</div>

---

### What is EulerFold?

Suppose you want to master a complex technical subject—say, distributed consensus, GPU kernel optimization, or async Python backend design. Traditional platforms present static video playlists. You watch videos passively, assume you understand the concepts, and then hit a wall when attempting to write real code.

EulerFold is a self-directed course generator and skill verification system. It turns your target subject or job description into a structured, multi-week curriculum, curates video lessons and web references, tests your understanding through diagnostic quizzes, and verifies your progress with AI-evaluated proof-of-work homework submissions.

---

### How it Works (The Pipeline)

EulerFold breaks down learning into a 5-step loop:

```
[ User Input / Job Goal ]
           │
           ▼
[ 1. Skill Gap Assessment ] ── (10-minute diagnostic quiz & AI evaluation)
           │
           ▼
[ 2. Course Generation ]    ── (Modules, topics, YouTube video matching & web reference fallback)
           │
           ▼
[ 3. Interactive Practice ] ── (MCQ sessions & topic-by-topic tracking)
           │
           ▼
[ 4. Technical Evaluation ] ── (1-pass AI code/submission reviewer with cooldowns)
           │
           ▼
[ 5. Verified Credentials ] ── (Calculated skill score + exportable PDF certificate with QR code)
```

1. **Skill Gap Assessment**: Take a 10-minute diagnostic test. The AI evaluates your answer accuracy and decides whether to run a deeper follow-up diagnostic round or proceed directly to generating your tailored course.
2. **Course Generation**: The backend builds a week-by-week curriculum. For each topic, it queries YouTube for tutorial videos (filtering by duration and title/description relevance) and falls back to an interactive web reference carousel when videos are unavailable.
3. **Interactive Practice**: Complete topic quizzes and practice sessions to test recall.
4. **Proof-of-Work Homework**: Submit your code or written explanation for module assignments. A technical AI reviewer evaluates your submission in a single pass (2-4 lines of analytical feedback). Failed attempts trigger a 10-minute cooldown before retaking.
5. **Skill Scoring**: Your overall score uses a fixed weighting formula:
   $$\text{Score} = 40\% \text{ (Homework Proof of Work)} + 30\% \text{ (Practice Score)} + 15\% \text{ (Topic Completion)} + 15\% \text{ (Concept Depth)}$$

---

### Key Components

- **[Skill Gap Analyzer](https://www.eulerfold.com/skill-gap-analyzer)**: Input a topic or job description to diagnose current knowledge gaps and generate a targeted course.
- **[Explore Directory](https://www.eulerfold.com/explore)**: Browse and clone existing courses created by the community.
- **[Learn Platform](https://www.eulerfold.com/dashboard)**: Topic workspace featuring video lessons, web reference carousels, transcripts, and progress tracking.
- **[Study Planner](https://www.eulerfold.com/planner)**: Schedule study tasks based on your weekly availability (Casual, Balanced, or Intense).
- **[Research Lab](https://www.eulerfold.com/research-lab)**: Read technical research breakdowns and take quick recall quizzes on underlying mechanisms.
- **[Verified Credentials](https://www.eulerfold.com/account)**: Public profile displaying verified badges and downloadable PDF certificates with QR verification.

---

### Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS v4, Lucide Icons.
- **Backend**: FastAPI (Python 3.11+), Uvicorn, Pydantic v2.
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth via Google Provider).
- **AI Models**: Google Gemini & OpenRouter for diagnostic evaluation and proof-of-work grading.
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
