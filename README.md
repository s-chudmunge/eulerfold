# EulerFold

<div align="center">
  <img src="frontend/public/android-chrome-512x512.png" alt="EulerFold" width="160">
</div>

EulerFold is a simple tool to help you actually learn things. Most people just collect links and bookmarks but never get anything done. This app builds you a path and makes sure you follow it.

## How it works

The core idea is to move from "reading" to "doing".

1. **Plan**: You type in a goal (like "Quantum Physics" or "React"). A model builds a week-by-week curriculum for you.
2. **Schedule**: Use the **Study Planner** to generate tasks based on your intensity (Casual, Balanced, or Intense).
3. **Research**: Explore **Research Decoded** to master technical papers and breakthroughs.
4. **Build**: Use **BuildPilot** for manual projects and tracking missions outside of generated roadmaps.
5. **Practice**: You get questions for every topic. You have to answer them to move on.
6. **Proof**: At the end, you upload your work (images, code, or PDFs). We check if your work actually hits the goals. 
7. **Profile**: Your progress is tracked on a public page. You can export your **Earned Record** as a verified PDF with a QR code.

## Tech

I tried to keep the plumbing as clean as possible:

- **Frontend**: Next.js + Tailwind v4. High density, simple layout.
- **Backend**: FastAPI (Python). It's a basic state machine for your learning path.
- **Logic**: Google Gemini. It generates the paths and reviews your proof of work.
- **Database**: Supabase for the data and auth.
- **Payments**: Razorpay for Pro access and roadmap credits.
- **PDFs**: We generate your credentials on the server using `reportlab`.

## Key bits

- **Progress weight**: We don't just track clicks. Your score is 40% Proof of Work, 30% Practice, 15% Topic Completion, and 15% Concept Depth.
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
