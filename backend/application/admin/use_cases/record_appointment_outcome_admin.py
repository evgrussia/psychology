"""
Use Case: отметка исхода встречи администратором.
"""
from application.exceptions import NotFoundError, ValidationError, ForbiddenError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.repositories import IAppointmentRepository
from domain.booking.entities.outcome_record import AppointmentOutcome
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.interfaces.event_bus import IEventBus

from application.booking.dto import RecordAppointmentOutcomeDto


class RecordAppointmentOutcomeAdminUseCase:
    """Use Case для отметки исхода встречи администратором."""
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        user_repository: IUserRepository,
        event_bus: IEventBus
    ):
        self._appointment_repository = appointment_repository
        self._user_repository = user_repository
        self._event_bus = event_bus
    
    async def execute(self, dto: RecordAppointmentOutcomeDto, admin_user_id: str) -> dict:
        """
        Отмечает исход встречи администратором.
        
        Args:
            dto: DTO с данными исхода
            admin_user_id: ID администратора (для проверки прав)
        
        Returns:
            dict с результатом операции.
        
        Raises:
            NotFoundError: Если запись не найдена
            ForbiddenError: Если пользователь не является администратором
            ValidationError: Если исход нельзя записать
        """
        # 1. Проверка прав администратора
        admin_id = UserId(admin_user_id)
        admin = await self._user_repository.find_by_id(admin_id)
        if not admin:
            raise NotFoundError("Admin user not found")
        
        # Проверка, что пользователь имеет роль owner или assistant (админка расписания/встреч)
        is_admin = any(role.code in ('owner', 'assistant') for role in admin.roles)
        if not is_admin:
            raise ForbiddenError("Only owner or assistant can record appointment outcomes")
        
        # 2. Получение агрегата
        appointment_id = AppointmentId(dto.appointment_id)
        appointment = await self._appointment_repository.find_by_id(appointment_id)
        if not appointment:
            raise NotFoundError("Appointment not found")
        
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
            'status': appointment.status.value,
            'recorded_by': admin_user_id
        }
