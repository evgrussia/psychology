"""
API v1 URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# from presentation.api.v1.views import ...

router = DefaultRouter()
# router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
