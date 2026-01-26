"""
Django ORM модель для AuditLog (из Domain Layer).
"""
from django.db import models
import uuid


class AuditLogModel(models.Model):
    """
    Django ORM модель для AuditLog.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor_user_id = models.UUIDField(null=True, blank=True, db_index=True)
    actor_role = models.CharField(
        max_length=20,
        choices=[
            ('owner', 'Owner'),
            ('assistant', 'Assistant'),
            ('editor', 'Editor'),
        ]
    )
    action = models.CharField(max_length=100)  # например, "admin_price_changed"
    entity_type = models.CharField(max_length=50)  # например, "service", "content", "user"
    entity_id = models.UUIDField(null=True, blank=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_log'
        indexes = [
            models.Index(fields=['actor_user_id', 'created_at']),
            models.Index(fields=['action']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
