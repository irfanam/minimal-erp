"""DRF views for the Sales app.

This module exposes a Customer API with:
- Full CRUD via ModelViewSet
- Filtering by name and city (via query params)
- Search across common fields
- Ordering (by name by default)
- Custom action to fetch a customer's balance (placeholder)

All endpoints require authentication. Read operations are open to any
authenticated user; write operations require manager/admin/superuser.
"""

from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.db.models import Q
from decimal import Decimal

from accounting.models import ARInvoice, ARPaymentAllocation

from .models import Customer
from .serializers import CustomerSerializer


class DefaultPagination(PageNumberPagination):
    """Simple page-number pagination with sane defaults."""

    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 200


class IsManagerOrAdmin(permissions.BasePermission):
    """
    Write access for managers/admins; read-only for other authenticated users.

    - Unauthenticated: no access
    - Safe methods (GET, HEAD, OPTIONS): any authenticated user
    - Mutating methods (POST, PUT, PATCH, DELETE): superuser OR role=manager/admin
    """

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
    """
    Customer API with full CRUD and useful list capabilities.

    Query params supported on list endpoint:
    - name: case-insensitive contains filter on customer name
    - city: case-insensitive contains filter on billing or shipping address
    - search: fuzzy search across code/name/phone/email/gstin (DRF SearchFilter)
    - ordering: e.g., ?ordering=name or ?ordering=-name
    """

    queryset = Customer.objects.all().select_related('created_by', 'updated_by')
    serializer_class = CustomerSerializer
    permission_classes = [IsManagerOrAdmin]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['customer_code', 'name', 'phone', 'email', 'gstin']
    # Restrict ordering to safe, indexed fields (default is by name)
    ordering_fields = ['name', 'customer_code', 'created_at', 'updated_at']
    ordering = ['name']

    def get_queryset(self):
        """Apply simple filters by name and city using query params."""
        qs = super().get_queryset()
        params = self.request.query_params
        name = params.get('name')
        city = params.get('city')
        if name:
            qs = qs.filter(name__icontains=name)
        if city:
            # We don't have an explicit city field; search within addresses
            qs = qs.filter(Q(billing_address__icontains=city) | Q(shipping_address__icontains=city))
        return qs

    # --- Audit helpers to auto-populate created_by/updated_by ---
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    # --- Custom actions ---
    @action(detail=True, methods=['get'], url_path='balance', permission_classes=[permissions.IsAuthenticated])
    def balance(self, request, pk=None):
        """
        Return the customer's current outstanding balance:
        sum(issued/partial invoices grand_total) - sum(payment allocations applied to those invoices).
        """
        customer = self.get_object()
        invoices_qs = ARInvoice.objects.filter(
            customer=customer,
            status__in=[ARInvoice.Status.ISSUED, ARInvoice.Status.PARTIAL]
        )
        total_invoiced = invoices_qs.aggregate(total=models.Sum('grand_total'))['total'] or Decimal('0')
        allocations_qs = ARPaymentAllocation.objects.filter(invoice__in=invoices_qs)
        total_allocated = allocations_qs.aggregate(total=models.Sum('amount_applied'))['total'] or Decimal('0')
        balance_amount = (total_invoiced - total_allocated).quantize(Decimal('0.01'))
        data = {
            'customer_id': customer.id,
            'customer_code': customer.customer_code,
            'balance': balance_amount,
            'currency': 'INR',
        }
        return Response(data)
