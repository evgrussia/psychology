"""
Unit тесты для VerifyMfaUseCase.
"""
import pytest
from unittest.mock import Mock
from uuid import uuid4

from application.identity.use_cases.verify_mfa import VerifyMfaUseCase
from application.exceptions import NotFoundError, UnauthorizedError


class TestVerifyMfaUseCase:
    """Тесты для VerifyMfaUseCase."""

    def test_verify_success(self):
        """Успешная верификация TOTP кода."""
        user_id = uuid4()
        secret = "JBSWY3DPEHPK3PXP"
        encrypted_secret = "encrypted_" + secret

        user_repository = Mock()
        user_repository.get_mfa_secret_encrypted.return_value = encrypted_secret
        user_repository.get_django_model.return_value = Mock(email="user@example.com")

        encryption_service = Mock()
        encryption_service.decrypt.return_value = secret

        use_case = VerifyMfaUseCase(user_repository, encryption_service)

        import pyotp
        totp = pyotp.TOTP(secret)
        code = totp.now()

        result = use_case.execute(user_id, code)

        assert result.user_id == user_id
        assert result.email == "user@example.com"
        user_repository.get_mfa_secret_encrypted.assert_called_once_with(user_id)
        encryption_service.decrypt.assert_called_once_with(encrypted_secret)
        user_repository.get_django_model.assert_called_once_with(user_id)

    def test_verify_mfa_not_configured(self):
        """MFA не настроен для пользователя."""
        user_id = uuid4()
        user_repository = Mock()
        user_repository.get_mfa_secret_encrypted.return_value = None
        encryption_service = Mock()

        use_case = VerifyMfaUseCase(user_repository, encryption_service)

        with pytest.raises(NotFoundError, match="MFA not configured"):
            use_case.execute(user_id, "123456")

        user_repository.get_mfa_secret_encrypted.assert_called_once_with(user_id)
        encryption_service.decrypt.assert_not_called()

    def test_verify_invalid_code(self):
        """Неверный TOTP код."""
        user_id = uuid4()
        secret = "JBSWY3DPEHPK3PXP"
        encrypted_secret = "encrypted_" + secret

        user_repository = Mock()
        user_repository.get_mfa_secret_encrypted.return_value = encrypted_secret

        encryption_service = Mock()
        encryption_service.decrypt.return_value = secret

        use_case = VerifyMfaUseCase(user_repository, encryption_service)

        with pytest.raises(UnauthorizedError, match="Invalid or expired"):
            use_case.execute(user_id, "000000")

        user_repository.get_mfa_secret_encrypted.assert_called_once_with(user_id)
        encryption_service.decrypt.assert_called_once()
        user_repository.get_django_model.assert_not_called()
