"""
Django settings for testing environment.
"""
from .base import *

# Testing secret key
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-test-key-for-unit-tests-only')

DEBUG = True

# Use in-memory database for faster tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable migrations during tests (optional, for speed)
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

# Uncomment to disable migrations during tests
# MIGRATION_MODULES = DisableMigrations()

# Password hashers (faster for tests)
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Email backend (in-memory for tests)
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Disable logging during tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
}

# Disable throttling during tests
REST_FRAMEWORK = {**REST_FRAMEWORK, 'DEFAULT_THROTTLE_CLASSES': []}

# Ensure SIMPLE_JWT uses the testing SECRET_KEY
SIMPLE_JWT = {**SIMPLE_JWT, 'SIGNING_KEY': SECRET_KEY}

# Encryption key for tests
ENCRYPTION_KEY = 'vO_k_p8v1J_1Z6e9V2-L9XvB8Z1Z6e9V2-L9XvB8Z1U=' # Example valid Fernet key

TESTING = True
