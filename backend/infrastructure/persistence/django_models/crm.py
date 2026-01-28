"""
Django ORM модели для CRM/Analytics Domain (Lead).
"""
from django.db import models
from uuid import uuid4


class LeadModel(models.Model):
    """Django ORM модель для Lead Aggregate Root."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    
    # LeadIdentity Value Object → JSONField (P0 данные, без PII)
    identity_data = models.JSONField(default=dict)  # userId, anonymousId, email_hash, phone_hash, telegram_user_id
    
    # LeadSource Value Object → CharField
    source = models.CharField(
        max_length=50,
        choices=[
            ('web', 'Web'),
            ('telegram', 'Telegram'),
            ('referral', 'Referral'),
            ('organic', 'Organic'),
        ]
    )
    
    # LeadStatus Value Object → CharField
    status = models.CharField(
        max_length=20,
        choices=[
            ('new', 'New'),
            ('contacted', 'Contacted'),
            ('qualified', 'Qualified'),
            ('converted', 'Converted'),
            ('lost', 'Lost'),
        ],
        default='new',
        db_index=True
    )
    
    # UTMParams Value Object → JSONField
    utm_params = models.JSONField(null=True, blank=True)
    
    # TimelineEvent Value Objects → JSONField (список событий)
    timeline_events = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'leads'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['source']),
        ]
