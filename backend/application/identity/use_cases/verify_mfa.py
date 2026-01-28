"""
Use Case: проверка TOTP кода при входе с MFA.
При успехе возвращает пользователя для выдачи JWT/cookies.
"""
from dataclasses import dataclass
from uuid import UUID
import pyotp
from application.interfaces.encryption import IEncryptionService
from application.exceptions import NotFoundError, UnauthorizedError


@dataclass
class VerifyMfaResult:
    """Результат верификации MFA."""
    user_id: UUID
    email: str


class VerifyMfaUseCase:
    """Use Case для проверки TOTP кода при входе с MFA."""

    def __init__(
        self,
        user_repository,  # SyncUserRepositoryWrapper: get_mfa_secret_encrypted, get_django_model
        encryption_service: IEncryptionService,
    ):
        self._user_repository = user_repository
        self._encryption_service = encryption_service

    def execute(self, user_id: UUID, code: str) -> VerifyMfaResult:
        """
        Проверить TOTP код. При успехе вернуть данные пользователя для выдачи сессии.

        Args:
            user_id: ID пользователя (из mfa_pending cookie)
            code: 6-значный код из приложения 2FA

        Returns:
            VerifyMfaResult с user_id и email

        Raises:
            NotFoundError: если пользователь не найден или MFA не настроен
            UnauthorizedError: если код неверный
        """
        encrypted_secret = self._user_repository.get_mfa_secret_encrypted(user_id)
        if not encrypted_secret:
            raise NotFoundError("MFA not configured for this user")

        try:
            secret = self._encryption_service.decrypt(encrypted_secret)
        except Exception:
            raise UnauthorizedError("Invalid MFA configuration")

        totp = pyotp.TOTP(secret)
        if not totp.verify(code, valid_window=1):
            raise UnauthorizedError("Invalid or expired code")

        user_model = self._user_repository.get_django_model(user_id)
        if not user_model:
            raise NotFoundError("User not found")

        return VerifyMfaResult(
            user_id=user_id,
            email=user_model.email or "",
        )
