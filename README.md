# EulerFold

<div align="center">
  <img src="frontend/public/android-chrome-512x512.png" alt="EulerFold" width="160">
</div>

EulerFold is a simple tool to help you actually learn things. Most people just collect links and bookmarks but never get anything done. This app builds you a path and makes sure you follow it.

## How it works

The core idea is to move from "reading" to "doing".

1. **Plan**: You type in a goal (like "Quantum Physics" or "React"). A model builds a week-by-week curriculum for you.
2. **Learn**: You get curated videos and objectives. No fluff, just the core stuff.
3. **Practice**: You get questions for every topic. You have to answer them to move on.
4. **Proof**: At the end, you upload your work (images, code, or PDFs). We check if your work actually hits the goals. 
5. **Profile**: Your progress is tracked on a public page. It's a real record of what you've built, not just a list of courses you watched.

## Tech

I tried to keep the plumbing as clean as possible:

- **Frontend**: Next.js + Tailwind. High density, simple layout.
- **Backend**: FastAPI (Python). It's a basic state machine for your learning path.
- **Logic**: Google Gemini. It generates the paths and reviews your proof of work.
- **Database**: Supabase for the data and auth.
- **PDFs**: We generate your credentials on the server using `reportlab`.

## Key bits

- **Progress weight**: We don't just track clicks. Your score is 40% practice, 40% topics, and 20% your actual project proof. It's hard to fake.
- **Auditor**: If the model thinks your proof is bad, you can dispute it. A second pass checks if the first one was too harsh.
- **Streaks & Coins**: Small things to keep you coming back every day.
- **Search**: A fast way to find roadmaps or exam papers from others.

## Setup

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r app/requirements.txt
# Put your SUPABASE and GEMINI keys in .env
uvicorn main:app --port 8080 --reload
```

### Frontend
```bash
cd frontend
npm install
# Put your API URL in .env.local
npm run dev
```

---
Stop collecting links. Start building things.
