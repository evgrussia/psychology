"""
API v1 URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    auth,
    booking,
    interactive,
    content,
    cabinet,
    payments,
    moderation,
    admin,
    webhooks,
    telegram as telegram_views,
    tracking,
    health as health_views,
)

router = DefaultRouter()

# Auth
router.register(r'auth/register', auth.RegisterViewSet, basename='register')
router.register(r'auth/login', auth.LoginViewSet, basename='login')

# Booking
router.register(r'booking/services', booking.ServiceViewSet, basename='service')
router.register(r'booking/appointments', booking.AppointmentViewSet, basename='appointment')
router.register(r'booking/slots', booking.SlotViewSet, basename='slot')

# Interactive
router.register(r'interactive/quizzes', interactive.QuizViewSet, basename='quiz')
router.register(r'interactive/runs', interactive.InteractiveRunViewSet, basename='interactive-run')
router.register(r'interactive/diaries', interactive.DiaryViewSet, basename='diary')

# Content
router.register(r'content/articles', content.ArticleViewSet, basename='article')
router.register(r'content/resources', content.ResourceViewSet, basename='resource')
router.register(r'content/topics', content.TopicsViewSet, basename='topic')

# Client Cabinet
router.register(r'cabinet/appointments', cabinet.CabinetAppointmentViewSet, basename='cabinet-appointment')
router.register(r'cabinet/diaries', cabinet.CabinetDiaryViewSet, basename='cabinet-diary')
router.register(r'cabinet/favorites', cabinet.CabinetFavoritesViewSet, basename='cabinet-favorites')
router.register(r'cabinet/exports', cabinet.ExportViewSet, basename='export')

# Payments
router.register(r'payments', payments.PaymentViewSet, basename='payment')

# Moderation (UGC)
router.register(r'moderation/questions', moderation.QuestionViewSet, basename='question')

# Admin
router.register(r'admin/me', admin.AdminMeViewSet, basename='admin-me')
router.register(r'admin/appointments', admin.AdminAppointmentViewSet, basename='admin-appointment')
router.register(r'admin/leads', admin.LeadViewSet, basename='admin-lead')
router.register(r'admin/content', admin.AdminContentViewSet, basename='admin-content')
router.register(r'admin/moderation', admin.AdminModerationViewSet, basename='admin-moderation')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_views.health),
    # Auth endpoints (non-viewset)
    path('auth/refresh/', auth.RefreshTokenView.as_view(), name='token-refresh'),
    path('auth/logout/', auth.LogoutView.as_view(), name='token-logout'),
    path('auth/mfa/setup/', auth.MfaSetupView.as_view(), name='mfa-setup'),
    path('auth/mfa/verify/', auth.MfaVerifyView.as_view(), name='mfa-verify'),
    
    # Webhooks
    path('webhooks/yookassa/', webhooks.YooKassaWebhookView.as_view(), name='yookassa-webhook'),
    path('webhooks/telegram/', webhooks.TelegramWebhookView.as_view(), name='telegram-webhook'),
    # Telegram: отписка от уведомлений (FR-TG-5)
    path('telegram/unsubscribe/', telegram_views.UnsubscribeTelegramView.as_view(), name='telegram-unsubscribe'),
    
    # Special endpoints
    path('booking/services/<uuid:service_id>/slots/', booking.ServiceSlotsView.as_view(), name='service-slots'),
    path('interactive/quizzes/<slug:slug>/start/', interactive.StartQuizView.as_view(), name='quiz-start'),
    path('interactive/quizzes/<slug:slug>/submit/', interactive.SubmitQuizView.as_view(), name='quiz-submit'),
    path('cabinet/data/export/', cabinet.ExportDataView.as_view(), name='export-data'),
    path('cabinet/data/delete/', cabinet.DeleteDataView.as_view(), name='delete-data'),
    
    # Tracking
    path('tracking/events', tracking.tracking_events, name='tracking-events'),
]
