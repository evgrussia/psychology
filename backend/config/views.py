"""
Корневые view (health для LB и мониторинга, SPA fallback).
"""
import mimetypes
import os
from django.conf import settings
from django.http import FileResponse, JsonResponse, Http404


def health(request):
    """Корневой health check для /health/."""
    return JsonResponse({'status': 'ok'})


def spa_index(request):
    """Отдаёт index.html SPA для всех не-API маршрутов (client-side routing)."""
    index_path = os.path.join(settings.STATIC_ROOT, 'frontend', 'index.html')
    if not os.path.isfile(index_path):
        raise Http404('SPA index not found')
    return FileResponse(open(index_path, 'rb'), content_type='text/html')


def spa_asset(request, path):
    """Отдаёт статику SPA из frontend/assets/ (Vite build)."""
    root = os.path.join(settings.STATIC_ROOT, 'frontend', 'assets')
    file_path = os.path.normpath(os.path.join(root, path))
    if not file_path.startswith(os.path.abspath(root)) or not os.path.isfile(file_path):
        raise Http404('Asset not found')
    content_type, _ = mimetypes.guess_type(file_path) or ('application/octet-stream', None)
    return FileResponse(open(file_path, 'rb'), content_type=content_type)


def spa_favicon(request):
    """Отдаёт favicon SPA из frontend/."""
    favicon_path = os.path.join(settings.STATIC_ROOT, 'frontend', 'favicon.svg')
    if not os.path.isfile(favicon_path):
        raise Http404('Favicon not found')
    return FileResponse(open(favicon_path, 'rb'), content_type='image/svg+xml')
