"""
Use Case: удаление записи дневника.
"""
from application.exceptions import NotFoundError, ForbiddenError
from domain.client_cabinet.repositories import IDiaryEntryRepository
from domain.client_cabinet.aggregates.diary_entry import DiaryEntryId
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.interfaces.event_bus import IEventBus


class DeleteDiaryEntryUseCase:
    """Use Case для удаления записи дневника."""
    
    def __init__(
        self,
        diary_entry_repository: IDiaryEntryRepository,
        user_repository: IUserRepository,
        event_bus: IEventBus
    ):
        self._diary_entry_repository = diary_entry_repository
        self._user_repository = user_repository
        self._event_bus = event_bus
    
    async def execute(self, entry_id: str, user_id: str) -> dict:
        """
        Удаляет запись дневника.
        
        Args:
            entry_id: ID записи дневника
            user_id: ID пользователя (для проверки прав)
        
        Returns:
            dict с результатом операции
        
        Raises:
            NotFoundError: Если запись не найдена
            ForbiddenError: Если пользователь не имеет прав
        """
        # 1. Проверка прав
        user_id_vo = UserId(user_id)
        user = await self._user_repository.find_by_id(user_id_vo)
        if not user:
            raise NotFoundError("User not found")
        
        # 2. Получение записи
        entry_id_vo = DiaryEntryId(entry_id)
        entry = await self._diary_entry_repository.find_by_id(entry_id_vo)
        if not entry:
            raise NotFoundError("Diary entry not found")
        
        # 3. Проверка, что запись принадлежит пользователю
        if entry.user_id != user_id_vo:
            raise ForbiddenError("You don't have permission to delete this entry")
        
        # 4. Удаление записи
        entry.delete()
        
        # 5. Сохранение (физическое удаление через репозиторий)
        await self._diary_entry_repository.delete(entry_id_vo)
        
        # 6. Публикация событий
        events = entry.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        entry.clear_domain_events()
        
        # 7. Возврат результата
        return {
            'entry_id': entry_id,
            'status': 'deleted'
        }
