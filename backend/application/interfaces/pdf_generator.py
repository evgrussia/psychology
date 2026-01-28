from abc import ABC, abstractmethod
from typing import List, Dict, Any
from io import BytesIO

class IPdfGeneratorService(ABC):
    """Интерфейс для генерации PDF документов."""
    
    @abstractmethod
    async def generate_diary_pdf(
        self,
        entries: List[Dict[str, Any]],
        user_name: str = "Пользователь"
    ) -> BytesIO:
        """Генерирует PDF из записей дневника.
        
        Args:
            entries: Список записей дневника с полями:
                - id: str
                - type: str
                - content: dict
                - created_at: str (ISO8601)
            user_name: Имя пользователя для заголовка
        
        Returns:
            BytesIO объект с PDF содержимым
        """
        pass
