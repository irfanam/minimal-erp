from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ProductViewSet, InventoryViewSet, StockEntryViewSet, StockLedgerViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'stock-entries', StockEntryViewSet, basename='stock-entry')
router.register(r'stock-ledger', StockLedgerViewSet, basename='stock-ledger')

urlpatterns = [
    path('', include(router.urls)),
]
