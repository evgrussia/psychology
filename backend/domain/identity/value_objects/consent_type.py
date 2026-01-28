"""
ConsentType Value Object.
"""
from domain.shared.value_object import ValueObject


class ConsentType(ValueObject):
    """Value Object для типа согласия."""
    
    def __init__(self, value: str):
        if value not in [
            'personal_data',
            'communications',
            'telegram',
            'review_publication'
        ]:
            raise ValueError(f"Invalid consent type: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные типы
    PERSONAL_DATA = None
    COMMUNICATIONS = None
    TELEGRAM = None
    REVIEW_PUBLICATION = None


ConsentType.PERSONAL_DATA = ConsentType('personal_data')
ConsentType.COMMUNICATIONS = ConsentType('communications')
ConsentType.TELEGRAM = ConsentType('telegram')
ConsentType.REVIEW_PUBLICATION = ConsentType('review_publication')
