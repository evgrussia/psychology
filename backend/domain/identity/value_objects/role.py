"""
Role Value Object.
"""
from domain.shared.value_object import ValueObject


class Role(ValueObject):
    """Value Object для роли пользователя.
    
    Роли:
    - OWNER: Владелец (психолог) - полный доступ
    - ASSISTANT: Ассистент - расписание/лиды/модерация
    - EDITOR: Редактор - контент/ресурсы
    - CLIENT: Клиент - базовый доступ
    """
    
    def __init__(self, code: str, scope: str):
        if code not in ['owner', 'assistant', 'editor', 'client']:
            raise ValueError(f"Invalid role code: {code}")
        if scope not in ['admin', 'product']:
            raise ValueError(f"Invalid role scope: {scope}")
        
        self._code = code
        self._scope = scope
    
    @property
    def code(self) -> str:
        return self._code
    
    @property
    def scope(self) -> str:
        return self._scope
    
    def is_admin(self) -> bool:
        """Проверяет, является ли роль административной."""
        return self._scope == 'admin'
    
    # Предопределенные роли
    OWNER = None
    ASSISTANT = None
    EDITOR = None
    CLIENT = None


# Инициализация предопределенных ролей
Role.OWNER = Role('owner', 'admin')
Role.ASSISTANT = Role('assistant', 'admin')
Role.EDITOR = Role('editor', 'admin')
Role.CLIENT = Role('client', 'product')
