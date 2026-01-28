"""
LeadIdentity Value Object.
"""
from typing import Optional
from domain.shared.value_object import ValueObject
from domain.identity.aggregates.user import UserId


class LeadIdentity(ValueObject):
    """Value Object для идентичности лида (только P0 данные)."""
    
    def __init__(
        self,
        user_id: Optional[UserId] = None,
        anonymous_id: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        telegram_id: Optional[int] = None
    ):
        self._user_id = user_id
        self._anonymous_id = anonymous_id
        self._email = email
        self._phone = phone
        self._telegram_id = telegram_id
    
    @property
    def user_id(self) -> Optional[UserId]:
        return self._user_id
