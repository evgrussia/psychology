"""
User Aggregate Root.
"""
from datetime import datetime, timezone
from typing import List, Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.shared.exceptions import DomainError
from domain.identity.entities.consent import Consent
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.value_objects.role import Role
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.consent_type import ConsentType
from domain.identity.domain_events import (
    UserCreatedEvent,
    ConsentGrantedEvent,
    ConsentRevokedEvent,
    RoleAssignedEvent,
    UserBlockedEvent
)


class UserId(EntityId):
    """ID пользователя."""
    pass


class User(AggregateRoot):
    """Aggregate Root для пользователя.
    
    Бизнес-правила:
    - Пользователь должен иметь хотя бы один способ связи (email/phone/telegram)
    - Согласия должны быть уникальными по типу (нельзя иметь два активных согласия одного типа)
    - Роли назначаются явно (по умолчанию - Client)
    - Блокировка пользователя меняет статус на Blocked
    """
    
    def __init__(
        self,
        id: UserId,
        email: Optional[Email],
        phone: Optional[PhoneNumber],
        telegram_user_id: Optional[str],
        display_name: Optional[str],
        status: UserStatus,
        roles: List[Role],
        consents: List[Consent],
        created_at: datetime
    ):
        super().__init__()
        self._id = id
        self._email = email
        self._phone = phone
        self._telegram_user_id = telegram_user_id
        self._display_name = display_name
        self._status = status
        self._roles = roles
        self._consents = consents
        self._created_at = created_at
    
    @classmethod
    def create(
        cls,
        email: Optional[Email] = None,
        phone: Optional[PhoneNumber] = None,
        telegram_user_id: Optional[str] = None
    ) -> "User":
        """Factory method для создания нового пользователя.
        
        Args:
            email: Email пользователя (опционально)
            phone: Телефон пользователя (опционально)
            telegram_user_id: Telegram user ID (опционально)
        
        Returns:
            Новый экземпляр User
        
        Raises:
            DomainError: Если не указан ни один способ связи
        """
        if not email and not phone and not telegram_user_id:
            raise DomainError("At least one contact method is required")
        
        user = cls(
            id=UserId.generate(),
            email=email,
            phone=phone,
            telegram_user_id=telegram_user_id,
            display_name=None,
            status=UserStatus.ACTIVE,
            roles=[Role.CLIENT],  # По умолчанию роль Client
            consents=[],
            created_at=datetime.now(timezone.utc)
        )
        
        user.add_domain_event(
            UserCreatedEvent(
                user_id=user._id,
                email=email,
                phone=phone,
                telegram_user_id=telegram_user_id
            )
        )
        
        return user
    
    def grant_consent(
        self,
        consent_type: ConsentType,
        version: str,
        source: str
    ) -> None:
        """Выдает согласие пользователя.
        
        Args:
            consent_type: Тип согласия
            version: Версия политики согласия
            source: Источник согласия (web/telegram/admin)
        
        Raises:
            DomainError: Если согласие такого типа уже выдано
        """
        # Проверяем, нет ли уже активного согласия
        existing_consent = next(
            (c for c in self._consents 
             if c.consent_type == consent_type and c.is_active()),
            None
        )
        
        if existing_consent:
            raise DomainError(
                f"Consent of type {consent_type.value} already granted"
            )
        
        consent = Consent.create(consent_type, version, source)
        self._consents.append(consent)
        
        self.add_domain_event(
            ConsentGrantedEvent(
                user_id=self._id,
                consent_type=consent_type,
                version=version
            )
        )
    
    def revoke_consent(self, consent_type: ConsentType) -> None:
        """Отзывает согласие пользователя.
        
        Args:
            consent_type: Тип согласия для отзыва
        
        Raises:
            DomainError: Если активное согласие не найдено
        """
        consent = next(
            (c for c in self._consents 
             if c.consent_type == consent_type and c.is_active()),
            None
        )
        
        if not consent:
            raise DomainError(
                f"Active consent of type {consent_type.value} not found"
            )
        
        consent.revoke()
        
        self.add_domain_event(
            ConsentRevokedEvent(
                user_id=self._id,
                consent_type=consent_type
            )
        )
    
    def assign_role(self, role: Role) -> None:
        """Назначает роль пользователю.
        
        Args:
            role: Роль для назначения
        
        Raises:
            DomainError: Если роль уже назначена
        """
        if role in self._roles:
            raise DomainError(f"Role {role.code} already assigned")
        
        self._roles.append(role)
        
        self.add_domain_event(
            RoleAssignedEvent(
                user_id=self._id,
                role=role
            )
        )
    
    def block(self, reason: str) -> None:
        """Блокирует пользователя.
        
        Args:
            reason: Причина блокировки
        
        Raises:
            DomainError: Если пользователь уже не активен
        """
        if not self._status.is_active():
            raise DomainError("User is not active")
        
        self._status = UserStatus.BLOCKED
        
        self.add_domain_event(
            UserBlockedEvent(
                user_id=self._id,
                reason=reason
            )
        )
    
    def has_active_consent(self, consent_type: ConsentType) -> bool:
        """Проверяет наличие активного согласия.
        
        Args:
            consent_type: Тип согласия
        
        Returns:
            True если согласие активно, иначе False
        """
        return any(
            c.consent_type == consent_type and c.is_active()
            for c in self._consents
        )
    
    def has_role(self, role: Role) -> bool:
        """Проверяет наличие роли.
        
        Args:
            role: Роль для проверки
        
        Returns:
            True если роль назначена, иначе False
        """
        return role in self._roles
    
    # Getters
    @property
    def id(self) -> UserId:
        return self._id
    
    @property
    def email(self) -> Optional[Email]:
        return self._email
    
    @property
    def phone(self) -> Optional[PhoneNumber]:
        return self._phone
    
    @property
    def telegram_user_id(self) -> Optional[str]:
        return self._telegram_user_id
    
    @property
    def status(self) -> UserStatus:
        return self._status
    
    @property
    def display_name(self) -> Optional[str]:
        return self._display_name
    
    @property
    def roles(self) -> List[Role]:
        return list(self._roles)
    
    @property
    def consents(self) -> List[Consent]:
        return list(self._consents)
    
    def delete(self) -> None:
        """Удаляет пользователя (GDPR/152-ФЗ).
        
        Анонимизирует персональные данные пользователя:
        - Удаляет email, phone, telegram_user_id
        - Удаляет display_name
        - Меняет статус на DELETED
        
        Примечание: Связи с другими агрегатами (appointments, diary entries, etc.)
        должны быть анонимизированы отдельно через соответствующие репозитории.
        """
        from domain.identity.value_objects.user_status import UserStatus
        
        # Анонимизация персональных данных
        self._email = None
        self._phone = None
        self._telegram_user_id = None
        self._display_name = None
        self._status = UserStatus.DELETED
        
        # Событие будет добавлено в Use Case, так как требуется координация
        # с другими агрегатами
