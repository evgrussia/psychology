"""
InteractiveRun Aggregate Root.
"""
from datetime import datetime, timezone
from typing import Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.identity.aggregates.user import UserId
from domain.interactive.value_objects.run_status import RunStatus
from domain.interactive.value_objects.run_metadata import RunMetadata
from domain.interactive.value_objects.interactive_result import InteractiveResult
from domain.interactive.domain_events import (
    InteractiveRunStartedEvent,
    InteractiveRunCompletedEvent,
    InteractiveRunAbandonedEvent,
    CrisisTriggeredEvent
)


class InteractiveRunId(EntityId):
    """ID прохождения интерактива."""
    pass


class InteractiveRun(AggregateRoot):
    """Aggregate Root для прохождения интерактива.
    
    Бизнес-правила:
    - Интерактив может быть запущен анонимно (без user_id)
    - Результат содержит только агрегаты (level, profile), не сырые ответы
    - Кризисный триггер генерирует отдельное событие
    - Связь с пользователем может произойти позже (link_to_user)
    """
    
    def __init__(
        self,
        id: InteractiveRunId,
        user_id: Optional[UserId],
        metadata: RunMetadata,
        status: RunStatus,
        result: Optional[InteractiveResult],
        started_at: datetime,
        completed_at: Optional[datetime] = None
    ):
        super().__init__()
        self._id = id
        self._user_id = user_id
        self._metadata = metadata
        self._status = status
        self._result = result
        self._started_at = started_at
        self._completed_at = completed_at
    
    @classmethod
    def start(
        cls,
        metadata: RunMetadata,
        user_id: Optional[UserId] = None
    ) -> "InteractiveRun":
        """Factory method для начала прохождения интерактива."""
        run = cls(
            id=InteractiveRunId.generate(),
            user_id=user_id,
            metadata=metadata,
            status=RunStatus.STARTED,
            result=None,
            started_at=datetime.now(timezone.utc)
        )
        
        run.add_domain_event(
            InteractiveRunStartedEvent(
                run_id=run._id,
                interactive_slug=metadata.interactive_slug,
                user_id=user_id
            )
        )
        
        return run
    
    def complete(self, result: InteractiveResult) -> None:
        """Завершает прохождение интерактива."""
        if not self._status.value == 'started':
            raise ValueError("Can only complete started run")
        
        self._status = RunStatus.COMPLETED
        self._result = result
        self._completed_at = datetime.now(timezone.utc)
        
        self.add_domain_event(
            InteractiveRunCompletedEvent(
                run_id=self._id,
                result=result
            )
        )
        
        if result.crisis_detected:
            self.add_domain_event(
                CrisisTriggeredEvent(
                    run_id=self._id,
                    user_id=self._user_id
                )
            )
    
    def abandon(self) -> None:
        """Помечает прохождение как заброшенное."""
        if self._status.value == 'completed':
            raise ValueError("Cannot abandon completed run")
        
        self._status = RunStatus.ABANDONED
        
        self.add_domain_event(
            InteractiveRunAbandonedEvent(
                run_id=self._id
            )
        )
    
    def link_to_user(self, user_id: UserId) -> None:
        """Связывает прохождение с пользователем."""
        if self._user_id:
            raise ValueError("Run is already linked to a user")
        
        self._user_id = user_id
    
    @property
    def id(self) -> InteractiveRunId:
        return self._id
    
    @property
    def user_id(self) -> Optional[UserId]:
        return self._user_id
    
    @property
    def status(self) -> RunStatus:
        return self._status
    
    @property
    def result(self) -> Optional[InteractiveResult]:
        return self._result
    
    @property
    def metadata(self) -> RunMetadata:
        return self._metadata
    
    @property
    def completed_at(self) -> Optional[datetime]:
        return self._completed_at

    @property
    def started_at(self) -> datetime:
        return self._started_at
