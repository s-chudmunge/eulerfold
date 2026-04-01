# EulerFold — AI Agent Rulebook

This file is the authoritative guide for any AI agent working on this codebase.
Read it fully before making any changes. Rules here are not suggestions.

---

## Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS v4, Lucide Icons
- **Backend:** FastAPI (Python)
- **Database & Auth:** Supabase (Postgres + Supabase Auth via Google Provider)
- **Email:** Resend
- **AI:** Google Gemini

---

## Design & UI Rules

### Theming

- ALWAYS use semantic Tailwind classes: `bg-background`, `bg-sidebar`, `text-text-primary`, `border-border`, etc.
- These map to CSS variables in `globals.css` (e.g., `bg-background` -> `var(--bg-main)`).
- NEVER use hardcoded hex values or standard Tailwind color classes (e.g., `bg-white`, `border-gray-100`, `text-gray-700`) in components.
- NEVER define colors or backgrounds inside local `<style jsx global>` blocks in components.

### Color & Branding

- Primary brand color is Teal-700 (`#0F766E`).
- Light mode background: `#f0f7f6` (Mint/Teal-White). Sidebar is slightly deeper: `#e8f2f1`.
- Dark mode: soft dark theme, dimmed images (`dark:opacity-90`), softened white text (`#d1d5db`).

### Typography

- ALWAYS use Title Case for main headers and nav items (e.g., "Research Decoded", not "RESEARCH DECODED").
- NEVER use full uppercase for headers — it increases visual noise.

### Layout & Density

- Maintain high information density. Target ~44px row height in tables.
- Keep cards and link components compact across Dashboard, Explore, and Learning Directory pages.

---

## Key Gotchas & Bugs

### Routing

- In `roadmaps.py`, ALWAYS define `/roadmaps/me` BEFORE `/roadmaps/{id}`.
- Reversing this order causes 422 errors because FastAPI matches `me` as the `{id}` param.

### The Audit Senate (Submissions)

- Proof of Work is evaluated by a **3-Auditor Senate** (Technician, Educator, Relevance Judge).
- A **10-minute cooldown** is enforced after a "Beginner" (failed) evaluation for a specific module.
- Users have a **one-time dispute/re-evaluation limit** per submission.
- Deviation from the topic is acceptable if the "Relevance Judge" determines the learner demonstrated mastery of the broader Roadmap Subject.

### SSR & Search Params

- NEVER use `useSearchParams()` directly in a component that renders server-side.
- ALWAYS use the `SearchParamsHandler` pattern (isolated `<Suspense>` component) to avoid `BAILOUT_TO_CLIENT_SIDE_RENDERING`.

### JSON Handling

- `roadmap_plan` can be stored as either a string or a JSON object in the DB.
- ALWAYS use `_parse_roadmap_dict` or the Pydantic `RoadmapRead` validator to handle it.

### YouTube Filters

- Videos MUST be between 8 and 60 minutes in length.
- Videos MUST pass a keyword-based title relevance check.

### Database

- NEVER use local SQLite. All data goes through Supabase.
- A Supabase trigger (`on_auth_user_created`) auto-creates a `public.profiles` row on every signup.

### Progress Scoring

- Skill confidence uses a fixed **40/30/15/15** split: 40% Proof of Work + 30% Practice Score + 15% Topic Completion + 15% Concept Depth.
- NEVER change these weights without explicit instruction.

---

### Personal Preferences

- I am Sankalp. I write clean, logical code. Match that standard.
- Prefer clarity over cleverness. If a solution is hard to read, it's wrong.
- ALWAYS use `https://www.eulerfold.com` for all links and assets. NEVER use the non-www `https://eulerfold.com` version.

