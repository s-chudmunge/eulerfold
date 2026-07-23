# Project: EulerFold Niche Courses Automation & Enrichment

## Architecture
- **Backend:** FastAPI, Python 3.14 virtual environment in `backend/venv`
- **Database:** Supabase (`public.roadmaps` table)
- **Course Blueprint Structure:** JSON stored in `roadmap_plan` with modules, topics, subtopics, `proof_of_work_instructions`, `resources`, `youtube_search_query`
- **Enrichment:** `smart_video_enrich.py` (yt-dlp + YouTube v3 API), `smart_resource_enrich.py` (DuckDuckGo search)
- **Link Verification:** `httpx` HEAD/GET link verification gate purging broken 404 URLs before insertion
- **CSV Tracker:** `niche_courses.csv` updated with `[DONE]` prefix

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Initial Codebase & Environment Audit | Inspect CSV, scripts, environment, and dependencies | None | DONE |
| M2 | Batch 1 Seeding & Enrichment | Courses 1–13 (IDs 1388–1400) | M1 | DONE |
| M3 | Batch 2 Seeding & Enrichment | Courses 14–26 (IDs 1401–1413) | M2 | DONE |
| M4 | Batch 3 Seeding & Enrichment | Courses 27–39 (IDs 1414–1426) | M3 | DONE |
| M5 | Batch 4 Seeding & Enrichment | Courses 40–52 (IDs 1427–1439) | M4 | DONE |
| M6 | Batch 5 Seeding & Enrichment | Courses 53–63 (11 courses: lines 71–81) | M5 | IN_PROGRESS |
| M7 | Final E2E Audit & Verification | Verify 63 courses inserted, non-404 resources, YT videos populated, 80 [DONE] tags | M2-M6 | PLANNED |

## Interface Contracts & Validation Rules
- `roadmap_plan` must be a valid JSON object matching Pydantic validator `RoadmapRead`.
- `uuid.uuid4()` for module `id`, topic `uuid`, subtopic `id`.
- `proof_of_work_instructions`: `what_to_build`, `what_counts_as_evidence`, `eval_criteria` (array of strings).
- `verify_url`: `httpx.AsyncClient` HEAD/GET link check, dropping any 404 URLs before insertion.
- `smart_video_enrich.py`: MUST BE EXPLICITLY EXECUTED FOR EVERY INSERTED ID. Video duration 8 to 60 minutes, title relevancy >= 2.0.
- `smart_resource_enrich.py`: MUST BE EXPLICITLY EXECUTED FOR EVERY INSERTED ID. DDG search top 3 docs links per module.
- CSV update: prepend `[DONE] ` to course title in `niche_courses.csv`.
