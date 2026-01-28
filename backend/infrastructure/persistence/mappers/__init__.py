"""
Mappers для преобразования Domain Entity ↔ DB Record.
"""
from .booking_mapper import AppointmentMapper, ServiceMapper
from .content_mapper import ContentItemMapper
from .client_cabinet_mapper import DiaryEntryMapper
from .interactive_mapper import InteractiveRunMapper
from .telegram_mapper import TelegramMapper
from .moderation_mapper import ModerationMapper
from .crm_mapper import CRMMapper

__all__ = [
    'AppointmentMapper',
    'ServiceMapper',
    'ContentItemMapper',
    'DiaryEntryMapper',
    'InteractiveRunMapper',
    'TelegramMapper',
    'ModerationMapper',
    'CRMMapper',
]
