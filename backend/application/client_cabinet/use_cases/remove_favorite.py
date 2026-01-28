"""
Use Case: удаление ресурса из избранного.
"""
from application.exceptions import ForbiddenError, NotFoundError
from domain.client_cabinet.repositories import IFavoriteRepository
from domain.client_cabinet.aggregates.favorite import FavoriteId
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.client_cabinet.dto import RemoveFavoriteDto


class RemoveFavoriteUseCase:
    """Удаление записи из избранного. Только владелец."""

    def __init__(
        self,
        favorite_repository: IFavoriteRepository,
        user_repository: IUserRepository,
    ):
        self._favorite_repository = favorite_repository
        self._user_repository = user_repository

    async def execute(self, dto: RemoveFavoriteDto) -> None:
        user_id = UserId(dto.user_id)
        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise ForbiddenError("User not found")

        favorite_id = FavoriteId(dto.favorite_id)
        favorite = await self._favorite_repository.find_by_id(favorite_id)
        if not favorite:
            raise NotFoundError("Favorite not found")
        if favorite.user_id.value != user_id.value:
            raise ForbiddenError("Not allowed to remove this favorite")

        await self._favorite_repository.remove(favorite_id, user_id)
