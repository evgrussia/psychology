"""
Django ORM модель для Consent (из Domain Layer).
"""
from django.db import models
import uuid


class ConsentModel(models.Model):
    """
    Django ORM модель для Consent.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('UserModel', on_delete=models.CASCADE, related_name='consents')
    consent_type = models.CharField(
        max_length=50,
        choices=[
            ('personal_data', 'Personal Data'),
            ('communications', 'Communications'),
            ('telegram', 'Telegram'),
            ('review_publication', 'Review Publication'),
        ]
    )
    granted = models.BooleanField(default=False)
    version = models.CharField(max_length=50)  # например, "2026-01-26"
    source = models.CharField(
        max_length=20,
        choices=[
            ('web', 'Web'),
            ('telegram', 'Telegram'),
            ('admin', 'Admin'),
        ]
    )
    granted_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'consents'
        unique_together = [['user', 'consent_type']]
        indexes = [
            models.Index(fields=['user', 'consent_type']),
            models.Index(fields=['granted']),
        ]
