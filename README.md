# EulerFold

<div align="center">
  <img src="frontend/public/android-chrome-512x512.png" alt="EulerFold" width="100">

  ### Personalized Adaptive Learning · Technical Proof of Work · Research Decoded

  [![License](https://img.shields.io/github/license/s-chudmunge/eulerfold?style=for-the-badge&color=0F766E)](LICENSE)
  [![Stars](https://img.shields.io/github/stars/s-chudmunge/eulerfold?style=for-the-badge&color=0F766E)](https://github.com/s-chudmunge/eulerfold/stargazers)
  [![Forks](https://img.shields.io/github/forks/s-chudmunge/eulerfold?style=for-the-badge&color=0F766E)](https://github.com/s-chudmunge/eulerfold/network/members)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

  [Explore](https://www.eulerfold.com/explore) · [Research](https://www.eulerfold.com/research-lab) · [Planner](https://www.eulerfold.com/planner) · [Setup](#setup)
</div>

EulerFold is a tool to help you learn new technical subjects by building a path for you and making sure you follow it. Most learning platforms focus on video progress; EulerFold focuses on building a week-by-week plan based on your goals and verifying that you actually understand the material through technical submissions.

### How it works

The goal is to move from just reading about a topic to actually building things.

- **Roadmap Generation**: Type in a goal like "Quantum Physics" or "React" and get a structured curriculum.
- **Learning & Practice**: Study each module and answer technical questions to move forward.
- **Proof of Work**: Upload code, PDFs, or images to prove you hit the learning goals. An AI reviewer checks your work and gives direct feedback.
- **Career Growth**: Paste a job description to get a roadmap that fills the gap between your current skills and the role requirements.
- **Study Planning**: Schedule tasks based on how much time you have (Casual, Balanced, or Intense).
- **Research**: Use the Research Lab to analyze technical papers and test your recall.
- **Earned Records**: Track your progress on a public profile and export your credentials as a PDF with a QR code.

### Tech Stack

EulerFold is built for scale and low-latency interaction:

- **Frontend**: Next.js (App Router), Tailwind CSS v4, Lucide Icons.
- **Backend**: FastAPI (Python 3.11+), Redis for caching, Async core.
- **AI**: Google Gemini (Native Async integration), custom technical evaluation prompts.
- **Infrastructure**: Supabase (PostgreSQL, Auth, Storage) with composite indexing for high-density data.
- **Email**: Resend for transactional alerts and credential delivery.

### Setup

#### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r app/requirements.txt
# Configure SUPABASE_URL, SUPABASE_KEY, and GEMINI_API_KEY in .env
uvicorn app.main:app --port 8080 --reload
```

#### Frontend
```bash
cd frontend
npm install
# Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
npm run dev
```

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=s-chudmunge/eulerfold&type=Date)](https://star-history.com/#s-chudmunge/eulerfold&Date)

---
<div align="center">
  Stop collecting links. Start building things.
</div>
