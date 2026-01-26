"""
Django ORM реализация IConsentRepository.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from domain.identity.repositories import IConsentRepository
from infrastructure.persistence.django_models.consent import ConsentModel


class DjangoConsentRepository(IConsentRepository):
    """Django ORM реализация репозитория согласий."""
    
    def get_user_consent(self, user_id: UUID, consent_type: str) -> Optional[bool]:
        """Получить статус согласия пользователя."""
        try:
            consent = ConsentModel.objects.get(user_id=user_id, consent_type=consent_type)
            return consent.granted
        except ConsentModel.DoesNotExist:
            return None
    
    def grant_consent(self, user_id: UUID, consent_type: str, version: str, source: str) -> None:
        """Предоставить согласие."""
        ConsentModel.objects.update_or_create(
            user_id=user_id,
            consent_type=consent_type,
            defaults={
                'granted': True,
                'version': version,
                'source': source,
                'granted_at': datetime.utcnow(),
                'revoked_at': None,
            }
        )
    
    def revoke_consent(self, user_id: UUID, consent_type: str) -> None:
        """Отозвать согласие."""
        ConsentModel.objects.filter(user_id=user_id, consent_type=consent_type).update(
            granted=False,
            revoked_at=datetime.utcnow(),
        )
