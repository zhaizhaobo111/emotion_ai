from datetime import datetime
from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str


class UserOut(BaseModel):
    id: str
    username: str
    persona: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    emotion: str | None = None
    emotion_score: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EmotionResult(BaseModel):
    emotion: str
    score: float


class EmotionRecordOut(BaseModel):
    id: str
    emotion: str
    score: float
    context: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EmotionReport(BaseModel):
    period: str
    dominant_emotion: str
    emotion_distribution: dict[str, float]
    trend: list[EmotionRecordOut]
    ai_suggestion: str


class MemoryCreate(BaseModel):
    content: str
    category: str = "general"
    importance: float = 0.5


class MemoryOut(BaseModel):
    id: str
    content: str
    category: str
    importance: float
    last_accessed: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class PersonaUpdate(BaseModel):
    persona: str


class PersonaOut(BaseModel):
    key: str
    name: str
    description: str


class UserProfileOut(BaseModel):
    username: str
    persona: str
    memories: list[MemoryOut]
    recent_emotions: list[EmotionRecordOut]
    summary: str


class WSMessage(BaseModel):
    type: str
    data: dict
