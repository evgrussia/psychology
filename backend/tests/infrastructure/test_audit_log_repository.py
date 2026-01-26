"""
Тесты для DjangoAuditLogRepository.
"""
import pytest
from django.test import TestCase
from uuid import uuid4
from datetime import datetime

from domain.audit.entities import AuditLogEntry
from infrastructure.persistence.repositories.audit_log_repository import DjangoAuditLogRepository
from infrastructure.persistence.django_models.audit_log import AuditLogModel
from infrastructure.persistence.django_models.user import UserModel


@pytest.mark.django_db
class TestDjangoAuditLogRepository(TestCase):
    """Тесты для DjangoAuditLogRepository."""
    
    def setUp(self):
        self.repository = DjangoAuditLogRepository()
        # Создать тестового пользователя для actor_user_id
        self.user = UserModel.objects.create(
            email="test@example.com",
            status="active",
        )
    
    def test_save_audit_log_entry(self):
        """Тест сохранения записи аудит-лога."""
        # Arrange
        entry = AuditLogEntry(
            id=uuid4(),
            actor_user_id=self.user.id,
            actor_role="owner",
            action="admin_price_changed",
            entity_type="service",
            entity_id=uuid4(),
            old_value={"price": 1000},
            new_value={"price": 1500},
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        # Act
        saved_entry = self.repository.save(entry)
        
        # Assert
        assert saved_entry.id == entry.id
        assert saved_entry.actor_user_id == self.user.id
        assert saved_entry.action == "admin_price_changed"
        
        # Проверить, что запись сохранена в БД
        db_entry = AuditLogModel.objects.get(id=entry.id)
        assert db_entry.actor_user_id == self.user.id
        assert db_entry.action == "admin_price_changed"
        assert db_entry.old_value == {"price": 1000}
        assert db_entry.new_value == {"price": 1500}
    
    def test_save_audit_log_entry_without_optional_fields(self):
        """Тест сохранения записи без опциональных полей."""
        # Arrange
        entry = AuditLogEntry(
            id=uuid4(),
            actor_user_id=None,
            actor_role="assistant",  # actor_role обязателен
            action="admin_data_exported",
            entity_type="user",
            entity_id=None,
            old_value=None,
            new_value=None,
            ip_address=None,
            user_agent=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        # Act
        saved_entry = self.repository.save(entry)
        
        # Assert
        assert saved_entry.id == entry.id
        assert saved_entry.actor_user_id is None
        assert saved_entry.entity_id is None
        
        # Проверить в БД
        db_entry = AuditLogModel.objects.get(id=entry.id)
        assert db_entry.actor_user_id is None
        assert db_entry.entity_id is None
    
    def test_get_by_actor(self):
        """Тест получения записей по актору."""
        # Arrange
        entity_id = uuid4()
        entry1 = AuditLogEntry(
            id=uuid4(),
            actor_user_id=self.user.id,
            actor_role="owner",
            action="admin_price_changed",
            entity_type="service",
            entity_id=entity_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        entry2 = AuditLogEntry(
            id=uuid4(),
            actor_user_id=self.user.id,
            actor_role="owner",
            action="admin_user_deleted",
            entity_type="user",
            entity_id=uuid4(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        self.repository.save(entry1)
        self.repository.save(entry2)
        
        # Act
        entries = self.repository.get_by_actor(self.user.id, limit=10)
        
        # Assert
        assert len(entries) == 2
        assert all(e.actor_user_id == self.user.id for e in entries)
    
    def test_get_by_entity(self):
        """Тест получения записей по сущности."""
        # Arrange
        entity_id = uuid4()
        entry1 = AuditLogEntry(
            id=uuid4(),
            actor_user_id=self.user.id,
            actor_role="owner",
            action="admin_price_changed",
            entity_type="service",
            entity_id=entity_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        entry2 = AuditLogEntry(
            id=uuid4(),
            actor_user_id=self.user.id,
            actor_role="owner",
            action="admin_price_changed_again",
            entity_type="service",
            entity_id=entity_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        self.repository.save(entry1)
        self.repository.save(entry2)
        
        # Act
        entries = self.repository.get_by_entity("service", entity_id)
        
        # Assert
        assert len(entries) == 2
        assert all(e.entity_type == "service" and e.entity_id == entity_id for e in entries)
