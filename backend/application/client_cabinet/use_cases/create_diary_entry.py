"""
Use Case: создание записи дневника.
"""
import json
from application.exceptions import ValidationError, ForbiddenError
from domain.client_cabinet.repositories import IDiaryEntryRepository
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry
from domain.client_cabinet.value_objects.diary_type import DiaryType
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.interfaces.encryption import IEncryptionService
from application.interfaces.event_bus import IEventBus

from application.client_cabinet.dto import CreateDiaryEntryDto, DiaryEntryResponseDto


class CreateDiaryEntryUseCase:
    """Use Case для создания записи дневника."""
    
    def __init__(
        self,
        diary_entry_repository: IDiaryEntryRepository,
        user_repository: IUserRepository,
        encryption_service: IEncryptionService,
        event_bus: IEventBus
    ):
        self._diary_entry_repository = diary_entry_repository
        self._user_repository = user_repository
        self._encryption_service = encryption_service
        self._event_bus = event_bus
    
    async def execute(self, dto: CreateDiaryEntryDto) -> DiaryEntryResponseDto:
        """
        Создает запись дневника.
        
        Returns:
            DiaryEntryResponseDto с данными созданной записи.
        
        Raises:
            ValidationError: Если данные невалидны
            ForbiddenError: Если пользователь не найден
        """
        # 1. Проверка прав
        user_id = UserId(dto.user_id)
        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise ForbiddenError("User not found")
        
        # 2. Шифрование контента
        content_json = json.dumps(dto.content)
        encrypted_content = self._encryption_service.encrypt(content_json)
        
        # 3. Создание записи
        diary_type = DiaryType(dto.type)
        entry = DiaryEntry.create(
            user_id=user_id,
            diary_type=diary_type,
            content=encrypted_content
        )
        
        # 4. Сохранение
        await self._diary_entry_repository.save(entry)
        
        # 5. Публикация событий
        events = entry.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        entry.clear_domain_events()
        
        # 6. Возврат DTO
        return DiaryEntryResponseDto(
            id=str(entry.id.value),
            type=entry.diary_type.value,
            content=dto.content,  # Возвращаем незашифрованный контент для отображения
            created_at=entry.created_at.isoformat()
        )
