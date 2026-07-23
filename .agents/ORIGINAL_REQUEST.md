# Original User Request

## 2026-07-23T12:44:19Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Automate the remaining 63 courses overnight

Automate the generation and enrichment of the remaining 63 niche courses from `niche_courses.csv` into the Supabase database. 

Working directory: `~/Documents/projects/eulerfold/backend`
Integrity mode: development

## Requirements

### R1. Batch Seeding
Write and execute Python seed scripts (similar to the existing `seed_batch_2.py` pattern) to generate JSON blueprints for the remaining 63 courses in automated batches of ~10-15. Ensure each course uses `uuid.uuid4()` for all IDs, contains 3-6 modules with rigorous `proof_of_work_instructions`, and uses an SEO-optimized title/slug.

### R2. Live Link Verification
The seed scripts MUST include the `httpx` link verification gate to silently drop any hallucinated 404 URLs before insertion.

### R3. Media & Resource Enrichment
After inserting a batch, you must programmatically run `smart_video_enrich.py <id>` and `smart_resource_enrich.py <id>` for every newly inserted course ID to scrape high-quality YouTube videos and DuckDuckGo documentation.

### R4. Progress Tracking
After a batch completes, update `~/Documents/projects/eulerfold/niche_courses.csv` by prepending `[DONE]` to the completed courses.

## Acceptance Criteria

### Pipeline Completion
- [ ] 63 new courses are successfully inserted into the `roadmaps` table in Supabase.
- [ ] Every new course has populated `resources` (from DDG scraper) and `youtube_video_title`s (from yt-dlp scraper).
- [ ] `niche_courses.csv` contains exactly 80 `[DONE]` tags.
- [ ] No broken/404 links exist in the `resources` arrays of the new courses.

## Follow-up — 2026-07-23T13:28:16Z

URGENT: I just audited the database. You are successfully inserting the courses via `seed_batch_3.py` and `seed_batch_4.py`, but your worker agents are completely skipping the enrichment step (Requirement R3)! 

The courses you inserted (IDs 1388 through 1413) have NO youtube videos and only hallucinated resources. 

I am currently running a bash script to backfill the enrichment for IDs 1388-1413. For the remaining batches (Milestone M5 and M6), you MUST ensure the worker explicitly runs `python smart_video_enrich.py <id>` and `python smart_resource_enrich.py <id>` for every newly generated course.

