from rest_framework import viewsets, filters, status
from rest_framework.pagination import PageNumberPagination

from .models import Product, Inventory, StockEntry, StockLedger
from .serializers import ProductSerializer, InventorySerializer, StockEntrySerializer, StockLedgerSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, F
from decimal import Decimal

from authentication.mixins import RoleScopedQuerysetMixin
from authentication.permissions import RoleScopedPermission, IsManagerOrAdmin


class DefaultPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 200


class ProductViewSet(RoleScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('created_by', 'updated_by')
    serializer_class = ProductSerializer
    permission_classes = [RoleScopedPermission]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['sku', 'name', 'description', 'hsn_code']
    ordering_fields = ['name', 'sku', 'created_at', 'updated_at']
    ordering = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='bulk-price-update', permission_classes=[RoleScopedPermission, IsManagerOrAdmin])
    def bulk_price_update(self, request):
        updates = request.data.get('updates', [])
        changed = []
        for upd in updates:
            pid = upd.get('id')
            price = upd.get('selling_price')
            if pid and price is not None:
                try:
                    obj = self.get_queryset().get(id=pid)
                    self.check_object_permissions(request, obj)
                    obj.selling_price = price
                    obj.updated_by = request.user
                    obj.save(update_fields=['selling_price', 'updated_at', 'updated_by'])
                    changed.append(obj.id)
                except Product.DoesNotExist:
                    continue
        return Response({'updated': changed}, status=status.HTTP_200_OK)


class InventoryViewSet(RoleScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('product', 'created_by', 'updated_by').all()
    serializer_class = InventorySerializer
    permission_classes = [RoleScopedPermission]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__sku', 'product__name']
    ordering_fields = ['product__name', 'on_hand', 'reorder_level', 'created_at', 'updated_at']
    ordering = ['product__name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class StockEntryViewSet(RoleScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = StockEntry.objects.prefetch_related('lines__product').all()
    serializer_class = StockEntrySerializer
    permission_classes = [RoleScopedPermission]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['reference_number', 'remarks', 'lines__product__name']
    ordering_fields = ['entry_date', 'created_at']
    ordering = ['-entry_date']

    def perform_create(self, serializer):
        entry = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        # apply_to_inventory already invoked in serializer
        entry.apply_to_inventory()

    def perform_update(self, serializer):
        entry = serializer.save(updated_by=self.request.user)
        entry.apply_to_inventory()

    @action(detail=True, methods=['post'], url_path='submit', permission_classes=[RoleScopedPermission, IsManagerOrAdmin])
    def submit_entry(self, request, pk=None):
        entry = self.get_object()
        entry.apply_to_inventory()
        return Response(self.get_serializer(entry).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='cancel', permission_classes=[RoleScopedPermission, IsManagerOrAdmin])
    def cancel_entry(self, request, pk=None):
        # For simplicity we won't reverse ledger movements here.
        return Response({'cancelled': True}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='bulk-adjust', permission_classes=[RoleScopedPermission, IsManagerOrAdmin])
    def bulk_adjust(self, request):
        adjustments = request.data.get('adjustments', [])
        created_ids = []
        for adj in adjustments:
            try:
                product_id = adj['product']
                qty = Decimal(str(adj.get('quantity', '0')))
            except Exception:
                continue
            if qty == 0:
                continue
            entry = StockEntry.objects.create(
                entry_type=StockEntry.EntryType.ADJUST,
                remarks='Bulk adjustment',
                created_by=request.user,
                updated_by=request.user,
            )
            StockEntryLine = entry.lines.model
            StockEntryLine.objects.create(stock_entry=entry, product_id=product_id, quantity=qty)
            entry.apply_to_inventory()
            created_ids.append(entry.id)
        return Response({'created': created_ids}, status=status.HTTP_201_CREATED)


class StockLedgerViewSet(RoleScopedQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = StockLedger.objects.select_related('product').all()
    serializer_class = StockLedgerSerializer
    permission_classes = [RoleScopedPermission]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['movement_date', 'qty_change']
    ordering = ['-movement_date']

    @action(detail=False, methods=['get'], url_path='current-stock')
    def current_stock(self, request):
        qs = self.get_queryset().values('product').order_by('product').annotate(balance=Sum('qty_change'))
        return Response(list(qs), status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        threshold = Decimal(request.query_params.get('threshold', '0'))
        # Summarize ledger balances
        base_qs = self.get_queryset()
        balances = base_qs.values('product').annotate(balance=Sum('qty_change'))
        product_map = {b['product']: b['balance'] for b in balances}
        allowed_product_ids = list(product_map.keys())
        low = []
        for inv in Inventory.objects.select_related('product').filter(product_id__in=allowed_product_ids):
            bal = product_map.get(inv.product_id, Decimal('0'))
            if inv.reorder_level and bal <= inv.reorder_level and bal <= threshold:
                low.append({'product': inv.product_id, 'sku': inv.product.sku, 'name': inv.product.name, 'balance': bal})
        return Response(low, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='valuation')
    def valuation(self, request):
        # Simple average cost * qty approach placeholder
        qs = self.get_queryset().values('product').annotate(qty=Sum('qty_change'))
        data = []
        for row in qs:
            product = Product.objects.get(id=row['product'])
            qty = row['qty'] or Decimal('0')
            value = qty * (product.cost_price or Decimal('0'))
            data.append({'product': product.id, 'sku': product.sku, 'qty': qty, 'value': value})
        return Response(data, status=status.HTTP_200_OK)
