"""
DiaryEntry Aggregate Root.
"""
from datetime import datetime, timezone
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.identity.aggregates.user import UserId
from domain.client_cabinet.value_objects.diary_type import DiaryType
from domain.client_cabinet.domain_events import (
    DiaryEntryCreatedEvent,
    DiaryEntryDeletedEvent
)


class DiaryEntryId(EntityId):
    """ID записи дневника."""
    pass


class DiaryEntry(AggregateRoot):
    """Aggregate Root для записи дневника.
    
    Бизнес-правила:
    - Дневники приватны по умолчанию (P2 данные, шифрование)
    - Удаление дневников — физическое или soft delete
    """
    
    def __init__(
        self,
        id: DiaryEntryId,
        user_id: UserId,
        diary_type: DiaryType,
        content: str,  # Зашифрованное содержимое
        created_at: datetime
    ):
        super().__init__()
        self._id = id
        self._user_id = user_id
        self._diary_type = diary_type
        self._content = content
        self._created_at = created_at
    
    @classmethod
    def create(
        cls,
        user_id: UserId,
        diary_type: DiaryType,
        content: str
    ) -> "DiaryEntry":
        """Factory method для создания записи дневника."""
        entry = cls(
            id=DiaryEntryId.generate(),
            user_id=user_id,
            diary_type=diary_type,
            content=content,
            created_at=datetime.now(timezone.utc)
        )
        
        entry.add_domain_event(
            DiaryEntryCreatedEvent(
                entry_id=entry._id,
                user_id=user_id
            )
        )
        
        return entry
    
    def update_content(self, new_content: str) -> None:
        """Обновляет текст записи."""
        self._content = new_content

    def delete(self) -> None:
        """Удаляет запись дневника."""
        self.add_domain_event(
            DiaryEntryDeletedEvent(
                entry_id=self._id,
                user_id=self._user_id
            )
        )
    
    @property
    def id(self) -> DiaryEntryId:
        return self._id
    
    @property
    def user_id(self) -> UserId:
        return self._user_id
    
    @property
    def diary_type(self) -> DiaryType:
        return self._diary_type
    
    @property
    def content(self) -> str:
        return self._content

    @property
    def created_at(self) -> datetime:
        return self._created_at
