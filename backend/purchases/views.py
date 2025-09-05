from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination

from .models import Supplier
from .serializers import SupplierSerializer
from sales.views import IsManagerOrAdmin


class DefaultPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 200


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().select_related('created_by', 'updated_by')
    serializer_class = SupplierSerializer
    permission_classes = [IsManagerOrAdmin]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'phone', 'email', 'gstin']
    ordering_fields = ['name', 'code', 'created_at', 'updated_at']
    ordering = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
