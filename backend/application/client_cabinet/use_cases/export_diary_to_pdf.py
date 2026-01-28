"""
Use Case: экспорт дневников в PDF.
"""
from datetime import datetime
from dateutil import parser as date_parser
from uuid import uuid4

from application.exceptions import NotFoundError, ValidationError
from domain.client_cabinet.repositories import IDiaryEntryRepository, IDataExportRepository
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from domain.client_cabinet.value_objects.export_type import ExportType
from application.interfaces.encryption import IEncryptionService
from application.interfaces.event_bus import IEventBus
from application.interfaces.pdf_generator import IPdfGeneratorService
import logging

logger = logging.getLogger(__name__)

from application.client_cabinet.dto import ExportDiaryToPdfDto, ExportDiaryResponseDto


class ExportDiaryToPdfUseCase:
    """Use Case для экспорта дневников в PDF."""
    
    def __init__(
        self,
        diary_entry_repository: IDiaryEntryRepository,
        data_export_repository: IDataExportRepository,
        user_repository: IUserRepository,
        encryption_service: IEncryptionService,
        pdf_generator_service: IPdfGeneratorService,
        event_bus: IEventBus
    ):
        self._diary_entry_repository = diary_entry_repository
        self._data_export_repository = data_export_repository
        self._user_repository = user_repository
        self._encryption_service = encryption_service
        self._pdf_generator_service = pdf_generator_service
        self._event_bus = event_bus
    
    async def execute(self, dto: ExportDiaryToPdfDto) -> ExportDiaryResponseDto:
        """
        Экспортирует дневники в PDF.
        
        Returns:
            ExportDiaryResponseDto с данными экспорта.
        
        Raises:
            NotFoundError: Если пользователь не найден
            ValidationError: Если параметры невалидны
        """
        # 1. Проверка пользователя
        user_id = UserId(dto.user_id)
        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        # 2. Валидация дат
        try:
            date_from = date_parser.parse(dto.date_from)
            date_to = date_parser.parse(dto.date_to)
        except Exception as e:
            raise ValidationError(f"Invalid date format: {e}")
        
        if date_to <= date_from:
            raise ValidationError("dateTo must be after dateFrom")
        
        # 3. Получение записей за период
        # Примечание: IDiaryEntryRepository может не иметь метода find_by_user_id_and_date_range
        # Временная реализация - получаем все записи и фильтруем
        all_entries = await self._diary_entry_repository.find_by_user_id(user_id)
        
        # Фильтрация по датам
        entries = [
            entry for entry in all_entries
            if date_from <= entry.created_at <= date_to
        ]
        
        if not entries:
            raise ValidationError("No diary entries found for the specified period")
        
        # 4. Расшифровка записей
        # Примечание: В реальной реализации расшифровка должна происходить в фоне
        # Здесь создаем задачу на экспорт и возвращаем export_id
        decrypted_entries = []
        for entry in entries:
            try:
                decrypted_content = self._encryption_service.decrypt(entry.content)
                import json
                content_data = json.loads(decrypted_content)
                decrypted_entries.append({
                    'id': str(entry.id.value),
                    'type': entry.diary_type.value,
                    'content': content_data,
                    'created_at': entry.created_at.isoformat()
                })
            except Exception as e:
                # Логируем ошибку, но продолжаем обработку
                logger.error(f"Failed to decrypt diary entry {entry.id.value}: {e}")
                pass
        
        # 5. Создание Export Job
        export_type = ExportType('pdf')
        export_id = await self._data_export_repository.create_export_request(
            user_id=user_id,
            export_type=export_type
        )
        
        # 6. Генерация PDF
        try:
            user_name = user.name if hasattr(user, 'name') and user.name else "Пользователь"
            pdf_buffer = await self._pdf_generator_service.generate_diary_pdf(
                entries=decrypted_entries,
                user_name=user_name
            )
            
            # Примечание: В реальной реализации PDF должен загружаться в хранилище (S3)
            # и URL сохраняться в Export Job. Здесь возвращаем статус processing.
            # upload_url = await storage_service.upload(pdf_buffer)
            # await self._data_export_repository.update_export_status(export_id, 'ready', upload_url)
            
            logger.info(f"PDF generated for export {export_id}, {len(decrypted_entries)} entries")
        except Exception as e:
            logger.error(f"Failed to generate PDF for export {export_id}: {e}")
            # В реальной реализации нужно обновить статус на 'failed'
            # await self._data_export_repository.update_export_status(export_id, 'failed')
        
        # 7. Возврат DTO
        # Временная реализация - возвращаем статус processing
        return ExportDiaryResponseDto(
            export_id=export_id,
            status='processing',  # В реальной реализации будет 'ready' после генерации
            download_url=None,
            expires_at=None
        )
