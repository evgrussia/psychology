"""
DTOs для Client Cabinet Domain Use Cases.
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any, List


@dataclass
class GetClientAppointmentsDto:
    """DTO для получения списка встреч клиента."""
    user_id: str
    status: Optional[str] = None  # 'upcoming' | 'past' | 'all'
    limit: Optional[int] = None


@dataclass
class ClientAppointmentsResponseDto:
    """DTO для ответа со списком встреч."""
    appointments: List[Dict[str, Any]]


@dataclass
class CreateDiaryEntryDto:
    """DTO для создания записи дневника."""
    user_id: str
    type: str  # 'emotion' | 'abc'
    content: Dict[str, Any]


@dataclass
class DiaryEntryResponseDto:
    """DTO для ответа с записью дневника."""
    id: str
    type: str
    content: Dict[str, Any]
    created_at: str


@dataclass
class ExportDiaryToPdfDto:
    """DTO для экспорта дневников в PDF."""
    user_id: str
    date_from: str  # ISO8601
    date_to: str  # ISO8601
    format: str = 'pdf'


@dataclass
class ExportDiaryResponseDto:
    """DTO для ответа на экспорт дневников."""
    export_id: str
    status: str  # 'processing' | 'ready' | 'failed'
    download_url: Optional[str] = None
    expires_at: Optional[str] = None


@dataclass
class DeleteUserDataDto:
    """DTO для удаления данных пользователя."""
    user_id: str
    confirmation: str  # "DELETE" для подтверждения
