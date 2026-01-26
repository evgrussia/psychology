"""
Identity & Access repository interfaces.
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID

from domain.identity.entities import User


class IUserRepository(ABC):
    """Интерфейс репозитория пользователей."""
    
    @abstractmethod
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Получить пользователя по ID."""
        pass
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        """Получить пользователя по email."""
        pass
    
    @abstractmethod
    def get_by_telegram_id(self, telegram_user_id: str) -> Optional[User]:
        """Получить пользователя по Telegram ID."""
        pass
    
    @abstractmethod
    def save(self, user: User) -> User:
        """Сохранить пользователя."""
        pass
    
    @abstractmethod
    def delete(self, user_id: UUID) -> None:
        """Удалить пользователя (soft delete)."""
        pass
    
    @abstractmethod
    def get_password_hash(self, user_id: UUID) -> Optional[str]:
        """Получить hash пароля пользователя."""
        pass
    
    @abstractmethod
    def get_user_roles(self, user_id: UUID) -> List[str]:
        """Получить список ролей пользователя (коды ролей)."""
        pass


class IConsentRepository(ABC):
    """Интерфейс репозитория согласий."""
    
    @abstractmethod
    def get_user_consent(self, user_id: UUID, consent_type: str) -> Optional[bool]:
        """Получить статус согласия пользователя."""
        pass
    
    @abstractmethod
    def grant_consent(self, user_id: UUID, consent_type: str, version: str, source: str) -> None:
        """Предоставить согласие."""
        pass
    
    @abstractmethod
    def revoke_consent(self, user_id: UUID, consent_type: str) -> None:
        """Отозвать согласие."""
        pass
