"""
Django ORM модель для User (из Domain Layer: domain.identity.entities.User)
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
import uuid


class UserModel(AbstractBaseUser, PermissionsMixin):
    """
    Django ORM модель для User.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    telegram_user_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    telegram_username = models.CharField(max_length=255, null=True, blank=True)
    display_name = models.CharField(max_length=255, null=True, blank=True)
    password_hash = models.CharField(max_length=255, null=True, blank=True)  # Argon2id hash
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('blocked', 'Blocked'),
            ('deleted', 'Deleted'),
        ],
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Явно определяем поля из PermissionsMixin с default значениями
    is_staff = models.BooleanField(
        default=False,
        help_text='Designates whether the user can log into this admin site.',
        verbose_name='staff status'
    )
    is_superuser = models.BooleanField(
        default=False,
        help_text='Designates that this user has all permissions without explicitly assigning them.',
        verbose_name='superuser status'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.',
        verbose_name='active'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['telegram_user_id']),
            models.Index(fields=['status']),
        ]
