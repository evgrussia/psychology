"""
FernetEncryption реализация шифрования.
"""
from cryptography.fernet import Fernet
from application.interfaces.encryption import IEncryptionService
from infrastructure.exceptions import InfrastructureError
import os


class FernetEncryptionService(IEncryptionService):
    """Реализация шифрования через Fernet (symmetric encryption)."""
    
    def __init__(self, key: bytes = None):
        if key is None:
            # Пытаемся получить ключ из переменных окружения
            key_str = os.environ.get('ENCRYPTION_KEY')
            
            # Fallback на настройки Django
            if not key_str:
                try:
                    from django.conf import settings
                    key_str = getattr(settings, 'ENCRYPTION_KEY', None)
                except ImportError:
                    pass
            
            if not key_str:
                # В соответствии с требованием H-003: 
                # сервис НЕ должен генерировать случайный ключ, если он не передан.
                # Выбрасываем исключение.
                raise InfrastructureError(
                    "Encryption key (ENCRYPTION_KEY) is not set. "
                    "Please provide it via environment variable, Django settings or constructor."
                )
            key = key_str.encode()
        
        if isinstance(key, str):
            key = key.encode()
        
        self._fernet = Fernet(key)
    
    def encrypt(self, plaintext: str) -> str:
        """Зашифровать данные."""
        try:
            encrypted = self._fernet.encrypt(plaintext.encode())
            return encrypted.decode()
        except Exception as e:
            raise InfrastructureError(f"Failed to encrypt data: {e}") from e
    
    def decrypt(self, ciphertext: str) -> str:
        """Расшифровать данные."""
        try:
            decrypted = self._fernet.decrypt(ciphertext.encode())
            return decrypted.decode()
        except Exception as e:
            raise InfrastructureError(f"Failed to decrypt data: {e}") from e
