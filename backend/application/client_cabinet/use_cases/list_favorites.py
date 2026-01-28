"""
Use Case: список избранного пользователя (аптечка).
"""
from application.exceptions import ForbiddenError
from domain.client_cabinet.repositories import IFavoriteRepository
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.client_cabinet.dto import ListFavoritesResponseDto, FavoriteItemDto


class ListFavoritesUseCase:
    """Список избранного по user_id."""

    def __init__(
        self,
        favorite_repository: IFavoriteRepository,
        user_repository: IUserRepository,
    ):
        self._favorite_repository = favorite_repository
        self._user_repository = user_repository

    async def execute(self, user_id: str) -> ListFavoritesResponseDto:
        uid = UserId(user_id)
        user = await self._user_repository.find_by_id(uid)
        if not user:
            raise ForbiddenError("User not found")

        favorites = await self._favorite_repository.list_by_user(uid)
        items = [
            FavoriteItemDto(
                id=str(f.id.value),
                resource_type=f.resource_type.value,
                resource_id=f.resource_id,
                created_at=f.created_at.isoformat(),
            )
            for f in favorites
        ]
        return ListFavoritesResponseDto(items=items)
