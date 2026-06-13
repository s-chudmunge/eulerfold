from typing import List, Optional, Dict, Any, Union, Literal, Annotated
from datetime import datetime, date
from pydantic import BaseModel, Field, field_validator
import uuid
import json

# --- Auth Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_email: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Skill & Profile Schemas ---

class CanonicalSkill(BaseModel):
    id: uuid.UUID
    name: str
    category: str
    benchmark_hours: float

class UserSkill(BaseModel):
    id: uuid.UUID
    canonical_skill_id: uuid.UUID
    name: Optional[str] = None
    category: Optional[str] = None
    confidence_score: float
    tier: str  # Stores letter grade (A+, A, B, etc.)
    pow_score: float
    practice_score: float
    topic_completion: float
    depth_score: float
    time_invested: float
    last_assessment_score: Optional[float] = None
    last_assessment_at: Optional[datetime] = None
    last_updated: datetime

# --- User Schemas ---

class UserBase(BaseModel):
    email: str
    username: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False
    display_name: Optional[str] = None
    github_username: Optional[str] = None
    profile_completed: bool = False
    onboarding_completed: bool = False
    tos_accepted_at: Optional[datetime] = None
    tos_version: Optional[str] = None
    metadata: Dict[str, Any] = Field(default={})
    unsubscribed: bool = False
    current_streak: int = 0
    eulercoins: int = 0
    roadmap_credits: float = 1.0
    is_pro: bool = False
    review_count: int = 0
    last_active_date: Optional[datetime] = None
    skills: List[UserSkill] = []

class UserCreate(UserBase):
    password: Optional[str] = None

class UserRead(UserBase):
    id: int

class User(UserBase):
    id: Optional[int] = None
    # We use these to map to external auth providers
    supabase_uid: Optional[str] = None
    hashed_password: Optional[str] = ""
    created_at: Optional[datetime] = None

class UserUpdate(BaseModel):
    email: Optional[str] = None
    display_name: Optional[str] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    tos_accepted_at: Optional[datetime] = None
    tos_version: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class LearningSessionCreate(BaseModel):
    duration_seconds: int

class LearningSession(BaseModel):
    id: int
    user_id: uuid.UUID
    duration_seconds: int
    created_at: datetime

class OnboardingStatusResponse(BaseModel):
    needs_onboarding: bool
    profile_completed: bool
    user_id: Optional[int] = None

# --- Goal Schemas ---

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None

class GoalCreate(GoalBase):
    pass

class GoalRead(GoalBase):
    id: int
    user_id: int

class Goal(GoalBase):
    id: Optional[int] = None
    user_id: int

# --- Roadmap Schemas ---

class RoadmapCreate(BaseModel):
    subject: str
    goal: str
    time_value: int
    time_unit: str
    # Optional email to receive check-ins; if provided we'll schedule follow-ups
    email: Optional[str] = None
    model: Optional[str] = None
    prior_experience: Optional[str] = None
    experience_level: Optional[str] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None

class JobRoadmapCreate(BaseModel):
    job_description: str
    current_experience: str
    generation_type: str = "full"
    time_value: int
    time_unit: str = "weeks"
    model: Optional[str] = None


class RoadmapRead(BaseModel):
    id: int
    user_id: Optional[int] = None
    email: Optional[str] = None
    title: str
    slug: str
    description: str
    roadmap_plan: Dict[str, Any]
    subject: Optional[str] = None
    goal: Optional[str] = None
    time_value: Optional[int] = None
    time_unit: Optional[str] = None
    model: Optional[str] = None
    is_public: bool = False
    cloned_from: Optional[int] = None
    email: Optional[str] = None

class ExternalRoadmapCreate(BaseModel):
    roadmap_plan: Dict[str, Any]
    subject: str
    goal: str
    time_value: int
    time_unit: str
    model: str
    last_position: Optional[Dict[str, int]] = Field(default={"mIdx": 0, "tIdx": 0})
    is_public: bool = False
    show_author: bool = True
    cloned_from: Optional[int] = None
    clone_count: int = 0
    report_count: int = 0
    average_rating: float = 0.0
    rating_count: int = 0
    email: Optional[str] = None
    is_cloned: bool = False
    cloned_id: Optional[int] = None
    extension_count: int = 0
    status: str = "active"
    version: int = 1
    snapshot_hash: Optional[str] = None

    @field_validator("roadmap_plan", "last_position", mode="before")
    @classmethod
    def parse_json_fields(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return v
        return v

class RoadmapMe(RoadmapRead):
    progress: Optional[Dict[str, Any]] = None
    status: Optional[str] = "active" # active, completed, action_required, pending_review, resubmit_required
    is_cloned: bool = False
    user_rating: Optional[int] = None
    author: Optional[str] = None
    username: Optional[str] = None

# --- Explore & Clone Schemas ---

class ExploreRoadmap(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str] = None
    username: Optional[str] = None
    subject: Optional[str] = None
    goal: Optional[str]
    time_value: Optional[int]
    time_unit: Optional[str]
    clone_count: int
    average_rating: float = 0.0
    rating_count: int = 0
    author: str  # Username from profiles or "Anonymous"
    avatar_url: Optional[str] = None
    week_count: int  # len(roadmap_plan["modules"])
    topic_count: int  # sum of topics across all modules
    created_at: datetime
    is_owner: bool = False
    is_cloned: bool = False

class RatingCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)

class VisibilityUpdate(BaseModel):
    is_public: bool
    show_author: bool = True

class RoadmapStatusUpdate(BaseModel):
    status: Literal["active", "completed", "archived", "quit"]

class ReportCreate(BaseModel):
    reason: str

class RoadmapSave(BaseModel):
    title: str
    description: str
    roadmap_plan: Dict[str, Any]
    subject: str
    goal: str
    time_value: int
    time_unit: str
    email: str
    model: Optional[str] = None

class RoadmapExtend(BaseModel):
    weeks: int = Field(..., ge=1, le=2)
    extension_goal: str

class ProgressUpdate(BaseModel):
    module_number: int
    topic_index: int
    completed: bool = False

# --- Coin Schemas ---

class Transaction(BaseModel):
    amount: int
    reason: str
    created_at: datetime

class CoinBalance(BaseModel):
    balance: int
    transactions: List[Transaction]

class LeaderboardEntry(BaseModel):
    author: str
    username: str
    avatar_url: Optional[str] = None
    composite_score: float
    top_skill: Optional[str] = None
    top_skill_score: float = 0.0
    roadmaps_completed: int = 0
    rank: int
    is_me: bool = False
    eulercoins: int = 0
    current_streak: int = 0
    roadmaps_shared: int = 0

class LeaderboardResponse(BaseModel):
    top_users: List[LeaderboardEntry]
    user_rank: Optional[LeaderboardEntry] = None

# --- Practice Schemas ---

class PracticeResource(BaseModel):
    id: uuid.UUID
    title: str
    url: str
    platform: str
    difficulty: Optional[str] = None
    note: str

class PracticeSessionCreate(BaseModel):
    roadmap_id: int
    subtopic_id: uuid.UUID
    topic_name: str
    subject: str
    goal: str

class PracticeSessionRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    roadmap_id: int
    subtopic_id: uuid.UUID
    resources: List[PracticeResource]
    has_more: bool
    generation_count: int
    created_at: datetime
    updated_at: datetime

class PracticeProgressUpdate(BaseModel):
    resource_id: uuid.UUID
    completed: bool

class PracticeProgressRead(BaseModel):
    session_id: uuid.UUID
    resource_id: uuid.UUID
    completed: bool
    updated_at: datetime

class PracticeStats(BaseModel):
    easy: int = 0
    medium: int = 0
    hard: int = 0
    total: int = 0
    mcq_correct: int = 0
    mcq_total: int = 0

# --- MCQ Schemas ---

class MCQQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str

class MCQSessionCreate(BaseModel):
    roadmap_id: Optional[int] = None
    subtopic_id: Optional[uuid.UUID] = None
    topic_name: str
    subject: str
    week_number: int
    num_questions: int = Field(10, ge=10, le=20)
    engine_type: Optional[str] = "cloud"
    api_key: Optional[str] = None
    model_name: Optional[str] = None

class MCQSessionSaveExternal(BaseModel):
    roadmap_id: Optional[int] = None
    subtopic_id: Optional[uuid.UUID] = None
    topic_name: str
    subject: str
    week_number: int
    questions: List[MCQQuestion]

class MCQSessionRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    roadmap_id: Optional[int] = None
    subtopic_id: Optional[uuid.UUID] = None
    topic_name: str
    subject: str
    week_number: int
    questions: List[MCQQuestion]
    user_answers: Optional[List[int]] = []
    score: Optional[float] = None
    credit_cost: float
    status: str
    created_at: datetime
    updated_at: datetime

class PublicProfile(BaseModel):
    username: str
    display_name: Optional[str]
    github_username: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    supabase_uid: Optional[str] = None
    is_pro: bool = False
    eulercoins: int = 0
    roadmap_credits: float = 0.0
    review_precision: float = 0.0 # % of Solid ratings
    current_streak: int = 0
    learning_momentum: Dict[str, int] = Field(default={"mastered": 0, "explored": 0})
    total_skills: int
    total_roadmaps: int
    total_hours: float
    last_active: Optional[datetime]
    skills: List[UserSkill]
    roadmaps: List[Dict[str, Any]] = []
    submissions: List[Dict[str, Any]] = []
    practice_stats: Optional[PracticeStats] = None
    mcq_history: List[MCQSessionRead] = []
    discussions: List["DiscussionRead"] = []

class MCQSubmitAnswer(BaseModel):
    answers: List[int] # List of chosen indices matching questions

# --- Discussion Schemas ---

class DiscussionBase(BaseModel):
    content: Optional[str] = None
    context_type: str
    context_id: str
    parent_id: Optional[uuid.UUID] = None

class DiscussionCreate(DiscussionBase):
    content: str # Required for creation

class DiscussionRead(DiscussionBase):
    id: uuid.UUID
    author_id: int
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    is_pinned: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

class DiscussionReportCreate(BaseModel):
    comment_id: uuid.UUID
    reason: Optional[str] = None

class DiscussionReportRead(BaseModel):
    id: uuid.UUID
    user_id: int
    comment_id: uuid.UUID
    reason: Optional[str] = None
    created_at: datetime

# --- Study Task Schemas ---

class StudyTaskBase(BaseModel):
    roadmap_id: Optional[int] = None
    module_number: Optional[int] = None
    task_type: Literal['module', 'practice', 'pow', 'video', 'custom', 'research', 'article']
    title: str
    scheduled_date: date
    metadata: Dict[str, Any] = {}

class StudyTaskCreate(StudyTaskBase):
    pass

class StudyTaskUpdate(BaseModel):
    scheduled_date: Optional[date] = None
    is_completed: Optional[bool] = None
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class StudyTaskRead(StudyTaskBase):
    id: uuid.UUID
    user_email: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

class PlannerGenerateRequest(BaseModel):
    roadmap_ids: List[int]
    start_date: date
    target_date: date
    intensity: Literal['casual', 'balanced', 'intense'] # 1, 2, or 3 modules per week etc.

class ManualBuildRequest(BaseModel):
    title: str
    goal: str
    skills: Optional[str] = ""

# --- Content Interaction Schemas ---

class LikeRead(BaseModel):
    count: int
    user_liked: bool

class LikeToggle(BaseModel):
    context_type: str
    context_id: str


# --- AI Usage Logging ---

class AIUsageLogCreate(BaseModel):
    model_name: str
    subject: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    status: str
    source: str
    error_message: Optional[str] = None

class AIUsageLogRead(AIUsageLogCreate):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
