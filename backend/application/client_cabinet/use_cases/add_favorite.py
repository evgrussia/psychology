"""
Use Case: добавление ресурса в избранное (аптечку).
"""
from application.exceptions import ValidationError, ForbiddenError
from domain.client_cabinet.repositories import IFavoriteRepository
from domain.client_cabinet.aggregates.favorite import Favorite
from domain.client_cabinet.value_objects.resource_type import ResourceType
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.client_cabinet.dto import AddFavoriteDto, FavoriteItemDto


class AddFavoriteUseCase:
    """Добавление ресурса в избранное. Идемпотентно при дубликате."""

    def __init__(
        self,
        favorite_repository: IFavoriteRepository,
        user_repository: IUserRepository,
    ):
        self._favorite_repository = favorite_repository
        self._user_repository = user_repository

    async def execute(self, dto: AddFavoriteDto) -> FavoriteItemDto:
        user_id = UserId(dto.user_id)
        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise ForbiddenError("User not found")

        resource_type = ResourceType(dto.resource_type)
        resource_id = (dto.resource_id or "").strip()
        if not resource_id:
            raise ValidationError("resource_id is required")

        existing = await self._favorite_repository.find_by_user_and_resource(
            user_id, resource_type.value, resource_id
        )
        if existing:
            return FavoriteItemDto(
                id=str(existing.id.value),
                resource_type=existing.resource_type.value,
                resource_id=existing.resource_id,
                created_at=existing.created_at.isoformat(),
            )

        favorite = Favorite.create(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
        )
        await self._favorite_repository.add(favorite)
        return FavoriteItemDto(
            id=str(favorite.id.value),
            resource_type=favorite.resource_type.value,
            resource_id=favorite.resource_id,
            created_at=favorite.created_at.isoformat(),
        )
