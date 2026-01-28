"""
BookingMetadata Value Object.
"""
from typing import Optional, Dict, Any
from domain.shared.value_object import ValueObject


class BookingMetadata(ValueObject):
    """Value Object для метаданных бронирования."""
    
    def __init__(
        self,
        deep_link_id: Optional[str] = None,
        utm_source: Optional[str] = None,
        utm_medium: Optional[str] = None,
        utm_campaign: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None
    ):
        self._deep_link_id = deep_link_id
        self._utm_source = utm_source
        self._utm_medium = utm_medium
        self._utm_campaign = utm_campaign
        self._additional_data = additional_data or {}
    
    @property
    def deep_link_id(self) -> Optional[str]:
        return self._deep_link_id
    
    @property
    def utm_source(self) -> Optional[str]:
        return self._utm_source
    
    @property
    def utm_medium(self) -> Optional[str]:
        return self._utm_medium
    
    @property
    def utm_campaign(self) -> Optional[str]:
        return self._utm_campaign
    
    @property
    def additional_data(self) -> Dict[str, Any]:
        return self._additional_data.copy()
