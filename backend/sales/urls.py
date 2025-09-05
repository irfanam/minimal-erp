from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CustomerViewSet

# App-level router for Sales endpoints
router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')

urlpatterns = [
    path('', include(router.urls)),
]
