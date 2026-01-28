"""
Unit-тесты для custom exception handler (Phase 5).
"""
import pytest
from unittest.mock import Mock

from rest_framework.response import Response
from rest_framework.exceptions import (
    ValidationError as DRFValidationError,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
    Throttled,
)

from domain.shared.exceptions import DomainError
from application.exceptions import ApplicationError, NotFoundError, ValidationError as AppValidationError
from presentation.api.v1.exceptions import custom_exception_handler


@pytest.mark.django_db
class TestCustomExceptionHandler:
    """Тесты для custom_exception_handler."""

    def test_drf_validation_error(self):
        """DRF ValidationError — единообразный формат."""
        exc = DRFValidationError({"email": ["Invalid email"]})
        context = {"view": Mock(), "request": Mock()}
        response = custom_exception_handler(exc, context)
        assert response is not None
        assert isinstance(response, Response)
        assert response.status_code == 400
        assert "error" in response.data
        assert "code" in response.data["error"]
        assert "message" in response.data["error"]
        assert "details" in response.data["error"]

    def test_not_authenticated(self):
        """NotAuthenticated — UNAUTHORIZED."""
        exc = NotAuthenticated()
        context = {"view": Mock(), "request": Mock()}
        response = custom_exception_handler(exc, context)
        assert response is not None
        assert response.status_code == 401
        assert response.data["error"]["code"] == "UNAUTHORIZED"

    def test_permission_denied(self):
        """PermissionDenied — FORBIDDEN."""
        exc = PermissionDenied()
        context = {"view": Mock(), "request": Mock()}
        response = custom_exception_handler(exc, context)
        assert response is not None
        assert response.status_code == 403
        assert response.data["error"]["code"] == "FORBIDDEN"

    def test_not_found(self):
        """NotFound — NOT_FOUND."""
        exc = NotFound()
        context = {"view": Mock(), "request": Mock()}
        response = custom_exception_handler(exc, context)
        assert response is not None
        assert response.status_code == 404
        assert response.data["error"]["code"] == "NOT_FOUND"

    def test_throttled(self):
        """Throttled — RATE_LIMIT_EXCEEDED."""
        exc = Throttled()
        context = {"view": Mock(), "request": Mock()}
        response = custom_exception_handler(exc, context)
        assert response is not None
        assert response.status_code == 429
        assert response.data["error"]["code"] == "RATE_LIMIT_EXCEEDED"

    def test_domain_error(self):
        """DomainError — DOMAIN_ERROR, 400."""
        exc = DomainError("Business rule violated")
        context = {"view": Mock(), "request": Mock()}
        response = custom_exception_handler(exc, context)
        assert response is not None
        assert isinstance(response, Response)
        assert response.status_code == 400
        assert response.data["error"]["code"] == "DOMAIN_ERROR"
        assert "Business rule violated" in response.data["error"]["message"]

    def test_application_error(self):
        """ApplicationError — сохраняет код из исключения."""
        exc = ApplicationError("Something failed", "APP_FAIL", 400, None)
        context = {"view": Mock(), "request": Mock()}
        response = custom_exception_handler(exc, context)
        assert response is not None
        assert response.status_code == 400
        assert response.data["error"]["code"] == "APP_FAIL"
        assert "Something failed" in response.data["error"]["message"]

    def test_unhandled_exception(self):
        """Необработанное исключение — INTERNAL_ERROR, 500."""
        exc = ValueError("Unexpected")
        context = {"view": Mock(), "request": Mock()}
        response = custom_exception_handler(exc, context)
        assert response is not None
        assert response.status_code == 500
        assert response.data["error"]["code"] == "INTERNAL_ERROR"
        assert "internal error" in response.data["error"]["message"].lower()
