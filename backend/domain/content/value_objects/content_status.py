"""
ContentStatus Value Object.
"""
from domain.shared.value_object import ValueObject


class ContentStatus(ValueObject):
    """Value Object для статуса контента."""
    
    def __init__(self, value: str):
        valid_statuses = ['draft', 'published', 'archived']
        if value not in valid_statuses:
            raise ValueError(f"Invalid content status: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    DRAFT = None
    PUBLISHED = None
    ARCHIVED = None


ContentStatus.DRAFT = ContentStatus('draft')
ContentStatus.PUBLISHED = ContentStatus('published')
ContentStatus.ARCHIVED = ContentStatus('archived')
