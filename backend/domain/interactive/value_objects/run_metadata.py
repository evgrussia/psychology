"""
RunMetadata Value Object.
"""
from typing import Optional, Dict, Any
from domain.shared.value_object import ValueObject


class RunMetadata(ValueObject):
    """Value Object для метаданных прохождения интерактива."""
    
    def __init__(
        self,
        interactive_slug: str,
        additional_data: Optional[Dict[str, Any]] = None
    ):
        self._interactive_slug = interactive_slug
        # Копируем additional_data, чтобы изменения в оригинале не влияли на Value Object
        self._additional_data = (additional_data.copy() if additional_data else {})
    
    @property
    def interactive_slug(self) -> str:
        return self._interactive_slug
    
    @property
    def additional_data(self) -> Dict[str, Any]:
        return self._additional_data.copy()
