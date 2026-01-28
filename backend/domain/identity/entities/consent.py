"""
Consent Entity.
"""
from datetime import datetime, timezone
from typing import Optional
from domain.shared.entity_id import EntityId
from domain.identity.value_objects.consent_type import ConsentType
from domain.shared.exceptions import DomainError


class ConsentId(EntityId):
    """ID согласия."""
    pass


class Consent:
    """Entity: Согласие пользователя.
    
    Бизнес-правила:
    - Согласие может быть отозвано (revoked_at устанавливается)
    - Согласие активно, если revoked_at == None
    """
    
    def __init__(
        self,
        id: ConsentId,
        consent_type: ConsentType,
        version: str,
        source: str,
        granted_at: datetime,
        revoked_at: Optional[datetime]
    ):
        self._id = id
        self._consent_type = consent_type
        self._version = version
        self._source = source
        self._granted_at = granted_at
        self._revoked_at = revoked_at
    
    @classmethod
    def create(
        cls,
        consent_type: ConsentType,
        version: str,
        source: str
    ) -> "Consent":
        """Factory method для создания согласия."""
        return cls(
            id=ConsentId.generate(),
            consent_type=consent_type,
            version=version,
            source=source,
            granted_at=datetime.now(timezone.utc),
            revoked_at=None
        )
    
    def revoke(self) -> None:
        """Отзывает согласие.
        
        Raises:
            DomainError: Если согласие уже отозвано
        """
        if self._revoked_at:
            raise DomainError("Consent is already revoked")
        
        self._revoked_at = datetime.now(timezone.utc)
    
    def is_active(self) -> bool:
        """Проверяет, активно ли согласие."""
        return self._revoked_at is None
    
    # Getters
    @property
    def id(self) -> ConsentId:
        return self._id
    
    @property
    def consent_type(self) -> ConsentType:
        return self._consent_type
    
    @property
    def version(self) -> str:
        return self._version
    
    @property
    def source(self) -> str:
        return self._source
    
    @property
    def granted_at(self) -> datetime:
        return self._granted_at
    
    @property
    def revoked_at(self) -> Optional[datetime]:
        return self._revoked_at
