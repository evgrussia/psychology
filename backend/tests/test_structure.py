"""
Тесты структуры проекта.
"""
import pytest
from django.test import TestCase


class TestProjectStructure(TestCase):
    """Тесты структуры проекта."""
    
    def test_domain_layer_imports(self):
        """Проверка, что Domain Layer импортируется без Django."""
        from domain.identity.entities import User
        from domain.identity.value_objects import Email
        from domain.audit.entities import AuditLogEntry
        
        assert User is not None
        assert Email is not None
        assert AuditLogEntry is not None
    
    def test_application_layer_imports(self):
        """Проверка, что Application Layer импортируется."""
        from application.identity.use_cases.authenticate_user import AuthenticateUserUseCase
        from application.audit.use_cases.log_audit_event import LogAuditEventUseCase
        
        assert AuthenticateUserUseCase is not None
        assert LogAuditEventUseCase is not None
    
    def test_infrastructure_layer_imports(self):
        """Проверка, что Infrastructure Layer импортируется."""
        from infrastructure.persistence.django_models.user import UserModel
        from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
        
        assert UserModel is not None
        assert DjangoUserRepository is not None
