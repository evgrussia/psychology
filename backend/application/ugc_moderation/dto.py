"""
DTOs для UGC Moderation Domain Use Cases.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class SubmitQuestionDto:
    """DTO для отправки вопроса."""
    content: str
    user_id: Optional[str] = None  # Опционально, может быть анонимным


@dataclass
class QuestionResponseDto:
    """DTO для ответа с вопросом."""
    id: str
    content: str
    status: str  # 'pending' | 'flagged' | 'approved' | 'rejected'
    created_at: str
