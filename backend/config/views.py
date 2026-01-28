"""
Корневые view (health для LB и мониторинга).
"""
from django.http import JsonResponse


def health(request):
    """Корневой health check для /health/."""
    return JsonResponse({'status': 'ok'})
