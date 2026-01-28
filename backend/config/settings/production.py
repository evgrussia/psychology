"""
Django settings for production environment.
"""
from .base import *
import os

# Production must have a secret key set in environment
SECRET_KEY = os.environ['SECRET_KEY']

# Security
DEBUG = False
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'example.com,www.example.com,api.example.com').split(',')

# За прокси (nginx) доверяем X-Forwarded-Proto, иначе SECURE_SSL_REDIRECT даёт бесконечный редирект
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# Django 4+: иначе форма входа админки по HTTPS даёт 403 CSRF
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', 'https://balance-space.ru,https://www.balance-space.ru').split(',')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': os.environ.get('DB_SSLMODE', 'require'),
        },
        'CONN_MAX_AGE': 600,
    }
}

# Cache (встроенный Redis backend Django; OPTIONS передаются в redis-py ConnectionPool)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': f"redis://{os.environ.get('REDIS_HOST', 'localhost')}:6379/1",
        'OPTIONS': {
            'socket_connect_timeout': 5,
            'socket_timeout': 5,
        }
    }
}

# Static & Media (в Docker: volume смонтирован в /app/staticfiles и /app/media)
STATIC_ROOT = os.environ.get('STATIC_ROOT', '/app/staticfiles')
MEDIA_ROOT = os.environ.get('MEDIA_ROOT', '/app/media')
STATIC_URL = '/static/'
MEDIA_URL = '/media/'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage', 'OPTIONS': {'location': MEDIA_ROOT}},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}

# Logging (default /tmp in Docker; on host set DJANGO_LOG_FILE=/var/log/django/app.log)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s %(pathname)s %(lineno)d',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.environ.get('DJANGO_LOG_FILE', '/tmp/django-app.log'),
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 10,
            'formatter': 'json',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'app': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@example.com')

# Prometheus
INSTALLED_APPS += ['django_prometheus']
MIDDLEWARE = (
    ['django_prometheus.middleware.PrometheusBeforeMiddleware'] +
    MIDDLEWARE +
    ['django_prometheus.middleware.PrometheusAfterMiddleware']
)

# OpenTelemetry Tracing — включаем только если JAEGER_HOST задан (иначе экспорт падает по "Name or service not known")
_jaeger_host = os.environ.get('JAEGER_HOST', '').strip()
if _jaeger_host:
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.exporter.jaeger.thrift import JaegerExporter
        from opentelemetry.instrumentation.django import DjangoInstrumentor

        trace.set_tracer_provider(TracerProvider())
        jaeger_exporter = JaegerExporter(
            agent_host_name=_jaeger_host,
            agent_port=int(os.environ.get('JAEGER_PORT', 6831)),
        )
        trace.get_tracer_provider().add_span_processor(
            BatchSpanProcessor(jaeger_exporter)
        )
        DjangoInstrumentor().instrument()
    except Exception:  # noqa: BLE001
        pass
