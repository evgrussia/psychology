"""
Serializers для Booking endpoints.
"""
from rest_framework import serializers
from uuid import UUID


class ServiceSerializer(serializers.Serializer):
    """Serializer для услуги."""
    id = serializers.UUIDField()
    slug = serializers.SlugField()
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True, required=False)
    duration_minutes = serializers.IntegerField()
    price_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        required=False,
    )
    format = serializers.ChoiceField(choices=['online', 'offline', 'hybrid'])
    cancel_free_hours = serializers.IntegerField()
    cancel_partial_hours = serializers.IntegerField()
    reschedule_min_hours = serializers.IntegerField()


class ServiceListSerializer(ServiceSerializer):
    """Упрощённая версия для списка услуг."""
    pass


class SlotSerializer(serializers.Serializer):
    """Serializer для слота."""
    id = serializers.UUIDField()
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    timezone = serializers.CharField()
    available = serializers.BooleanField()


class SlotListSerializer(serializers.Serializer):
    """Serializer для списка слотов из AvailableSlotDto."""
    id = serializers.CharField()
    start_at = serializers.CharField()  # ISO8601 в UTC
    end_at = serializers.CharField()  # ISO8601 в UTC
    status = serializers.CharField()
    local_start_at = serializers.CharField()  # ISO8601 в таймзоне пользователя
    local_end_at = serializers.CharField()  # ISO8601 в таймзоне пользователя


class CreateAppointmentSerializer(serializers.Serializer):
    """Serializer для создания записи."""
    service_id = serializers.UUIDField(required=True)
    slot_id = serializers.UUIDField(required=False, allow_null=True)
    start_at = serializers.DateTimeField(required=False, allow_null=True)
    end_at = serializers.DateTimeField(required=False, allow_null=True)
    timezone = serializers.CharField(required=False, default='Europe/Moscow')
    format = serializers.ChoiceField(
        choices=['online', 'offline'],
        required=True
    )
    intake_form = serializers.DictField(required=False, allow_null=True)
    consents = serializers.DictField(
        required=False,
        child=serializers.BooleanField(),
    )
    entry_point = serializers.CharField(required=False, default='web')
    topic_code = serializers.CharField(required=False, allow_null=True)
    deep_link_id = serializers.CharField(required=False, allow_null=True)
    utm_params = serializers.DictField(required=False, allow_null=True)
    
    def validate(self, data):
        """Валидация: должен быть указан либо slot_id, либо start_at/end_at."""
        if not data.get('slot_id') and not (data.get('start_at') and data.get('end_at')):
            raise serializers.ValidationError(
                "Either 'slot_id' or both 'start_at' and 'end_at' must be provided"
            )
        return data


class PaymentInfoSerializer(serializers.Serializer):
    """Serializer для информации о платеже."""
    id = serializers.UUIDField()
    status = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()


class AppointmentSerializer(serializers.Serializer):
    """Serializer для записи."""
    id = serializers.CharField()  # Может быть UUID или строка
    service = serializers.DictField()  # Service уже в виде dict из DTO
    slot = serializers.DictField()  # Slot уже в виде dict из DTO
    status = serializers.ChoiceField(
        choices=[
            'pending_payment',
            'confirmed',
            'canceled',
            'rescheduled',
            'completed',
            'no_show',
        ]
    )
    format = serializers.ChoiceField(choices=['online', 'offline'], required=False)
    payment = serializers.DictField(allow_null=True, required=False)  # Payment уже в виде dict
    created_at = serializers.CharField()  # ISO8601 строка
    updated_at = serializers.CharField(required=False, allow_null=True)  # Опционально


class AppointmentListSerializer(serializers.Serializer):
    """Serializer для списка записей (упрощенная версия)."""
    id = serializers.CharField()
    service_id = serializers.CharField(required=False)
    slot = serializers.DictField()
    status = serializers.ChoiceField(
        choices=[
            'pending_payment',
            'confirmed',
            'canceled',
            'rescheduled',
            'completed',
            'no_show',
        ]
    )
    format = serializers.ChoiceField(choices=['online', 'offline'], required=False)
    payment = serializers.DictField(allow_null=True, required=False)
