# tests/smoke/test_production.py
import pytest
import requests
import os
from django.test import TestCase

# В production BASE_URL должен браться из переменных окружения или быть дефолтным
BASE_URL = os.environ.get("SMOKE_TEST_BASE_URL", "https://example.com")

class SmokeTests(TestCase):
    def test_health_check(self):
        """Проверка доступности health check эндпоинта."""
        try:
            response = requests.get(f"{BASE_URL}/health/", timeout=5)
            assert response.status_code == 200
        except requests.exceptions.RequestException:
            pytest.fail(f"Could not connect to {BASE_URL}/health/")

    def test_homepage(self):
        """Проверка загрузки главной страницы."""
        try:
            response = requests.get(f"{BASE_URL}/", timeout=5)
            assert response.status_code == 200
            # Ожидаем наличие заголовка или текста проекта
            assert "Эмоциональный баланс" in response.text or "Emotional Balance" in response.text
        except requests.exceptions.RequestException:
            pytest.fail(f"Could not connect to {BASE_URL}/")

    def test_api_health(self):
        """Проверка доступности API health check."""
        try:
            response = requests.get(f"{BASE_URL}/api/v1/health/", timeout=5)
            assert response.status_code == 200
            data = response.json()
            assert data.get("status") == "ok"
        except requests.exceptions.RequestException:
            pytest.fail(f"Could not connect to {BASE_URL}/api/v1/health/")

    def test_static_files(self):
        """Проверка доступности статических файлов."""
        # Путь к файлу может отличаться, проверяем типичный путь
        try:
            response = requests.get(f"{BASE_URL}/static/rest_framework/css/bootstrap.min.css", timeout=5)
            assert response.status_code == 200
        except requests.exceptions.RequestException:
            pytest.fail(f"Could not connect to static files on {BASE_URL}")

    def test_media_files(self):
        """Проверка доступности медиа-файлов."""
        # 404 допустим для теста, если файл не существует, но сервер должен отвечать
        try:
            response = requests.get(f"{BASE_URL}/media/test.jpg", allow_redirects=False, timeout=5)
            assert response.status_code in [200, 404]
        except requests.exceptions.RequestException:
            pytest.fail(f"Could not connect to media files on {BASE_URL}")

    def test_database_connection(self):
        """Проверка соединения с базой данных через Django."""
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                assert cursor.fetchone()[0] == 1
        except Exception as e:
            pytest.fail(f"Database connection failed: {str(e)}")

    def test_redis_connection(self):
        """Проверка соединения с Redis через Django cache."""
        from django.core.cache import cache
        try:
            cache.set("smoke_test", "ok", 10)
            assert cache.get("smoke_test") == "ok"
        except Exception as e:
            pytest.fail(f"Redis connection failed: {str(e)}")
