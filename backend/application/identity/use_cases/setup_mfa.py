"""
Use Case: первичная настройка MFA (TOTP).
Генерация secret, QR-code payload, сохранение зашифрованного secret.
"""
from dataclasses import dataclass
from uuid import UUID
import pyotp
from application.interfaces.encryption import IEncryptionService
from application.exceptions import NotFoundError


@dataclass
class SetupMfaResult:
    """Результат настройки MFA."""
    provisioning_uri: str
    secret: str  # для ручного ввода в приложение


class SetupMfaUseCase:
    """Use Case для первичной настройки MFA (TOTP)."""

    def __init__(
        self,
        user_repository,  # SyncUserRepositoryWrapper: get_django_model, set_mfa_secret, set_mfa_enabled
        encryption_service: IEncryptionService,
    ):
        self._user_repository = user_repository
        self._encryption_service = encryption_service

    def execute(self, user_id: UUID, issuer_name: str = "Emotional Balance") -> SetupMfaResult:
        """
        Сгенерировать TOTP secret, сохранить зашифрованным, вернуть provisioning_uri и secret.

        Args:
            user_id: ID пользователя
            issuer_name: Имя приложения для QR (issuer в otpauth URI)

        Returns:
            SetupMfaResult с provisioning_uri и secret

        Raises:
            NotFoundError: если пользователь не найден
        """
        user_model = self._user_repository.get_django_model(user_id)
        if not user_model:
            raise NotFoundError("User not found")

        email = user_model.email or "user"
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=email,
            issuer_name=issuer_name,
        )

        encrypted_secret = self._encryption_service.encrypt(secret)
        self._user_repository.set_mfa_secret(user_id, encrypted_secret)
        self._user_repository.set_mfa_enabled(user_id, True)

        return SetupMfaResult(provisioning_uri=provisioning_uri, secret=secret)
