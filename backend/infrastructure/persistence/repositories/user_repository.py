"""
Django ORM реализация IUserRepository.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from asgiref.sync import sync_to_async
from django.db import transaction
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.repositories import IUserRepository
from infrastructure.persistence.django_models.user import UserModel
from infrastructure.persistence.django_models.role import UserRoleModel
from application.interfaces.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError


class DjangoUserRepository(IUserRepository):
    """Django ORM реализация репозитория пользователей."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, user_id: UserId) -> Optional[User]:
        try:
            model = await UserModel.objects.aget(id=user_id.value, deleted_at__isnull=True)
            return await sync_to_async(self._to_domain)(model)
        except UserModel.DoesNotExist:
            return None
    
    async def find_by_email(self, email: Email) -> Optional[User]:
        try:
            model = await UserModel.objects.aget(email=email.value, deleted_at__isnull=True)
            return await sync_to_async(self._to_domain)(model)
        except UserModel.DoesNotExist:
            return None
    
    async def find_by_telegram_user_id(self, telegram_user_id: str) -> Optional[User]:
        try:
            model = await UserModel.objects.aget(telegram_user_id=telegram_user_id, deleted_at__isnull=True)
            return await sync_to_async(self._to_domain)(model)
        except UserModel.DoesNotExist:
            return None
    
    async def find_by_phone(self, phone: PhoneNumber) -> Optional[User]:
        try:
            model = await UserModel.objects.aget(phone=phone.value, deleted_at__isnull=True)
            return await sync_to_async(self._to_domain)(model)
        except UserModel.DoesNotExist:
            return None
    
    async def save(self, user: User) -> None:
        """Сохранить пользователя."""
        try:
            await sync_to_async(self._save_sync)(user)
            
            # Публикация Domain Events
            domain_events = user.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                user.clear_domain_events()
        except Exception as e:
            raise InfrastructureError(f"Failed to save user: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, user: User) -> None:
        """Синхронная версия save."""
        from infrastructure.persistence.mappers.user_mapper import UserMapper
        from infrastructure.persistence.django_models.consent import ConsentModel
        from infrastructure.persistence.django_models.role import UserRoleModel
        
        persistence_data = UserMapper.to_persistence(user)
        user_id = persistence_data.pop('id')
        
        model, created = UserModel.objects.update_or_create(
            id=user_id,
            defaults=persistence_data
        )
        
        # Сохранить роли
        UserRoleModel.objects.filter(user_id=user_id).delete()
        for role in user.roles:
            UserRoleModel.objects.get_or_create(
                user_id=user_id,
                role_id=role.code
            )
        
        # Сохранить согласия
        for consent in user.consents:
            ConsentModel.objects.update_or_create(
                id=consent.id.value,
                defaults={
                    'user_id': user_id,
                    'consent_type': consent.consent_type.value,
                    'version': consent.version,
                    'source': consent.source,
                    'granted': consent.is_active(),
                    'granted_at': consent.granted_at,
                    'revoked_at': consent.revoked_at,
                }
            )

    async def delete(self, user_id: UserId) -> None:
        """Удалить пользователя (soft delete)."""
        try:
            from django.utils import timezone
            await UserModel.objects.filter(id=user_id.value).aupdate(deleted_at=timezone.now())
        except Exception as e:
            raise InfrastructureError(f"Failed to delete user: {e}") from e

    def get_password_hash(self, user_id: UUID) -> Optional[str]:
        """Получить hash пароля."""
        try:
            model = UserModel.objects.get(id=user_id)
            return model.password
        except UserModel.DoesNotExist:
            return None

    def set_password_hash(self, user_id: UUID, password_hash: str) -> None:
        """Установить hash пароля."""
        UserModel.objects.filter(id=user_id).update(password=password_hash)

    def get_django_model(self, user_id: UUID) -> Optional[UserModel]:
        """Получить Django модель пользователя."""
        try:
            return UserModel.objects.get(id=user_id)
        except UserModel.DoesNotExist:
            return None
    
    def get_user_roles(self, user_id: UUID) -> List[str]:
        """Получить коды ролей пользователя."""
        return list(UserRoleModel.objects.filter(user_id=user_id).values_list('role_id', flat=True))
    
    def _to_domain(self, model: UserModel) -> User:
        """Маппинг Django модели в доменную сущность."""
        from infrastructure.persistence.mappers.user_mapper import UserMapper
        from infrastructure.persistence.django_models.consent import ConsentModel
        from infrastructure.persistence.django_models.role import UserRoleModel
        
        # Загружаем роли
        user_roles = list(UserRoleModel.objects.filter(user_id=model.id).select_related('role'))
        
        # Загружаем согласия
        consent_models = list(ConsentModel.objects.filter(user_id=model.id))
        
        return UserMapper.to_domain(model, user_roles, consent_models)
