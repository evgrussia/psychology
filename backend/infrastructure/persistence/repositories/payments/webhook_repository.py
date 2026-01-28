from domain.payments.repositories import IWebhookEventRepository
from infrastructure.persistence.django_models.booking import WebhookEventModel
from asgiref.sync import sync_to_async


class DjangoWebhookEventRepository(IWebhookEventRepository):
    """Реализация IWebhookEventRepository через Django ORM."""
    
    async def is_processed(self, provider_payment_id: str, event_type: str) -> bool:
        """Проверяет, был ли уже обработан этот webhook."""
        # Используем sync_to_async для фильтрации, если queryset не поддерживает асинхронный exists()
        return await sync_to_async(
            WebhookEventModel.objects.filter(
                provider_payment_id=provider_payment_id,
                event_type=event_type
            ).exists
        )()
    
    async def mark_as_processed(self, provider_payment_id: str, event_type: str) -> None:
        """Отмечает webhook как обработанный."""
        await sync_to_async(
            WebhookEventModel.objects.get_or_create
        )(
            provider_payment_id=provider_payment_id,
            event_type=event_type,
            defaults={'processed_at': None}
        )
