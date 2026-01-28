"""
TelegramUser Value Object.
"""
from typing import Optional
from domain.shared.value_object import ValueObject


class TelegramUser(ValueObject):
    """Value Object для данных Telegram пользователя (только P0 данные)."""
    
    def __init__(
        self,
        user_id: int,
        username: Optional[str] = None
    ):
        self._user_id = user_id
        self._username = username
    
    @property
    def user_id(self) -> int:
        return self._user_id
    
    @property
    def username(self) -> Optional[str]:
        return self._username
