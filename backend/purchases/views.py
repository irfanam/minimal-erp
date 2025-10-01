from rest_framework import viewsets, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Supplier
from .serializers import SupplierSerializer

from authentication.mixins import RoleScopedQuerysetMixin
from authentication.permissions import RoleScopedPermission, IsManagerOrAdmin


class DefaultPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 200


class SupplierViewSet(RoleScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Supplier.objects.all().select_related('created_by', 'updated_by')
    serializer_class = SupplierSerializer
    permission_classes = [RoleScopedPermission]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'phone', 'email', 'gstin']
    ordering_fields = ['name', 'code', 'created_at', 'updated_at']
    ordering = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='bulk-activate', permission_classes=[RoleScopedPermission, IsManagerOrAdmin])
    def bulk_activate(self, request):
        ids = request.data.get('ids', [])
        records = list(self.get_queryset().filter(id__in=ids))
        for obj in records:
            self.check_object_permissions(request, obj)
        updated = Supplier.objects.filter(id__in=[obj.id for obj in records]).update(is_active=True)
        return Response({'updated': updated}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='bulk-deactivate', permission_classes=[RoleScopedPermission, IsManagerOrAdmin])
    def bulk_deactivate(self, request):
        ids = request.data.get('ids', [])
        records = list(self.get_queryset().filter(id__in=ids))
        for obj in records:
            self.check_object_permissions(request, obj)
        updated = Supplier.objects.filter(id__in=[obj.id for obj in records]).update(is_active=False)
        return Response({'updated': updated}, status=status.HTTP_200_OK)
