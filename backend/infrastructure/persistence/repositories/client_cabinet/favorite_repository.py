"""
Django ORM реализация IFavoriteRepository.
"""
from typing import List, Optional
from asgiref.sync import sync_to_async
from django.db import transaction, IntegrityError

from domain.client_cabinet.aggregates.favorite import Favorite, FavoriteId
from domain.identity.aggregates.user import UserId
from domain.client_cabinet.repositories import IFavoriteRepository
from domain.client_cabinet.value_objects.resource_type import ResourceType
from infrastructure.persistence.django_models.client_cabinet import FavoriteModel
from infrastructure.persistence.mappers.client_cabinet_mapper import FavoriteMapper
from infrastructure.exceptions import InfrastructureError


class PostgresFavoriteRepository(IFavoriteRepository):
    """Реализация IFavoriteRepository для PostgreSQL через Django ORM."""

    async def find_by_id(self, id: FavoriteId) -> Optional[Favorite]:
        try:
            record = await FavoriteModel.objects.aget(id=id.value)
            return await sync_to_async(FavoriteMapper.to_domain)(record)
        except FavoriteModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find favorite: {e}") from e

    async def find_by_user_and_resource(
        self,
        user_id: UserId,
        resource_type: str,
        resource_id: str,
    ) -> Optional[Favorite]:
        try:
            record = await FavoriteModel.objects.filter(
                user_id=user_id.value,
                resource_type=resource_type,
                resource_id=resource_id.strip(),
            ).afirst()
            if record is None:
                return None
            return await sync_to_async(FavoriteMapper.to_domain)(record)
        except Exception as e:
            raise InfrastructureError(f"Failed to find favorite by user/resource: {e}") from e

    async def list_by_user(self, user_id: UserId) -> List[Favorite]:
        try:
            records = FavoriteModel.objects.filter(user_id=user_id.value).order_by('-created_at')
            result = []
            async for record in records:
                fav = await sync_to_async(FavoriteMapper.to_domain)(record)
                result.append(fav)
            return result
        except Exception as e:
            raise InfrastructureError(f"Failed to list favorites: {e}") from e

    async def add(self, favorite: Favorite) -> None:
        try:
            await sync_to_async(self._add_sync)(favorite)
        except IntegrityError:
            # Дубликат (unique user+type+resource_id) — идемпотентно
            pass
        except Exception as e:
            raise InfrastructureError(f"Failed to add favorite: {e}") from e

    @transaction.atomic
    def _add_sync(self, favorite: Favorite) -> None:
        data = FavoriteMapper.to_persistence(favorite)
        FavoriteModel.objects.create(
            id=data['id'],
            user_id=data['user_id'],
            resource_type=data['resource_type'],
            resource_id=data['resource_id'],
            created_at=data['created_at'],
        )

    async def remove(self, favorite_id: FavoriteId, user_id: UserId) -> bool:
        try:
            deleted, _ = await FavoriteModel.objects.filter(
                id=favorite_id.value,
                user_id=user_id.value,
            ).adelete()
            return deleted > 0
        except Exception as e:
            raise InfrastructureError(f"Failed to remove favorite: {e}") from e
