from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination

from .models import Customer
from .serializers import CustomerSerializer


class DefaultPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 200


class IsManagerOrAdmin(permissions.BasePermission):
    """Allow managers and admins; read-only for others."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Safe methods are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        # For write operations, allow Django superusers OR role manager/admin
        if getattr(user, 'is_superuser', False):
            return True
        return getattr(user, 'is_admin', lambda: False)() or getattr(user, 'is_manager', lambda: False)()


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().select_related('created_by', 'updated_by')
    serializer_class = CustomerSerializer
    permission_classes = [IsManagerOrAdmin]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['customer_code', 'name', 'phone', 'email', 'gstin']
    ordering_fields = ['name', 'customer_code', 'created_at', 'updated_at']
    ordering = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
