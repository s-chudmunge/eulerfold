## 2026-07-23T13:58:53Z

<USER_REQUEST>
You are Worker M6. Your working directory is `/home/sankalp/Documents/projects/eulerfold/.agents/worker_m6`.

CRITICAL INSTRUCTION FROM USER AUDIT:
Requirement R3 (Media & Resource Enrichment) MUST BE STRICTLY EXECUTED AND VERIFIED for EVERY newly generated course ID immediately after database insertion. Call `smart_video_enrich.py <id>` (`enrich_roadmap`) and `smart_resource_enrich.py <id>` (`enrich_resources`) for EVERY inserted roadmap ID and verify that Supabase has non-empty `youtube_video_title`s and valid `resources` populated before marking the batch complete.

Target Directory: `/home/sankalp/Documents/projects/eulerfold/backend`
Python environment: `/home/sankalp/Documents/projects/eulerfold/backend/venv/bin/python`

Target Courses for Batch 5 (11 courses: lines 71 to 81 in `niche_courses.csv`):
1. Kubernetes Networking: CNI & Service Mesh Internals
2. Linux Performance Tuning: perf & ftrace & bpftrace
3. Writing Async Runtimes (Tokio & Event Loops)
4. Implementing a Key-Value Store (LSM & WAL)
5. Advanced CSS: Layout Algorithms & Rendering Pipeline
6. Streaming LLM Responses: SSE & WebSockets in Production
7. Building MCP Servers (Model Context Protocol)
8. Financial Data Pipelines with dbt & Snowflake
9. Genetic Algorithms & Evolutionary Computation
10. Adversarial Machine Learning: Attack & Defense
11. Functional Programming Patterns in TypeScript

Tasks:
1. In `backend/`, write `seed_batch_7.py` with blueprints for all 11 courses:
   - 4 modules per course, UUIDs for modules/topics/subtopics.
   - Realistic `proof_of_work_instructions` (`what_to_build`, `what_counts_as_evidence`, `eval_criteria`).
   - Async `verify_url` via `httpx.AsyncClient` filtering 404 links before insertion.
   - Return inserted records list containing roadmap IDs.
2. In `backend/`, write `batch_5_runner.py`:
   - Import `seed` from `seed_batch_7`, `enrich_roadmap` from `smart_video_enrich`, `enrich_resources` from `smart_resource_enrich`, `get_supabase_client` from `app.core.supabase_client`.
   - In `async main()`:
     1. `inserted_records = await seed()`
     2. For each `rec` in `inserted_records`:
        `r_id = rec['id']`
        `print(f'Starting enrichment for roadmap ID {r_id}...')`
        `await enrich_roadmap(r_id)`
        `await enrich_resources(r_id)`
        `# VERIFY ENRICHMENT IN SUPABASE`
        `sb = get_supabase_client()`
        `data = sb.table('roadmaps').select('roadmap_plan').eq('id', r_id).execute().data[0]['roadmap_plan']`
        `has_videos = any(t.get('youtube_video_title') for m in data.get('modules',[]) for t in m.get('topics',[]))`
        `has_resources = any(len(m.get('resources',[]))>0 for m in data.get('modules',[]))`
        `print(f'VERIFICATION ID {r_id}: Has Videos = {has_videos}, Has Resources = {has_resources}')`
3. Update `/home/sankalp/Documents/projects/eulerfold/niche_courses.csv` lines 71–81 prepending `[DONE] `.
4. Execute `batch_5_runner.py` using `run_command`:
   `CommandLine`: `/home/sankalp/Documents/projects/eulerfold/backend/venv/bin/python batch_5_runner.py`
   `Cwd`: `/home/sankalp/Documents/projects/eulerfold/backend`
   `WaitMsBeforeAsync`: 10000
5. Monitor execution to completion. Confirm that all 11 courses have verified `youtube_video_title`s and `resources` in Supabase. Write report to `/home/sankalp/Documents/projects/eulerfold/.agents/worker_m6/changes.md` and `/home/sankalp/Documents/projects/eulerfold/.agents/worker_m6/handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When complete, send your handoff report to the parent orchestrator.
</USER_REQUEST>
