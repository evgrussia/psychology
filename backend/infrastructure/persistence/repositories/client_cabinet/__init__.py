"""
Client Cabinet repositories.
"""
from .diary_repository import PostgresDiaryEntryRepository
from .favorite_repository import PostgresFavoriteRepository

__all__ = [
    'PostgresDiaryEntryRepository',
    'PostgresFavoriteRepository',
]
