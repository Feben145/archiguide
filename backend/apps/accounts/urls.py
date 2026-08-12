from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    OrganizationViewSet,
    UserViewSet,
    ProjectViewSet,
    RegisterView,
)

router = DefaultRouter()

router.register(
    'organizations',
    OrganizationViewSet,
    basename='organization'
)

router.register(
    'users',
    UserViewSet,
    basename='user'
)

router.register(
    'projects',
    ProjectViewSet,
    basename='project'
)

urlpatterns = [
    path(
        '',
        include(router.urls)
    ),

    path(
        'auth/register/',
        RegisterView.as_view(),
        name='register'
    ),
]