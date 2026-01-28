"""
Answer Entity.
"""
from datetime import datetime
from domain.shared.entity_id import EntityId
from domain.identity.aggregates.user import UserId


class AnswerId(EntityId):
    """ID ответа."""
    pass


class Answer:
    """Entity: Ответ на вопрос."""
    
    def __init__(
        self,
        id: AnswerId,
        author_id: UserId,
        content: str,  # Зашифрованное содержимое
        created_at: datetime
    ):
        self._id = id
        self._author_id = author_id
        self._content = content
        self._created_at = created_at
    
    @property
    def id(self) -> AnswerId:
        return self._id
    
    @property
    def author_id(self) -> UserId:
        return self._author_id
