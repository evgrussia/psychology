from abc import ABC, abstractmethod

class IPasswordService(ABC):
    """Интерфейс сервиса для работы с паролями."""
    
    @abstractmethod
    def hash_password(self, password: str) -> str:
        """Создать hash из пароля."""
        pass
    
    @abstractmethod
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Проверить пароль против hash."""
        pass
