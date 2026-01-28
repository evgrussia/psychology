"""
Use Case: получение списка лидов для CRM.
"""
from application.exceptions import ValidationError
from domain.analytics.repositories import ILeadRepository
from domain.analytics.value_objects.lead_status import LeadStatus
from domain.analytics.value_objects.lead_source import LeadSource
from datetime import datetime
from dateutil import parser as date_parser

from application.admin.dto import GetLeadsListDto, LeadsListResponseDto


class GetLeadsListUseCase:
    """Use Case для получения списка лидов для CRM."""
    
    def __init__(self, lead_repository: ILeadRepository):
        self._lead_repository = lead_repository
    
    async def execute(self, dto: GetLeadsListDto) -> LeadsListResponseDto:
        """
        Получает список лидов для CRM.
        
        Returns:
            LeadsListResponseDto со списком лидов и пагинацией.
        
        Raises:
            ValidationError: Если параметры невалидны
        """
        # 1. Валидация параметров
        if dto.page < 1:
            raise ValidationError("Page must be >= 1")
        if dto.per_page < 1 or dto.per_page > 100:
            raise ValidationError("Per page must be between 1 and 100")
        
        # 2. Получение лидов
        # Примечание: ILeadRepository имеет только find_by_status
        # В реальной реализации нужно добавить метод find_by_filters
        leads = []
        
        if dto.status:
            status = LeadStatus(dto.status)
            leads = await self._lead_repository.find_by_status(status)
        else:
            # Получаем все статусы (упрощенная версия)
            # В реальной реализации будет метод find_all или find_by_filters
            for status_value in ['new', 'contacted', 'qualified', 'converted', 'lost']:
                status = LeadStatus(status_value)
                status_leads = await self._lead_repository.find_by_status(status)
                leads.extend(status_leads)
        
        # 3. Фильтрация по source (если указан)
        if dto.source:
            leads = [lead for lead in leads if lead.source.value == dto.source]
        
        # 4. Фильтрация по датам (если указаны)
        if dto.date_from:
            date_from = date_parser.parse(dto.date_from)
            leads = [lead for lead in leads if lead.created_at >= date_from]
        
        if dto.date_to:
            date_to = date_parser.parse(dto.date_to)
            leads = [lead for lead in leads if lead.created_at <= date_to]
        
        # 5. Сортировка по дате создания (новые первые)
        leads.sort(key=lambda l: l.created_at, reverse=True)
        
        # 6. Пагинация
        total_count = len(leads)
        start_idx = (dto.page - 1) * dto.per_page
        end_idx = start_idx + dto.per_page
        paginated_leads = leads[start_idx:end_idx]
        
        # 7. Маппинг в DTO
        leads_data = []
        for lead in paginated_leads:
            leads_data.append({
                'id': str(lead.id.value),
                'status': lead.status.value,
                'source': lead.source.value,
                'topic_code': lead.topic_code,
                'timeline_events': [
                    {
                        'event_name': event.event_type,
                        'occurred_at': event.occurred_at.isoformat(),
                        'source': event.metadata.get('source', 'web') if hasattr(event, 'metadata') else 'web'
                    }
                    for event in lead.timeline
                ],
                'created_at': lead.created_at.isoformat()
            })
        
        # 8. Расчет пагинации
        total_pages = (total_count + dto.per_page - 1) // dto.per_page if total_count > 0 else 0
        
        return LeadsListResponseDto(
            data=leads_data,
            pagination={
                'page': dto.page,
                'per_page': dto.per_page,
                'total': total_count,
                'total_pages': total_pages,
                'has_next': dto.page < total_pages,
                'has_prev': dto.page > 1
            }
        )
