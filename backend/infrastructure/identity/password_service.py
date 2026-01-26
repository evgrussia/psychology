"""
Сервис для работы с паролями (Infrastructure layer).
Использует passlib с Argon2id для хеширования паролей.
"""
from passlib.context import CryptContext
from domain.identity.value_objects import PasswordHash

# Настройка passlib для использования Argon2id
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class PasswordService:
    """Сервис для хеширования и проверки паролей."""
    
    @staticmethod
    def hash_password(password: str) -> PasswordHash:
        """
        Создать hash из пароля.
        
        Args:
            password: Пароль в открытом виде
            
        Returns:
            PasswordHash value object
        """
        hashed = pwd_context.hash(password)
        return PasswordHash(value=hashed)
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """
        Проверить пароль против hash.
        
        Args:
            password: Пароль в открытом виде
            password_hash: Hash пароля (строка)
            
        Returns:
            True если пароль верный, False иначе
        """
        return pwd_context.verify(password, password_hash)
