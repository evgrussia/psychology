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
    
    # Переопределяем groups и user_permissions из PermissionsMixin с related_name
    # чтобы избежать конфликта с auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='persistence_user_set',
        related_query_name='persistence_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='persistence_user_set',
        related_query_name='persistence_user',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    def has_active_consent(self, consent_type: str) -> bool:
        """Проверяет наличие активного согласия (для permissions)."""
        from infrastructure.persistence.django_models.consent import ConsentModel
        return ConsentModel.objects.filter(
            user=self,
            consent_type=consent_type,
            granted=True,
            revoked_at__isnull=True
        ).exists()
    
    def has_role(self, role_code) -> bool:
        """Проверяет наличие роли (для permissions)."""
        if hasattr(role_code, 'code'):
            role_code = role_code.code
            
        from infrastructure.persistence.django_models.role import UserRoleModel
        return UserRoleModel.objects.filter(
            user=self,
            role__code=role_code
        ).exists()

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['telegram_user_id']),
            models.Index(fields=['status']),
        ]
        # Исправляем конфликт с auth.User
        # PermissionsMixin добавляет groups и user_permissions, но мы не используем их
        # Если нужно использовать, нужно установить AUTH_USER_MODEL = 'persistence.UserModel'
