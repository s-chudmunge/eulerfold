from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class ScoutReadingRequest(BaseModel):
    roadmap_id: int
    module_index: int
    topic_index: Optional[int] = 0
    prompt: str
    action: Optional[str] = "add"  # "add" | "replace"


class ChatMessageItem(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class ChatAssistantRequest(BaseModel):
    roadmap_id: int
    module_index: int
    topic_index: int = 0
    message: str
    chat_history: Optional[List[ChatMessageItem]] = []


class AlternateVideoRequest(BaseModel):
    roadmap_id: int
    module_index: int
    topic_index: int
    prompt: Optional[str] = None
    preferred_channel: Optional[str] = None
    action: Optional[str] = "replace"  # "replace" | "candidates_only"


class ScheduleSyncRequest(BaseModel):
    roadmap_id: int
    week_number: Optional[int] = None
    intensity: Optional[str] = "balanced"  # "casual" | "balanced" | "intense"
    custom_notes: Optional[str] = None
    start_date: Optional[str] = None  # YYYY-MM-DD
