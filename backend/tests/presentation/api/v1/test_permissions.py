"""
Unit-тесты для Custom Permissions (Phase 5).
"""
import pytest
from unittest.mock import Mock, MagicMock

from rest_framework.request import Request
from domain.identity.value_objects.role import Role

from presentation.api.v1.permissions import (
    IsOwner,
    IsOwnerOrAssistant,
    IsOwnerOrEditor,
    IsClientOrOwner,
    IsPublicOrAuthenticated,
    HasConsent,
)


def _mock_request(user=None, method="GET"):
    request = Mock(spec=Request)
    request.user = user
    request.method = method
    return request


@pytest.mark.django_db
class TestIsOwner:
    """Тесты для IsOwner."""

    def test_anonymous_denied(self):
        p = IsOwner()
        request = _mock_request(user=Mock(is_authenticated=False))
        assert p.has_permission(request, Mock()) is False

    def test_owner_allowed(self):
        p = IsOwner()
        user = Mock(is_authenticated=True)
        user.has_role = Mock(side_effect=lambda r: r == Role.OWNER)
        request = _mock_request(user=user)
        assert p.has_permission(request, Mock()) is True

    def test_non_owner_denied(self):
        p = IsOwner()
        user = Mock(is_authenticated=True)
        user.has_role = Mock(return_value=False)
        request = _mock_request(user=user)
        assert p.has_permission(request, Mock()) is False


@pytest.mark.django_db
class TestIsOwnerOrAssistant:
    """Тесты для IsOwnerOrAssistant."""

    def test_anonymous_denied(self):
        p = IsOwnerOrAssistant()
        request = _mock_request(user=Mock(is_authenticated=False))
        assert p.has_permission(request, Mock()) is False

    def test_owner_or_assistant_allowed(self):
        p = IsOwnerOrAssistant()
        user = Mock(is_authenticated=True)
        user.has_role = Mock(side_effect=lambda r: r in (Role.OWNER, Role.ASSISTANT))
        request = _mock_request(user=user)
        assert p.has_permission(request, Mock()) is True


@pytest.mark.django_db
class TestIsPublicOrAuthenticated:
    """Тесты для IsPublicOrAuthenticated."""

    def test_get_anonymous_allowed(self):
        p = IsPublicOrAuthenticated()
        request = _mock_request(user=Mock(is_authenticated=False), method="GET")
        assert p.has_permission(request, Mock()) is True

    def test_post_anonymous_denied(self):
        p = IsPublicOrAuthenticated()
        request = _mock_request(user=Mock(is_authenticated=False), method="POST")
        assert p.has_permission(request, Mock()) is False

    def test_post_authenticated_allowed(self):
        p = IsPublicOrAuthenticated()
        request = _mock_request(user=Mock(is_authenticated=True), method="POST")
        assert p.has_permission(request, Mock()) is True


@pytest.mark.django_db
class TestHasConsent:
    """Тесты для HasConsent."""

    def test_anonymous_denied(self):
        p = HasConsent()
        request = _mock_request(user=Mock(is_authenticated=False))
        assert p.has_permission(request, Mock()) is False

    def test_authenticated_with_consent_allowed(self):
        p = HasConsent()
        user = Mock(is_authenticated=True)
        user.has_active_consent = Mock(return_value=True)
        request = _mock_request(user=user)
        assert p.has_permission(request, Mock()) is True

    def test_authenticated_without_consent_denied(self):
        p = HasConsent()
        user = Mock(is_authenticated=True)
        user.has_active_consent = Mock(return_value=False)
        user.pd_consent = False
        request = _mock_request(user=user)
        assert p.has_permission(request, Mock()) is False


@pytest.mark.django_db
class TestIsClientOrOwner:
    """Тесты для IsClientOrOwner."""

    def test_anonymous_denied(self):
        p = IsClientOrOwner()
        request = _mock_request(user=Mock(is_authenticated=False))
        assert p.has_permission(request, Mock()) is False

    def test_client_sees_own_object(self):
        p = IsClientOrOwner()
        user = Mock(is_authenticated=True, id=42)
        user.has_role = Mock(side_effect=lambda r: r == Role.CLIENT)
        request = _mock_request(user=user)
        obj = Mock(user_id=42)
        assert p.has_permission(request, Mock()) is True
        assert p.has_object_permission(request, Mock(), obj) is True

    def test_client_denied_other_object(self):
        p = IsClientOrOwner()
        user = Mock(is_authenticated=True, id=42)
        user.has_role = Mock(side_effect=lambda r: r == Role.CLIENT)
        request = _mock_request(user=user)
        obj = Mock(user_id=999)
        assert p.has_object_permission(request, Mock(), obj) is False
