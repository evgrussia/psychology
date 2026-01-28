"""
UTMParams Value Object.
"""
from typing import Optional
from domain.shared.value_object import ValueObject


class UTMParams(ValueObject):
    """Value Object для UTM параметров."""
    
    def __init__(
        self,
        source: Optional[str] = None,
        medium: Optional[str] = None,
        campaign: Optional[str] = None,
        term: Optional[str] = None,
        content: Optional[str] = None
    ):
        self._source = source
        self._medium = medium
        self._campaign = campaign
        self._term = term
        self._content = content
    
    @property
    def source(self) -> Optional[str]:
        return self._source
    
    @property
    def medium(self) -> Optional[str]:
        return self._medium
    
    @property
    def campaign(self) -> Optional[str]:
        return self._campaign
