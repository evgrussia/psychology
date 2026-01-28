"""
DTOs для Interactive Domain Use Cases.
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any, List


@dataclass
class StartInteractiveRunDto:
    """DTO для начала прохождения интерактива."""
    interactive_slug: str
    user_id: Optional[str] = None
    anonymous_id: Optional[str] = None
    entry_point: Optional[str] = 'web'
    topic_code: Optional[str] = None
    deep_link_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class InteractiveRunResponseDto:
    """DTO для ответа на начало интерактива."""
    run_id: str
    interactive: Dict[str, Any]
    started_at: str
    questions: Optional[List[Dict[str, Any]]] = None
    steps: Optional[List[Dict[str, Any]]] = None


@dataclass
class CompleteInteractiveRunDto:
    """DTO для завершения интерактива."""
    run_id: str
    answers: Optional[List[Dict[str, Any]]] = None
    navigator_path: Optional[List[str]] = None
    thermometer_values: Optional[Dict[str, int]] = None
    crisis_triggered: Optional[bool] = None


@dataclass
class InteractiveResultResponseDto:
    """DTO для результата интерактива."""
    run_id: str
    result: Dict[str, Any]
    crisis_triggered: bool
    deep_link_id: str


@dataclass
class GetBoundaryScriptsDto:
    """DTO для получения скриптов границ."""
    scenario: str  # 'work' | 'family' | 'partner' | 'friends'
    style: str  # 'soft' | 'brief' | 'firm'
    goal: str  # 'refuse' | 'ask' | 'set_rule' | 'pause'


@dataclass
class BoundaryScriptsResponseDto:
    """DTO для ответа со скриптами границ."""
    scripts: List[Dict[str, Any]]
    safety_tips: List[str]


@dataclass
class GetRitualDto:
    """DTO для получения ритуала."""
    ritual_id: str  # Или slug


@dataclass
class RitualResponseDto:
    """DTO для ответа с ритуалом."""
    id: str
    title: str
    description: str
    duration_minutes: int
    instructions: List[str]
    audio_url: Optional[str] = None
