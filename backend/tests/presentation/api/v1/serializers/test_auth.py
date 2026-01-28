"""
Unit тесты для Auth Serializers.
"""
import pytest
from rest_framework.exceptions import ValidationError
from presentation.api.v1.serializers.auth import (
    RegisterSerializer,
    LoginSerializer,
    AuthResponseSerializer,
)


@pytest.mark.django_db
class TestRegisterSerializer:
    """Тесты для RegisterSerializer."""
    
    def test_valid_data(self):
        """Тест валидных данных."""
        serializer = RegisterSerializer(data={
            'email': 'user@example.com',
            'password': 'SecurePass123!',
            'display_name': 'Test User',
            'consents': {
                'personal_data': True,
                'communications': False,
            }
        })
        assert serializer.is_valid()
        assert serializer.validated_data['email'] == 'user@example.com'
        assert serializer.validated_data['password'] == 'SecurePass123!'
        assert serializer.validated_data['display_name'] == 'Test User'
    
    def test_missing_email(self):
        """Тест отсутствия email."""
        serializer = RegisterSerializer(data={
            'password': 'SecurePass123!',
        })
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
    
    def test_missing_password(self):
        """Тест отсутствия password."""
        serializer = RegisterSerializer(data={
            'email': 'user@example.com',
        })
        assert not serializer.is_valid()
        assert 'password' in serializer.errors
    
    def test_invalid_email(self):
        """Тест невалидного email."""
        serializer = RegisterSerializer(data={
            'email': 'invalid-email',
            'password': 'SecurePass123!',
        })
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
    
    def test_short_password(self):
        """Тест короткого пароля."""
        serializer = RegisterSerializer(data={
            'email': 'user@example.com',
            'password': 'Short1!',
        })
        assert not serializer.is_valid()
        assert 'password' in serializer.errors


@pytest.mark.django_db
class TestLoginSerializer:
    """Тесты для LoginSerializer."""
    
    def test_valid_data(self):
        """Тест валидных данных."""
        serializer = LoginSerializer(data={
            'email': 'user@example.com',
            'password': 'SecurePass123!',
        })
        assert serializer.is_valid()
        assert serializer.validated_data['email'] == 'user@example.com'
        assert serializer.validated_data['password'] == 'SecurePass123!'
    
    def test_missing_email(self):
        """Тест отсутствия email."""
        serializer = LoginSerializer(data={
            'password': 'SecurePass123!',
        })
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
    
    def test_missing_password(self):
        """Тест отсутствия password."""
        serializer = LoginSerializer(data={
            'email': 'user@example.com',
        })
        assert not serializer.is_valid()
        assert 'password' in serializer.errors
