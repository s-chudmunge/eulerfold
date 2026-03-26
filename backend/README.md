# EulerFold Backend

FastAPI application powered by Google Gemini AI and Supabase.

## Setup

1. Install dependencies:
   ```bash
   pip install -r app/requirements.txt
   ```

2. Configure environment variables in `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `GEMINI_API_KEY`
   - `RESEND_API_KEY`

3. Run locally:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8080 --reload
   ```

## Key Modules

- `app/routers/`: API route definitions.
- `app/core/`: Security, configuration, and client initializations.
- `app/utils/`: AI generation, email, and helper functions.
- `app/schemas.py`: Pydantic models for request/response validation.
