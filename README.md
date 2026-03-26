# EulerFold Interactive AI Based Learning

<div align="center">
  <img src="frontend/public/android-chrome-512x512.png" alt="EulerFold" width="200">
</div>

**EulerFold** is an intelligent, high-integrity platform designed to turn your learning goals into structured, actionable roadmaps. It goes beyond simple content curation by implementing a "Honest Progress" engine that verifies skill mastery through AI-evaluated practice and multimodal Proof of Work submissions.

## Description

EulerFold is built for students and lifelong learners who want to stop "collecting" links and start mastering skills. By leveraging Google Gemini's advanced AI, the platform generates personalized curriculums tailored to your specific subject, goal, and prior experience. Every roadmap is a living entity, providing unit-by-unit guidance, curated YouTube tutorials, and interactive practice sessions. The core philosophy is "Slow and steady wins the skill," represented by our turtle mascot, ensuring that progress is deep, verified, and permanent.

## Technologies

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI**: [Google Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Email**: [Resend](https://resend.com/)
- **PDF Generation**: `reportlab`
- **Testing**: `pytest` (33+ unit tests)

### Infrastructure
- **Deployment**: Vercel (Frontend) + Render (Backend)
- **Automation**: GitHub Actions for daily progress check-ins

## Features

- **Personalized Roadmaps**: AI-generated curriculums based on your goals and experience level.
- **Interactive Learning Hub**: Focused unit-by-unit player with YouTube integration and filtered, high-quality resources.
- **AI-Powered Practice**: Instant, context-aware practice problems generated for every topic.
- **Honest Progress Engine**: A multi-signal weighting system (40% Topic Completion, 40% Practice Score, 20% Proof of Work) to prevent fake progress.
- **Proof of Work (PoW)**: Multimodal evidence submission (Base64 images, PDFs, text, or links) with AI evaluation.
- **Senior Auditor Dispute System**: AI-driven dispute logic for re-evaluating rejected submissions.
- **Public Skill Profiles**: Verified confidence scores displayed at `eulerfold.com/u/[username]`.
- **Integrity PDF Export**: Server-side generated, tamper-proof PDFs of your skill profile.
- **EulerCoins & Streaks**: Gamified experience to encourage consistent learning habits.
- **Explore Gallery**: Compact, searchable hub to discover and clone community roadmaps.
- **Weekly Check-ins**: Automated email reminders with active recall questions.

## The Process & Learning Flows

1. **Onboarding**: Users sign up via Google (Supabase Auth). A database trigger automatically initializes their public profile and coin balance.
2. **Roadmap Generation**: Users input a topic. Gemini generates a structured 4-8 week plan with specific modules and subtopics.
3. **Deep Learning**: For each subtopic, users watch curated videos (8-60 mins) and review specific learning objectives.
4. **Active Practice**: Users must complete practice sessions. The backend verifies resource URLs and generates questions on the fly.
5. **Validation (PoW)**: At the end of a module, users submit "Proof of Work." This could be a GitHub link, a screenshot of a project, or a PDF report.
6. **AI Evaluation**: The "Auditor" agent reviews the submission against the module's objectives. If rejected, users can dispute the decision via the "Senior Auditor."
7. **Mastery & Sharing**: Once progress reaches a high threshold, the skill is showcased on the user's public profile. Users can export their verified credentials as a PDF.

## How it was Built

EulerFold was developed with a focus on **Information Density** and **Minimalist Design**. 
- The **Frontend** uses a custom-built component library focused on "calm UI" principles—avoiding loud banners and over-designed elements. 
- The **Backend** is designed as a robust state machine, ensuring roadmap transitions are handled without dead ends.
- **Security** was a priority, with zero backdoors in application code and rigorous data validation using Pydantic.
- **Testing**: Was integrated early, maintaining coverage across the FastAPI logic to ensure stability during rapid iteration.


## What I Learned

- **AI Orchestration**: Orchestrating multiple Gemini agents for content generation, practice problem creation, and multimodal evaluation.
- **Architecting Integrity**: Building a progress system that doesn't just track "clicks" but requires actual evidence of learning.
- **Database triggers & Automation**: Leveraging Supabase triggers and GitHub Actions to build a self-sustaining ecosystem (onboarding, coin syncing, and automated check-ins).
- **Server-Side Generation**: Implementing server-side PDF generation to ensure data integrity for exported credentials.
- **UI/UX for Learning**: Designing high-density interfaces (like the Explore table) that remain readable and functional for complex data sets.

## Running the Project

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase Account
- Google AI (Gemini) API Key

### Backend Setup
1. Navigate to `backend/`.
2. Create and activate a virtual environment: `python -m venv venv && source venv/bin/activate`.
3. Install dependencies: `pip install -r app/requirements.txt`.
4. Create a `.env` file with `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, and `RESEND_API_KEY`.
5. Run the server: `uvicorn main:app --host 0.0.0.0 --port 8080 --reload`.

### Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Create a `.env.local` file with `NEXT_PUBLIC_API_URL` and Supabase credentials.
4. Run the development server: `npm run dev`.

## Video Demo

![Explore Page Demo](Explore-page-demo.gif)

Built for those who want to stop collecting links and start mastering skills.
# eulerfold
