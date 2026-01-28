"""
InteractiveResult Value Object.
"""
from typing import Optional, Dict, Any
from domain.shared.value_object import ValueObject
from domain.interactive.value_objects.result_level import ResultLevel


class InteractiveResult(ValueObject):
    """Value Object для результата интерактива.
    
    Содержит только агрегаты (level, profile), не сырые ответы.
    """
    
    def __init__(
        self,
        level: ResultLevel,
        profile: Optional[Dict[str, Any]] = None,
        crisis_detected: bool = False
    ):
        self._level = level
        # Копируем profile, чтобы изменения в оригинале не влияли на Value Object
        self._profile = (profile.copy() if profile else {})
        self._crisis_detected = crisis_detected
    
    @property
    def level(self) -> ResultLevel:
        return self._level
    
    @property
    def profile(self) -> Dict[str, Any]:
        return self._profile.copy()
    
    @property
    def crisis_detected(self) -> bool:
        return self._crisis_detected
