from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination

from .models import Product, Inventory
from .serializers import ProductSerializer, InventorySerializer
from sales.views import IsManagerOrAdmin


class DefaultPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 200


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('created_by', 'updated_by')
    serializer_class = ProductSerializer
    permission_classes = [IsManagerOrAdmin]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['sku', 'name', 'description', 'hsn_code']
    ordering_fields = ['name', 'sku', 'created_at', 'updated_at']
    ordering = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('product', 'created_by', 'updated_by').all()
    serializer_class = InventorySerializer
    permission_classes = [IsManagerOrAdmin]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__sku', 'product__name']
    ordering_fields = ['product__name', 'on_hand', 'reorder_level', 'created_at', 'updated_at']
    ordering = ['product__name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
