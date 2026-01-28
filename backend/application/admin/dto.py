"""
DTOs для Admin Panel Domain Use Cases.
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any, List


@dataclass
class CreateAvailabilitySlotDto:
    """DTO для создания слота доступности."""
    start_at: str  # ISO8601
    end_at: str  # ISO8601
    timezone: str  # IANA
    service_id: Optional[str] = None
    recurrence: Optional[Dict[str, Any]] = None


@dataclass
class PublishContentItemDto:
    """DTO для публикации контента."""
    content_id: str
    checklist: Dict[str, bool]  # QA чеклист


@dataclass
class ModerateUGCItemDto:
    """DTO для модерации UGC."""
    item_id: str
    decision: str  # 'approve' | 'reject'
    moderator_id: str
    reason: Optional[str] = None


@dataclass
class AnswerUGCQuestionDto:
    """DTO для ответа на анонимный вопрос."""
    item_id: str
    answer_text: str
    owner_id: str  # ID психолога (owner)


@dataclass
class GetLeadsListDto:
    """DTO для получения списка лидов."""
    page: int = 1
    per_page: int = 20
    status: Optional[str] = None
    source: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


@dataclass
class LeadsListResponseDto:
    """DTO для ответа со списком лидов."""
    data: List[Dict[str, Any]]
    pagination: Dict[str, Any]
