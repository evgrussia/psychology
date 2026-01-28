"""
Google Calendar Integration.
"""
# Ленивый импорт, чтобы не импортировать google модули при загрузке пакета
# (они могут быть не установлены в тестовом окружении)

__all__ = [
    'GoogleCalendarClient',
    'GoogleCalendarAdapter',
    'MockGoogleCalendarAdapter',
]

def __getattr__(name):
    """Ленивый импорт модулей."""
    if name == 'GoogleCalendarClient':
        from infrastructure.external.calendar.google_calendar_client import GoogleCalendarClient
        return GoogleCalendarClient
    elif name == 'GoogleCalendarAdapter':
        from infrastructure.external.calendar.google_calendar_adapter import GoogleCalendarAdapter
        return GoogleCalendarAdapter
    elif name == 'MockGoogleCalendarAdapter':
        from infrastructure.external.calendar.mock_calendar_adapter import MockGoogleCalendarAdapter
        return MockGoogleCalendarAdapter
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
