"""
Views для Telegram: отписка от уведомлений (FR-TG-5).
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from application.identity.use_cases.revoke_consent import RevokeConsentRequest
from presentation.api.v1.dependencies import get_revoke_consent_use_case


class UnsubscribeTelegramView(APIView):
    """
    Отписка от Telegram-уведомлений (серии/рассылки).
    POST /api/v1/telegram/unsubscribe/ — отписка текущего пользователя (из session).
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Отписаться от Telegram-уведомлений",
        request=None,
        responses={204: None},
    )
    def post(self, request):
        user_id = request.user.id
        use_case = get_revoke_consent_use_case()
        use_case.execute(
            RevokeConsentRequest(
                user_id=user_id,
                consent_type='telegram',
            )
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
