"""
Тесты для LogAuditEventUseCase.
"""
import pytest
from unittest.mock import Mock
from uuid import uuid4
from datetime import datetime

from domain.audit.entities import AuditLogEntry
from application.audit.use_cases.log_audit_event import LogAuditEventUseCase


class TestLogAuditEventUseCase:
    """Тесты для LogAuditEventUseCase."""
    
    def test_log_audit_event_success(self):
        """Тест успешного логирования события."""
        # Arrange
        actor_user_id = uuid4()
        entity_id = uuid4()
        entry_id = uuid4()
        
        saved_entry = AuditLogEntry(
            id=entry_id,
            actor_user_id=actor_user_id,
            actor_role="owner",
            action="admin_price_changed",
            entity_type="service",
            entity_id=entity_id,
            old_value={"price": 1000},
            new_value={"price": 1500},
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        audit_repository = Mock()
        audit_repository.save.return_value = saved_entry
        
        use_case = LogAuditEventUseCase(audit_repository)
        
        # Act
        result = use_case.execute(
            actor_user_id=actor_user_id,
            actor_role="owner",
            action="admin_price_changed",
            entity_type="service",
            entity_id=entity_id,
            old_value={"price": 1000},
            new_value={"price": 1500},
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
        )
        
        # Assert
        assert result is not None
        assert result.id == entry_id
        assert result.actor_user_id == actor_user_id
        assert result.action == "admin_price_changed"
        assert result.entity_type == "service"
        audit_repository.save.assert_called_once()
        
        # Проверить, что сохраненная запись правильная
        saved_call = audit_repository.save.call_args[0][0]
        assert saved_call.actor_user_id == actor_user_id
        assert saved_call.action == "admin_price_changed"
        assert saved_call.entity_type == "service"
        assert saved_call.old_value == {"price": 1000}
        assert saved_call.new_value == {"price": 1500}
    
    def test_log_audit_event_without_optional_fields(self):
        """Тест логирования события без опциональных полей."""
        # Arrange
        entry_id = uuid4()
        saved_entry = AuditLogEntry(
            id=entry_id,
            actor_user_id=None,
            actor_role="assistant",
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
        
        audit_repository = Mock()
        audit_repository.save.return_value = saved_entry
        
        use_case = LogAuditEventUseCase(audit_repository)
        
        # Act
        result = use_case.execute(
            actor_user_id=None,
            actor_role="assistant",
            action="admin_data_exported",
            entity_type="user",
        )
        
        # Assert
        assert result is not None
        assert result.actor_user_id is None
        assert result.entity_id is None
        audit_repository.save.assert_called_once()
