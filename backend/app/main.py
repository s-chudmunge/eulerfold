import os
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
import logging
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Sentry initialization
from app.core.config import settings
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
        traces_sample_rate=0.2,
        profiles_sample_rate=0.1,
        environment=settings.SENTRY_ENVIRONMENT,
        before_send=lambda event, hint: 
            None if settings.ENVIRONMENT == "test" else event
    )

# Configure logging at the root level to show INFO logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
# Ensure the root logger level is explicitly set to INFO
logging.getLogger().setLevel(logging.INFO)
# Silence noisy libraries
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

from fastapi import FastAPI, Depends, WebSocket, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class COOPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
        return response

from app.core.websocket_manager import manager

from app.routers import health, roadmaps, auth, explore, coins, practice, profiles, assessments, sessions, leaderboard, payments, discussions, planner, tts, research_lab, interactions, ai_usage, dashboard
from app.routers import submissions as submissions_router
from app.core.config import settings

def validate_environment():
    required_vars = [
        ("SUPABASE_URL", settings.SUPABASE_URL),
        ("SUPABASE_KEY", settings.SUPABASE_KEY),
        ("GEMINI_API_KEY", settings.GEMINI_API_KEY),
    ]
    if settings.ENVIRONMENT == "production":
        required_vars.append(("RESEND_API_KEY", settings.RESEND_API_KEY))
    
    missing = [name for name, val in required_vars if not val]
    if missing:
        msg = f"CRITICAL: Missing required environment variables: {', '.join(missing)}"
        logging.error(msg)
        if settings.ENVIRONMENT == "production":
             raise RuntimeError(msg)
    
    # Log key suffix for verification
    if settings.GEMINI_API_KEY:
        key_suffix = settings.GEMINI_API_KEY[-3:]
        print(f"--- [STARTUP] Gemini API key loaded. Suffix: ...{key_suffix}")
        print(f"--- [STARTUP] Gemini model: {settings.GEMINI_MODEL}")
    else:
        print("--- [STARTUP] WARNING: GEMINI_API_KEY is not set!")

app = FastAPI()

# Configure CORS with explicit origins (never use wildcard with authenticated endpoints)
_allowed = settings.cors_origins_list
# In development, always allow localhost:3000
if settings.ENVIRONMENT == "development" and "http://localhost:3000" not in _allowed:
    _allowed = ["http://localhost:3000"] + (_allowed if "*" not in _allowed else [])
# In production, never use wildcard
elif settings.ENVIRONMENT == "production" and "*" in _allowed:
    _allowed = ["https://www.eulerfold.com"]  # Explicitly set production origin

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
)


app.add_middleware(COOPMiddleware)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    import logging
    logging.error(f"422 Validation Error on {request.method} {request.url}")
    logging.error(f"Body: {exc.body}")
    logging.error(f"Detail: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

# Prioritize auth router
app.include_router(auth.router)
app.include_router(health.router)
app.include_router(roadmaps.router)
app.include_router(submissions_router.router)
app.include_router(explore.router)
app.include_router(coins.router)
app.include_router(practice.router)
app.include_router(profiles.router)
app.include_router(assessments.router)
app.include_router(sessions.router)
app.include_router(leaderboard.router)
app.include_router(payments.router)
app.include_router(discussions.router)
app.include_router(interactions.router)
app.include_router(planner.router, prefix="/planner", tags=["planner"])
app.include_router(tts.router)
app.include_router(research_lab.router)
app.include_router(ai_usage.router)
app.include_router(dashboard.router)

@app.on_event("startup")
async def startup_event():
    validate_environment()

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    """Root endpoint for basic connectivity check"""
    return {"message": "EulerFold API is running", "status": "ok"}
