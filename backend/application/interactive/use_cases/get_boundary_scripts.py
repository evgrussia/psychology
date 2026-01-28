"""
Use Case: получение скриптов границ по параметрам.
"""
from typing import List
from application.exceptions import ValidationError
from domain.content.repositories import IBoundaryScriptRepository

from application.interactive.dto import GetBoundaryScriptsDto, BoundaryScriptsResponseDto


class GetBoundaryScriptsUseCase:
    """Use Case для получения скриптов границ."""
    
    def __init__(self, boundary_script_repository: IBoundaryScriptRepository):
        self._boundary_script_repository = boundary_script_repository
    
    async def execute(self, dto: GetBoundaryScriptsDto) -> BoundaryScriptsResponseDto:
        """
        Получает скрипты границ по параметрам.
        
        Returns:
            BoundaryScriptsResponseDto со скриптами и советами по безопасности.
        
        Raises:
            ValidationError: Если параметры невалидны
        """
        # 1. Валидация параметров
        valid_scenarios = ['work', 'family', 'partner', 'friends']
        valid_styles = ['soft', 'brief', 'firm']
        valid_goals = ['refuse', 'ask', 'set_rule', 'pause']
        
        if dto.scenario not in valid_scenarios:
            raise ValidationError(f"Invalid scenario: {dto.scenario}")
        if dto.style not in valid_styles:
            raise ValidationError(f"Invalid style: {dto.style}")
        if dto.goal not in valid_goals:
            raise ValidationError(f"Invalid goal: {dto.goal}")
        
        # 2. Получение скриптов через репозиторий
        scripts = await self._boundary_script_repository.find_scripts(
            dto.scenario, dto.style, dto.goal
        )
        
        # 3. Получение safety tips
        safety_tips = self._get_safety_tips()
        
        # 4. Возврат DTO
        return BoundaryScriptsResponseDto(
            scripts=scripts,
            safety_tips=safety_tips
        )
    
    def _get_safety_tips(self) -> List[str]:
        """Получает советы по безопасности."""
        return [
            "Если вас давят, вы имеете право прекратить разговор",
            "Ваши границы важны и заслуживают уважения",
            "Если ситуация становится опасной, обратитесь за помощью"
        ]
