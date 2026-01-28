"""
Favorite (SavedResource) Aggregate Root — избранное / аптечка.
"""
from datetime import datetime, timezone
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.identity.aggregates.user import UserId
from domain.client_cabinet.value_objects.resource_type import ResourceType


class FavoriteId(EntityId):
    """ID записи избранного."""
    pass


class Favorite(AggregateRoot):
    """Агрегат избранного: пользователь сохранил ресурс в «аптечку».

    Атрибуты:
        user_id, resource_type (article|resource|ritual), resource_id (slug или uuid), created_at.
    Дубликаты: unique (user_id, resource_type, resource_id).
    """

    def __init__(
        self,
        id: FavoriteId,
        user_id: UserId,
        resource_type: ResourceType,
        resource_id: str,
        created_at: datetime,
    ):
        super().__init__()
        self._id = id
        self._user_id = user_id
        self._resource_type = resource_type
        self._resource_id = resource_id
        self._created_at = created_at

    @classmethod
    def create(
        cls,
        user_id: UserId,
        resource_type: ResourceType,
        resource_id: str,
    ) -> "Favorite":
        """Фабричный метод создания записи избранного."""
        return cls(
            id=FavoriteId.generate(),
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id.strip(),
            created_at=datetime.now(timezone.utc),
        )

    @property
    def id(self) -> FavoriteId:
        return self._id

    @property
    def user_id(self) -> UserId:
        return self._user_id

    @property
    def resource_type(self) -> ResourceType:
        return self._resource_type

    @property
    def resource_id(self) -> str:
        return self._resource_id

    @property
    def created_at(self) -> datetime:
        return self._created_at
