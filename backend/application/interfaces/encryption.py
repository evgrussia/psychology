from abc import ABC, abstractmethod


class IEncryptionService(ABC):
    """Интерфейс для шифрования P2 данных."""
    
    @abstractmethod
    def encrypt(self, plaintext: str) -> str:
        """Зашифровать данные."""
        pass
    
    @abstractmethod
    def decrypt(self, ciphertext: str) -> str:
        """Расшифровать данные."""
        pass
