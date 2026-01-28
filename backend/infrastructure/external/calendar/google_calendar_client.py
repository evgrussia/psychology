"""
HTTP клиент для работы с Google Calendar API.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from infrastructure.exceptions import InfrastructureError


class GoogleCalendarClient:
    """Клиент для работы с Google Calendar API."""
    
    def __init__(self, credentials: Credentials, calendar_id: str):
        """
        Инициализация клиента.
        
        Args:
            credentials: OAuth2 credentials для Google API
            calendar_id: ID календаря (обычно 'primary' для основного календаря)
        """
        self._service = build('calendar', 'v3', credentials=credentials)
        self._calendar_id = calendar_id
    
    async def get_events(
        self,
        time_min: datetime,
        time_max: datetime,
        timezone: str = 'UTC'
    ) -> List[Dict[str, Any]]:
        """Получить события из календаря в указанном диапазоне времени."""
        try:
            events_result = self._service.events().list(
                calendarId=self._calendar_id,
                timeMin=time_min.isoformat(),
                timeMax=time_max.isoformat(),
                timeZone=timezone,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            return events_result.get('items', [])
        except HttpError as e:
            raise InfrastructureError(f"Failed to get events from Google Calendar: {e}") from e
    
    async def create_event(
        self,
        summary: str,
        start: datetime,
        end: datetime,
        timezone: str = 'UTC',
        description: Optional[str] = None,
        attendees: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Создать событие в календаре."""
        event = {
            'summary': summary,
            'start': {
                'dateTime': start.isoformat(),
                'timeZone': timezone,
            },
            'end': {
                'dateTime': end.isoformat(),
                'timeZone': timezone,
            },
        }
        
        if description:
            event['description'] = description
        
        if attendees:
            event['attendees'] = [{'email': email} for email in attendees]
        
        try:
            created_event = self._service.events().insert(
                calendarId=self._calendar_id,
                body=event
            ).execute()
            
            return created_event
        except HttpError as e:
            raise InfrastructureError(f"Failed to create event in Google Calendar: {e}") from e
    
    async def delete_event(self, event_id: str) -> None:
        """Удалить событие из календаря."""
        try:
            self._service.events().delete(
                calendarId=self._calendar_id,
                eventId=event_id
            ).execute()
        except HttpError as e:
            raise InfrastructureError(f"Failed to delete event from Google Calendar: {e}") from e
    
    async def is_time_slot_free(
        self,
        start: datetime,
        end: datetime,
        timezone: str = 'UTC'
    ) -> bool:
        """Проверить, свободен ли временной слот."""
        events = await self.get_events(start, end, timezone)
        
        # Проверяем пересечения
        for event in events:
            event_start_str = event['start'].get('dateTime')
            event_end_str = event['end'].get('dateTime')
            
            if not event_start_str or not event_end_str:
                continue
            
            # Парсим ISO формат
            event_start = datetime.fromisoformat(event_start_str.replace('Z', '+00:00'))
            event_end = datetime.fromisoformat(event_end_str.replace('Z', '+00:00'))
            
            # Проверяем пересечение
            if start < event_end and end > event_start:
                return False
        
        return True
