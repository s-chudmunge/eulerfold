from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class CheckpointItem(BaseModel):
    id: str
    archetype: Literal["predict_output", "spot_bug", "concept_application"]
    question: str
    code_snippet: Optional[str] = None
    options: List[str]
    correct_index: int
    explanation: str
    concept_key: str

class CheckpointRequest(BaseModel):
    roadmap_id: int
    module_number: int
    topic_index: int
    subject: str
    topic_title: str
    roadmap_slug: Optional[str] = None
    subtopics: List[str] = []
    learner_level: Optional[str] = "beginner"
    previous_attempt: Optional[Dict[str, Any]] = None

class CheckpointEvaluateRequest(BaseModel):
    roadmap_id: int
    module_number: int
    topic_index: int
    checkpoint_id: str
    selected_option: int
    subject: str
    topic_title: str
    question: Optional[str] = None
    options: List[str]
    correct_index: int
    explanation: str
    concept_key: Optional[str] = None
    roadmap_slug: Optional[str] = None

class CheckpointEvaluateResponse(BaseModel):
    is_correct: bool
    coins_earned: int
    feedback: str
    explanation: str
    retry_checkpoint: Optional[CheckpointItem] = None

class UnlockNextTopicRequest(BaseModel):
    roadmap_id: int
    module_number: int
    topic_index: int
    subject: str

class UnlockNextTopicResponse(BaseModel):
    has_next: bool
    module_number: int
    topic_index: int
    topic: Optional[Dict[str, Any]] = None
    tutor_note: str
    is_bridge: bool = False
