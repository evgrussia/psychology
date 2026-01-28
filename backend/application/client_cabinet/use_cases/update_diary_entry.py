"""
Use Case: обновление записи дневника.
"""
import json
from application.exceptions import NotFoundError, ForbiddenError
from domain.client_cabinet.repositories import IDiaryEntryRepository
from domain.client_cabinet.aggregates.diary_entry import DiaryEntryId
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.interfaces.encryption import IEncryptionService


class UpdateDiaryEntryUseCase:
    """Use Case для обновления текста записи дневника."""

    def __init__(
        self,
        diary_entry_repository: IDiaryEntryRepository,
        user_repository: IUserRepository,
        encryption_service: IEncryptionService,
    ):
        self._diary_entry_repository = diary_entry_repository
        self._user_repository = user_repository
        self._encryption_service = encryption_service

    async def execute(self, entry_id: str, user_id: str, content: str) -> dict:
        """
        Обновляет контент записи дневника.

        Args:
            entry_id: ID записи
            user_id: ID пользователя (для проверки прав)
            content: новый текст (будет сохранён в том же формате, что и при создании)

        Returns:
            dict с id, type, content, created_at

        Raises:
            NotFoundError: запись не найдена
            ForbiddenError: нет прав на запись
        """
        user_id_vo = UserId(user_id)
        user = await self._user_repository.find_by_id(user_id_vo)
        if not user:
            raise NotFoundError("User not found")

        entry_id_vo = DiaryEntryId(entry_id)
        entry = await self._diary_entry_repository.find_by_id(entry_id_vo)
        if not entry:
            raise NotFoundError("Diary entry not found")

        if str(entry.user_id.value) != str(user_id):
            raise ForbiddenError("You don't have permission to update this entry")

        content_to_store = json.dumps(content)
        entry.update_content(content_to_store)
        await self._diary_entry_repository.save(entry)

        try:
            content_display = json.loads(entry.content)
        except (TypeError, ValueError):
            content_display = entry.content

        return {
            "id": str(entry.id.value),
            "type": entry.diary_type.value,
            "content": content_display,
            "created_at": entry.created_at.isoformat() if hasattr(entry.created_at, "isoformat") else str(entry.created_at),
        }
