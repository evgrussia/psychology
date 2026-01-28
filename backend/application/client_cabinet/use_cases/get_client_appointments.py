"""
Use Case: получение списка встреч клиента.
"""
from application.exceptions import NotFoundError, ForbiddenError
from domain.booking.repositories import IAppointmentRepository
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository

from application.client_cabinet.dto import GetClientAppointmentsDto, ClientAppointmentsResponseDto


class GetClientAppointmentsUseCase:
    """Use Case для получения списка встреч клиента."""
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        user_repository: IUserRepository
    ):
        self._appointment_repository = appointment_repository
        self._user_repository = user_repository
    
    async def execute(self, dto: GetClientAppointmentsDto) -> ClientAppointmentsResponseDto:
        """
        Получает список встреч клиента.
        
        Returns:
            ClientAppointmentsResponseDto со списком встреч.
        
        Raises:
            NotFoundError: Если пользователь не найден
            ForbiddenError: Если пользователь не имеет прав
        """
        # 1. Проверка прав
        user_id = UserId(dto.user_id)
        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        # 2. Получение встреч
        appointments = await self._appointment_repository.find_by_client_id(user_id)
        
        # 3. Фильтрация по статусу (если указан)
        if dto.status and dto.status != 'all':
            if dto.status == 'upcoming':
                from datetime import datetime, timezone
                now = datetime.now(timezone.utc)
                appointments = [
                    apt for apt in appointments
                    if apt.slot.start_at > now and apt.status.value in ('pending_payment', 'confirmed', 'rescheduled')
                ]
            elif dto.status == 'past':
                from datetime import datetime, timezone
                now = datetime.now(timezone.utc)
                appointments = [
                    apt for apt in appointments
                    if apt.slot.start_at <= now or apt.status.value in ('completed', 'canceled', 'no_show')
                ]
        
        # 4. Ограничение количества (если указано)
        if dto.limit:
            appointments = appointments[:dto.limit]
        
        # 5. Маппинг в DTO
        appointments_data = []
        for apt in appointments:
            appointments_data.append({
                'id': str(apt.id.value),
                'service_id': str(apt.service_id.value),
                'slot': {
                    'start_at': apt.slot.start_at.isoformat(),
                    'end_at': apt.slot.end_at.isoformat(),
                    'timezone': apt.slot.timezone.value
                },
                'status': apt.status.value,
                'format': apt.format.value,
                'payment': {
                    'id': str(apt.payment.id.value),
                    'status': apt.payment.status.value,
                    'amount': apt.payment.amount.amount
                } if apt.payment else None
            })
        
        return ClientAppointmentsResponseDto(appointments=appointments_data)
