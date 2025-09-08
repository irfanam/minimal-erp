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
from .models import SalesOrder
from .serializers import CustomerSerializer
from .serializers import SalesOrderSerializer


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

    # --- Bulk operations ---
    @action(detail=False, methods=['post'], url_path='bulk-activate')
    def bulk_activate(self, request):
        ids = request.data.get('ids', [])
        updated = Customer.objects.filter(id__in=ids).update(is_active=True)
        return Response({'updated': updated})

    @action(detail=False, methods=['post'], url_path='bulk-deactivate')
    def bulk_deactivate(self, request):
        ids = request.data.get('ids', [])
        updated = Customer.objects.filter(id__in=ids).update(is_active=False)
        return Response({'updated': updated})

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.prefetch_related('lines__product', 'customer').all()
    serializer_class = SalesOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number', 'customer__name']
    ordering_fields = ['order_date', 'created_at', 'total_amount']
    ordering = ['-order_date']

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        status_val = params.get('status')
        customer_id = params.get('customer')
        date_from = params.get('order_date_from')
        date_to = params.get('order_date_to')
        if status_val:
            qs = qs.filter(status=status_val)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        if date_from:
            qs = qs.filter(order_date__gte=date_from)
        if date_to:
            qs = qs.filter(order_date__lte=date_to)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()
        if not order.can_confirm():
            return Response({'detail': 'Cannot confirm order in its current state.'}, status=400)
        order.confirm(user=request.user)
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if not order.can_cancel():
            return Response({'detail': 'Cannot cancel order in its current state.'}, status=400)
        order.cancel(user=request.user)
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        order = self.get_object()
        if not order.can_mark_delivered():
            return Response({'detail': 'Cannot mark delivered in its current state.'}, status=400)
        order.mark_delivered(user=request.user)
        return Response(self.get_serializer(order).data)

    @action(detail=False, methods=['post'], url_path='bulk-confirm')
    def bulk_confirm(self, request):
        ids = request.data.get('ids', [])
        updated = []
        for order in SalesOrder.objects.filter(id__in=ids):
            if order.can_confirm():
                order.confirm(user=request.user)
                updated.append(order.id)
        return Response({'updated': updated})

    @action(detail=False, methods=['post'], url_path='bulk-cancel')
    def bulk_cancel(self, request):
        ids = request.data.get('ids', [])
        updated = []
        for order in SalesOrder.objects.filter(id__in=ids):
            if order.can_cancel():
                order.cancel(user=request.user)
                updated.append(order.id)
        return Response({'updated': updated})

    @action(detail=False, methods=['post'], url_path='bulk-status')
    def bulk_status(self, request):
        ids = request.data.get('ids', [])
        status_val = request.data.get('status')
        changed = []
        for order in SalesOrder.objects.filter(id__in=ids):
            try:
                if status_val == SalesOrder.Status.CONFIRMED and order.can_confirm():
                    order.confirm(user=request.user)
                    changed.append(order.id)
                elif status_val == SalesOrder.Status.CANCELLED and order.can_cancel():
                    order.cancel(user=request.user)
                    changed.append(order.id)
                elif status_val == SalesOrder.Status.DELIVERED and order.can_mark_delivered():
                    order.mark_delivered(user=request.user)
                    changed.append(order.id)
            except Exception:
                continue
        return Response({'updated': changed})
