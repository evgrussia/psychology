"""
LeadStatus Value Object.
"""
from domain.shared.value_object import ValueObject


class LeadStatus(ValueObject):
    """Value Object для статуса лида."""
    
    def __init__(self, value: str):
        valid_statuses = ['new', 'contacted', 'qualified', 'converted', 'lost']
        if value not in valid_statuses:
            raise ValueError(f"Invalid lead status: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    NEW = None
    CONTACTED = None
    QUALIFIED = None
    CONVERTED = None
    LOST = None


LeadStatus.NEW = LeadStatus('new')
LeadStatus.CONTACTED = LeadStatus('contacted')
LeadStatus.QUALIFIED = LeadStatus('qualified')
LeadStatus.CONVERTED = LeadStatus('converted')
LeadStatus.LOST = LeadStatus('lost')
