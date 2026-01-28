"""
DTOs для Content Domain Use Cases.
"""
from dataclasses import dataclass
from typing import Optional, List, Dict, Any


@dataclass
class GetArticleDto:
    """DTO для получения статьи."""
    slug: str
    include_draft: bool = False  # Только для админа


@dataclass
class ArticleResponseDto:
    """DTO для ответа со статьей."""
    id: str
    slug: str
    title: str
    content: str  # Markdown
    excerpt: str
    published_at: str
    category: str
    tags: List[str]
    related_resources: Optional[List[Dict[str, Any]]] = None
    cta_blocks: Optional[List[Dict[str, Any]]] = None


@dataclass
class ListArticlesDto:
    """DTO для списка статей."""
    page: int = 1
    per_page: int = 20
    category: Optional[str] = None
    tag: Optional[str] = None
    search: Optional[str] = None


@dataclass
class ArticlesListResponseDto:
    """DTO для ответа со списком статей."""
    data: List[Dict[str, Any]]
    pagination: Dict[str, Any]


@dataclass
class GetResourceDto:
    """DTO для получения ресурса."""
    slug: str


@dataclass
class ResourceResponseDto:
    """DTO для ответа с ресурсом."""
    id: str
    slug: str
    title: str
    type: str  # 'exercise' | 'audio' | 'checklist' | 'pdf'
    content: str  # Markdown или инструкции
    duration_minutes: Optional[int] = None
    audio_url: Optional[str] = None
    pdf_url: Optional[str] = None
    related_articles: Optional[List[Dict[str, Any]]] = None
