# EulerFold Project Context

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS v4, Lucide Icons.
- **Backend**: FastAPI (Python), Supabase (Database & Auth), Resend (Emails), Google Gemini (AI).

## Core Architecture
- **Centralized Theme**: All design variables (backgrounds, borders, text colors) are controlled via CSS variables in `frontend/src/app/globals.css`. These are mapped to semantic Tailwind classes (e.g., `bg-background`, `bg-sidebar`, `text-text-primary`).
- **Database**: All data (Profiles, Roadmaps, Checkin Entries) is stored in **Supabase**. No local SQLite is used.
- **Authentication**: Managed via **Supabase Auth** (Google Provider).
- **Profile Automation**: A Supabase trigger (`on_auth_user_created`) automatically creates a `public.profiles` entry for every new signup in `auth.users`.
- **Automation**: A GitHub Action (`.github/workflows/checkin.yml`) triggers the `/checkins/run_due` endpoint daily to process 7-day follow-ups.

## Design & UI Principles
- **Branding**: Primary color is **Teal-700 (#0F766E)**. Mascot is the **Turtle**, representing steady progress.
- **Branded Background**: Light mode features a clearly visible "Mint/Teal-White" background (`#f0f7f6`) and a slightly deeper sidebar (`#e8f2f1`) to maintain a professional, calm aesthetic.
- **Typography**: Prefers **Title Case** (e.g., "Research Decoded") over full uppercase for main headers and navigation items to reduce visual noise.
- **Compactness**: High information density is maintained across the Dashboard, Explore, and Learning Directory pages (e.g., ~44px rows in tables, compact link cards).
- **Dark Mode**: Uses a soft dark theme with dimmed images (`dark:opacity-90`) and softened white text (`#d1d5db`) to reduce eye strain.

## Key Logic & Gotchas
- **Theme Consistency**: **NEVER** use local `style jsx global` blocks to define colors or backgrounds in components. Always inherit from the global theme.
- **Semantic Classes**: Use semantic Tailwind classes (e.g., `bg-background`, `border-border`) instead of hardcoded hex codes or standard Tailwind colors (e.g., `bg-white`, `border-gray-100`) to ensure site-wide theme changes work.
- **Roadmap Routes**: In `roadmaps.py`, the `/roadmaps/me` route must be defined **before** `/roadmaps/{id}` to avoid 422 errors.
- **YouTube Filters**: Videos are strictly filtered between **8 and 60 minutes** and must pass a keyword-based title relevance check.
- **SSR & Search Params**: To avoid `BAILOUT_TO_CLIENT_SIDE_RENDERING` in production, never use `useSearchParams()` directly in a component that should render server-side. Use the **SearchParamsHandler** pattern: isolate `useSearchParams` into a tiny component that returns `null`, wrap *only* that component in `<Suspense fallback={null}>`, and pass params back via a callback. This ensures the main component renders immediately with initial data in the raw HTML.
- **JSON Handling**: `roadmap_plan` can be stored as a string or object in the DB; use `_parse_roadmap_dict` or the Pydantic validator in `RoadmapRead` to handle it.

## Phase 1 Architecture (March 2026)
- **Honest Progress Weighting**: Skill confidence is calculated using a 40/40/20 split (40% Topic Completion, 40% Practice Score, 20% Proof of Work).
- **Submissions Engine**: Handles multimodal evidence (Base64 images, PDFs, text) with AI evaluation. Includes a dispute logic where a "Senior Auditor" agent can override rejected submissions.
- **Integrity PDF**: Profiles use `reportlab` and `StreamingResponse` for server-side PDF generation. This ensures the output is tamper-proof and reflects real-time database state.
- **Test Coverage**: Maintains 33+ backend pytest tests.

## Critical Environment Variables
- `SUPABASE_URL` / `SUPABASE_KEY`: Database connection.
- `GEMINI_API_KEY`: AI generation.
- `RESEND_API_KEY` / `RESEND_SENDER`: Email functionality.
- `CHECKIN_RUN_KEY`: Security token for the cron job.
- `NEXT_PUBLIC_API_URL`: Backend URL for the frontend.
