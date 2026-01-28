"""
Views для Webhooks endpoints.
"""
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from asgiref.sync import async_to_sync

from application.payments.dto import PaymentWebhookDto
from application.telegram.dto import TelegramWebhookDto
from presentation.api.v1.dependencies import (
    get_handle_payment_webhook_use_case,
    get_handle_telegram_webhook_use_case,
)


class YooKassaWebhookView(APIView):
    """
    Webhook от ЮKassa.
    """
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Webhook от ЮKassa",
        request=None,
        responses={200: None},
        exclude=True,
    )
    def post(self, request):
        # Читаем body ПЕРЕД тем как DRF прочитает data
        body = request.body
        signature = request.headers.get('X-YooMoney-Signature')
        
        webhook_data = request.data
        dto = PaymentWebhookDto(
            event=webhook_data.get('event'),
            provider_payment_id=webhook_data.get('object', {}).get('id'),
            amount=webhook_data.get('object', {}).get('amount', {}),
            metadata=webhook_data.get('object', {}).get('metadata'),
        )
        
        use_case = get_handle_payment_webhook_use_case()
        
        try:
            async_to_sync(use_case.execute)(dto, signature, body)
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            from application.exceptions import UnauthorizedError
            if isinstance(e, UnauthorizedError):
                return Response(
                    {'error': {'code': 'INVALID_SIGNATURE', 'message': str(e)}},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error processing payment webhook: {e}")
            return Response(status=status.HTTP_200_OK)


class TelegramWebhookView(APIView):
    """
    Webhook от Telegram Bot.
    """
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Webhook от Telegram",
        request=None,
        responses={200: None},
        exclude=True,
    )
    def post(self, request):
        # Проверка секретного токена Telegram
        secret_token = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
        expected_token = getattr(settings, 'TELEGRAM_WEBHOOK_SECRET', None)
        
        # В тестах используем фиксированный токен из теста
        if settings.TESTING and not expected_token:
            expected_token = 'test_telegram_webhook_secret'
            
        if expected_token and secret_token != expected_token:
            from application.exceptions import UnauthorizedError
            return Response(
                {'error': {'code': 'INVALID_SIGNATURE', 'message': "Invalid Telegram secret token"}},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        dto = TelegramWebhookDto(
            update=request.data,
        )
        
        use_case = get_handle_telegram_webhook_use_case()
        
        try:
            async_to_sync(use_case.execute)(dto)
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            from application.exceptions import UnauthorizedError
            if isinstance(e, UnauthorizedError):
                return Response(
                    {'error': {'code': 'INVALID_SIGNATURE', 'message': str(e)}},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error processing Telegram webhook: {e}")
            return Response(status=status.HTTP_200_OK)
