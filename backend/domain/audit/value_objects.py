"""
Audit value objects.
"""
from enum import Enum


class AuditAction(Enum):
    """Действия для аудит-лога."""
    ADMIN_PRICE_CHANGED = "admin_price_changed"
    ADMIN_DATA_EXPORTED = "admin_data_exported"
    ADMIN_CONTENT_PUBLISHED = "admin_content_published"
    ADMIN_USER_DELETED = "admin_user_deleted"
    ADMIN_ROLE_CHANGED = "admin_role_changed"
    ADMIN_CONSENT_REVOKED = "admin_consent_revoked"


class AuditEntityType(Enum):
    """Типы сущностей для аудит-лога."""
    SERVICE = "service"
    CONTENT = "content"
    USER = "user"
    PAYMENT = "payment"
    APPOINTMENT = "appointment"
