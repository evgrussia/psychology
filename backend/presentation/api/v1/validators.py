"""
Custom validators для API.
"""
from rest_framework import serializers
from datetime import datetime
import pytz


class TimezoneValidator:
    """
    Валидатор таймзоны (IANA).
    """
    def __call__(self, value):
        try:
            pytz.timezone(value)
        except pytz.exceptions.UnknownTimeZoneError:
            raise serializers.ValidationError(f"Invalid timezone: {value}")


class FutureDateValidator:
    """
    Валидатор даты в будущем.
    """
    def __call__(self, value):
        if isinstance(value, str):
            # Если строка, парсим её
            try:
                value = datetime.fromisoformat(value.replace('Z', '+00:00'))
            except ValueError:
                raise serializers.ValidationError("Invalid date format")
        
        # Сравниваем с текущим временем
        now = datetime.now(value.tzinfo) if value.tzinfo else datetime.now()
        if value < now:
            raise serializers.ValidationError("Date must be in the future")


class SlotDurationValidator:
    """
    Валидатор длительности слота.
    """
    def __init__(self, min_minutes=15, max_minutes=480):
        self.min_minutes = min_minutes
        self.max_minutes = max_minutes
    
    def __call__(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Slot must be a dictionary with 'start_at' and 'end_at'")
        
        start = value.get('start_at')
        end = value.get('end_at')
        
        if not start or not end:
            raise serializers.ValidationError("Slot must have both 'start_at' and 'end_at'")
        
        # Преобразуем в datetime если строки
        if isinstance(start, str):
            try:
                start = datetime.fromisoformat(start.replace('Z', '+00:00'))
            except ValueError:
                raise serializers.ValidationError("Invalid start_at format")
        
        if isinstance(end, str):
            try:
                end = datetime.fromisoformat(end.replace('Z', '+00:00'))
            except ValueError:
                raise serializers.ValidationError("Invalid end_at format")
        
        duration = (end - start).total_seconds() / 60
        
        if duration < self.min_minutes:
            raise serializers.ValidationError(
                f"Slot duration must be at least {self.min_minutes} minutes"
            )
        
        if duration > self.max_minutes:
            raise serializers.ValidationError(
                f"Slot duration must not exceed {self.max_minutes} minutes"
            )
