"""
Django ORM реализация IUserRepository.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from domain.identity.entities import User, UserStatus
from domain.identity.repositories import IUserRepository
from infrastructure.persistence.django_models.user import UserModel
from infrastructure.persistence.django_models.role import UserRoleModel


class DjangoUserRepository(IUserRepository):
    """Django ORM реализация репозитория пользователей."""
    
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        try:
            model = UserModel.objects.get(id=user_id, deleted_at__isnull=True)
            return self._to_domain(model)
        except UserModel.DoesNotExist:
            return None
    
    def get_by_email(self, email: str) -> Optional[User]:
        try:
            model = UserModel.objects.get(email=email, deleted_at__isnull=True)
            return self._to_domain(model)
        except UserModel.DoesNotExist:
            return None
    
    def get_by_telegram_id(self, telegram_user_id: str) -> Optional[User]:
        try:
            model = UserModel.objects.get(telegram_user_id=telegram_user_id, deleted_at__isnull=True)
            return self._to_domain(model)
        except UserModel.DoesNotExist:
            return None
    
    def save(self, user: User, password_hash: Optional[str] = None) -> User:
        """
        Сохранить пользователя.
        
        Args:
            user: Доменная сущность User
            password_hash: Hash пароля (опционально, для обновления пароля)
        """
        try:
            model = UserModel.objects.get(id=user.id)
            # Обновить существующего пользователя
            model.email = user.email
            model.phone = user.phone
            model.telegram_user_id = user.telegram_user_id
            model.telegram_username = user.telegram_username
            model.display_name = user.display_name
            model.status = user.status.value
            model.deleted_at = user.deleted_at
            if password_hash is not None:
                model.password_hash = password_hash
            model.save()
        except UserModel.DoesNotExist:
            # Создать нового пользователя
            model = UserModel()
            model.id = user.id
            model.email = user.email
            model.phone = user.phone
            model.telegram_user_id = user.telegram_user_id
            model.telegram_username = user.telegram_username
            model.display_name = user.display_name
            model.status = user.status.value
            model.deleted_at = user.deleted_at
            # Установить поля PermissionsMixin перед save()
            model.is_staff = False
            model.is_superuser = False
            if password_hash is not None:
                model.password_hash = password_hash
            model.save()
        
        return self._to_domain(model)
    
    def delete(self, user_id: UUID) -> None:
        """Удалить пользователя (soft delete)."""
        UserModel.objects.filter(id=user_id).update(
            status='deleted',
            deleted_at=datetime.utcnow()
        )
    
    def get_password_hash(self, user_id: UUID) -> Optional[str]:
        """Получить hash пароля пользователя."""
        try:
            model = UserModel.objects.get(id=user_id, deleted_at__isnull=True)
            return model.password_hash
        except UserModel.DoesNotExist:
            return None
    
    def get_user_roles(self, user_id: UUID) -> List[str]:
        """Получить список ролей пользователя (коды ролей)."""
        user_roles = UserRoleModel.objects.filter(
            user_id=user_id
        ).select_related('role')
        return [user_role.role.code for user_role in user_roles]
    
    def _to_domain(self, model: UserModel) -> User:
        """Маппинг Django модели в доменную сущность."""
        return User(
            id=model.id,
            email=model.email,
            phone=model.phone,
            telegram_user_id=model.telegram_user_id,
            telegram_username=model.telegram_username,
            display_name=model.display_name,
            status=UserStatus(model.status),
            created_at=model.created_at,
            updated_at=model.updated_at,
            deleted_at=model.deleted_at,
        )
