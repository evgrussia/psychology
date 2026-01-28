"""
Сервис для работы с паролями (Infrastructure layer).
Использует passlib с Argon2id для хеширования паролей.
"""
from passlib.context import CryptContext
from application.interfaces.password_service import IPasswordService

# Настройка passlib для использования Argon2id
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class PasswordService(IPasswordService):
    """Сервис для хеширования и проверки паролей."""
    
    def hash_password(self, password: str) -> str:
        """
        Создать hash из пароля.
        
        Args:
            password: Пароль в открытом виде
            
        Returns:
            Хеш пароля (строка)
        """
        return pwd_context.hash(password)
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """
        Проверить пароль против hash.
        
        Args:
            password: Пароль в открытом виде
            password_hash: Hash пароля (строка)
            
        Returns:
            True если пароль верный, False иначе
        """
        return pwd_context.verify(password, password_hash)
