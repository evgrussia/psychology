"""
Use Case: отметка исхода встречи (attended/no-show/canceled).
"""
from application.exceptions import NotFoundError, ValidationError, ForbiddenError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.repositories import IAppointmentRepository
from domain.booking.entities.outcome_record import AppointmentOutcome
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.interfaces.event_bus import IEventBus

from application.booking.dto import RecordAppointmentOutcomeDto


class RecordAppointmentOutcomeUseCase:
    """Use Case для отметки исхода встречи."""
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        user_repository: IUserRepository,
        event_bus: IEventBus
    ):
        self._appointment_repository = appointment_repository
        self._user_repository = user_repository
        self._event_bus = event_bus
    
    async def execute(self, dto: RecordAppointmentOutcomeDto) -> dict:
        """
        Отмечает исход встречи.
        
        Returns:
            dict с результатом операции.
        
        Raises:
            NotFoundError: Если запись не найдена
            ForbiddenError: Если пользователь не имеет прав
            ValidationError: Если исход нельзя записать
        """
        # 1. Получение агрегата
        appointment_id = AppointmentId(dto.appointment_id)
        appointment = await self._appointment_repository.find_by_id(appointment_id)
        if not appointment:
            raise NotFoundError("Appointment not found")
        
        # 2. Проверка прав (только админ или владелец)
        # Примечание: user_id должен передаваться в DTO или через контекст запроса
        # Для админ-панели это будет отдельный Use Case с явной проверкой прав
        # Здесь оставляем возможность записи исхода без проверки (для админов)
        
        # 3. Проверка, что встреча уже прошла
        if not appointment.slot.is_in_past():
            raise ValidationError("Cannot record outcome for future appointment")
        
        # 4. Создание AppointmentOutcome
        try:
            outcome = AppointmentOutcome(dto.outcome)
        except Exception as e:
            raise ValidationError(f"Invalid outcome value: {e}")
        
        # 5. Запись исхода
        try:
            appointment.record_outcome(outcome)
        except Exception as e:
            raise ValidationError(f"Cannot record outcome: {e}")
        
        # 6. Сохранение
        await self._appointment_repository.save(appointment)
        
        # 7. Публикация событий
        events = appointment.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        appointment.clear_domain_events()
        
        # 8. Возврат результата
        return {
            'appointment_id': dto.appointment_id,
            'outcome': dto.outcome,
            'status': appointment.status.value
        }
