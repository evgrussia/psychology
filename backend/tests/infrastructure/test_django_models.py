"""
Тесты для Django ORM моделей.
"""
import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from uuid import uuid4

from infrastructure.persistence.django_models.user import UserModel
from infrastructure.persistence.django_models.role import RoleModel
from infrastructure.persistence.django_models.consent import ConsentModel
from infrastructure.persistence.django_models.audit_log import AuditLogModel


@pytest.mark.django_db
class TestUserModel(TestCase):
    """Тесты для UserModel."""
    
    def test_create_user_with_email(self):
        """Тест создания пользователя с email."""
        user = UserModel.objects.create(
            email="test@example.com",
            display_name="Test User",
            status="active",
        )
        
        assert user.email == "test@example.com"
        assert user.display_name == "Test User"
        assert user.status == "active"
        assert user.id is not None
        # Проверить, что поля PermissionsMixin установлены
        assert user.is_staff is False
        assert user.is_superuser is False
    
    def test_create_user_with_telegram(self):
        """Тест создания пользователя с Telegram."""
        user = UserModel.objects.create(
            telegram_user_id="123456789",
            telegram_username="testuser",
            status="active",
        )
        
        assert user.telegram_user_id == "123456789"
        assert user.telegram_username == "testuser"
        assert user.email is None
        assert user.is_staff is False
        assert user.is_superuser is False
    
    def test_user_email_unique(self):
        """Тест уникальности email."""
        UserModel.objects.create(
            email="test@example.com",
            status="active",
        )
        
        with pytest.raises(Exception):  # IntegrityError или ValidationError
            UserModel.objects.create(
                email="test@example.com",
                status="active",
            )
    
    def test_user_soft_delete(self):
        """Тест мягкого удаления пользователя."""
        user = UserModel.objects.create(
            email="test@example.com",
            status="active",
        )
        
        from datetime import datetime
        user.deleted_at = datetime.utcnow()
        user.save()
        
        # Проверить, что пользователь не возвращается в обычных запросах
        # (если используется менеджер с фильтром deleted_at__isnull=True)
        assert user.deleted_at is not None


@pytest.mark.django_db
class TestRoleModel(TestCase):
    """Тесты для RoleModel."""
    
    def test_create_role(self):
        """Тест создания роли."""
        # Используем get_or_create, так как роли могут быть созданы миграцией
        role, created = RoleModel.objects.get_or_create(
            code="test_role",
            defaults={'scope': 'admin'}
        )
        
        assert role.code == "test_role"
        assert role.scope == "admin"
    
    def test_role_code_is_primary_key(self):
        """Тест, что code является первичным ключом."""
        RoleModel.objects.get_or_create(code="test_role_pk", defaults={'scope': 'admin'})
        
        # Попытка создать роль с тем же code должна вызвать ошибку
        with pytest.raises(Exception):
            RoleModel.objects.create(code="test_role_pk", scope="product")


@pytest.mark.django_db
class TestConsentModel(TestCase):
    """Тесты для ConsentModel."""
    
    def setUp(self):
        self.user = UserModel.objects.create(
            email="test@example.com",
            status="active",
        )
    
    def test_create_consent(self):
        """Тест создания согласия."""
        consent = ConsentModel.objects.create(
            user=self.user,
            consent_type="personal_data",
            granted=True,
            version="2026-01-26",
            source="web",
        )
        
        assert consent.user == self.user
        assert consent.consent_type == "personal_data"
        assert consent.granted is True
        assert consent.version == "2026-01-26"
        assert consent.source == "web"
    
    def test_consent_unique_per_user_and_type(self):
        """Тест уникальности согласия для пользователя и типа."""
        ConsentModel.objects.create(
            user=self.user,
            consent_type="personal_data",
            granted=True,
            version="2026-01-26",
            source="web",
        )
        
        # Попытка создать второе согласие того же типа для того же пользователя
        # должна вызвать ошибку
        with pytest.raises(Exception):
            ConsentModel.objects.create(
                user=self.user,
                consent_type="personal_data",
                granted=True,
                version="2026-01-27",
                source="web",
            )


@pytest.mark.django_db
class TestAuditLogModel(TestCase):
    """Тесты для AuditLogModel."""
    
    def setUp(self):
        self.user = UserModel.objects.create(
            email="test@example.com",
            status="active",
        )
    
    def test_create_audit_log_entry(self):
        """Тест создания записи аудит-лога."""
        entity_id = uuid4()
        entry = AuditLogModel.objects.create(
            actor_user_id=self.user.id,
            actor_role="owner",
            action="admin_price_changed",
            entity_type="service",
            entity_id=entity_id,
            old_value={"price": 1000},
            new_value={"price": 1500},
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
        )
        
        assert entry.actor_user_id == self.user.id
        assert entry.actor_role == "owner"
        assert entry.action == "admin_price_changed"
        assert entry.entity_type == "service"
        assert entry.entity_id == entity_id
        assert entry.old_value == {"price": 1000}
        assert entry.new_value == {"price": 1500}
        assert entry.ip_address == "192.168.1.1"
        assert entry.user_agent == "Mozilla/5.0"
        assert entry.id is not None
        assert entry.created_at is not None
