"""
Unit тесты для GetBoundaryScriptsUseCase.
"""
import pytest
from unittest.mock import AsyncMock
from asgiref.sync import sync_to_async

from application.interactive.use_cases.get_boundary_scripts import GetBoundaryScriptsUseCase
from infrastructure.persistence.repositories.content.boundary_script_repository import DjangoBoundaryScriptRepository
from application.interactive.dto import GetBoundaryScriptsDto
from application.exceptions import ValidationError
from infrastructure.persistence.django_models.content import BoundaryScriptModel


@pytest.fixture
def use_case():
    """Фикстура для Use Case."""
    repository = DjangoBoundaryScriptRepository()
    return GetBoundaryScriptsUseCase(boundary_script_repository=repository)


@pytest.mark.asyncio
@pytest.mark.django_db
async def test_get_boundary_scripts_success(use_case):
    """Тест успешного получения скриптов границ."""
    # Arrange
    # Создаем тестовые данные в БД
    script = await sync_to_async(BoundaryScriptModel.objects.create)(
        scenario='work',
        style='soft',
        goal='refuse',
        script_text='Извините, но сейчас я не могу взять на себя эту задачу.',
        status='published',
        display_order=0
    )
    
    dto = GetBoundaryScriptsDto(
        scenario='work',
        style='soft',
        goal='refuse'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert len(result.scripts) > 0
    assert result.safety_tips is not None
    assert len(result.safety_tips) > 0


@pytest.mark.asyncio
async def test_get_boundary_scripts_invalid_scenario(use_case):
    """Тест валидации сценария."""
    # Arrange
    dto = GetBoundaryScriptsDto(
        scenario='invalid_scenario',
        style='soft',
        goal='refuse'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Invalid scenario"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_get_boundary_scripts_invalid_style(use_case):
    """Тест валидации стиля."""
    # Arrange
    dto = GetBoundaryScriptsDto(
        scenario='work',
        style='invalid_style',
        goal='refuse'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Invalid style"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_get_boundary_scripts_invalid_goal(use_case):
    """Тест валидации цели."""
    # Arrange
    dto = GetBoundaryScriptsDto(
        scenario='work',
        style='soft',
        goal='invalid_goal'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Invalid goal"):
        await use_case.execute(dto)
