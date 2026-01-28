"""
Mapper для преобразования Telegram Domain Entities ↔ DB Records.
"""
from typing import Dict, Any, Optional
from domain.telegram.aggregates.deep_link import DeepLink, DeepLinkId
from domain.telegram.value_objects.deep_link_flow import DeepLinkFlow
from domain.telegram.value_objects.telegram_user import TelegramUser
from infrastructure.persistence.django_models.telegram import DeepLinkModel


class TelegramMapper:
    """Mapper для преобразования DeepLink Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: DeepLinkModel) -> DeepLink:
        """Преобразовать DB Record → Domain Entity."""
        # Восстановление Value Objects
        flow = DeepLinkFlow(record.flow)
        
        # Восстановление TelegramUser (если есть)
        telegram_user = None
        if record.telegram_user_data:
            user_data = record.telegram_user_data
            telegram_user = TelegramUser(
                user_id=user_data.get('user_id'),
                username=user_data.get('username')
            )
        
        # Восстановление агрегата через конструктор
        return DeepLink(
            id=DeepLinkId(record.id),
            flow=flow,
            token=record.token,
            telegram_user=telegram_user,
            created_at=record.created_at,
            expires_at=record.expires_at
        )
    
    @staticmethod
    def to_persistence(link: DeepLink) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record."""
        # Получаем telegram_user через приватное поле
        telegram_user_vo = getattr(link, '_telegram_user', None)
        
        telegram_user_data = {}
        if telegram_user_vo:
            telegram_user_data = {
                'user_id': telegram_user_vo.user_id,
                'username': telegram_user_vo.username
            }
        
        created_at = getattr(link, '_created_at', None)
        
        return {
            'id': link.id.value,
            'token': link.token,
            'flow': link.flow.value,
            'telegram_user_data': telegram_user_data,
            'created_at': created_at,
            'expires_at': link.expires_at,
        }
