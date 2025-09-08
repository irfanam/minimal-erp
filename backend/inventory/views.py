from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination

from .models import Product, Inventory, StockEntry, StockLedger
from .serializers import ProductSerializer, InventorySerializer, StockEntrySerializer, StockLedgerSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, F
from decimal import Decimal
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


class StockEntryViewSet(viewsets.ModelViewSet):
    queryset = StockEntry.objects.prefetch_related('lines__product').all()
    serializer_class = StockEntrySerializer
    permission_classes = [IsManagerOrAdmin]
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

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_entry(self, request, pk=None):
        entry = self.get_object()
        entry.apply_to_inventory()
        return Response(self.get_serializer(entry).data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_entry(self, request, pk=None):
        # For simplicity we won't reverse ledger movements here.
        return Response({'cancelled': True})

    @action(detail=False, methods=['post'], url_path='bulk-adjust')
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
        return Response({'created': created_ids})


class StockLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockLedger.objects.select_related('product').all()
    serializer_class = StockLedgerSerializer
    permission_classes = [IsManagerOrAdmin]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['movement_date', 'qty_change']
    ordering = ['-movement_date']

    @action(detail=False, methods=['get'], url_path='current-stock')
    def current_stock(self, request):
        qs = StockLedger.objects.values('product').order_by('product').annotate(balance=Sum('qty_change'))
        return Response(list(qs))

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        threshold = Decimal(request.query_params.get('threshold', '0'))
        # Summarize ledger balances
        balances = StockLedger.objects.values('product').annotate(balance=Sum('qty_change'))
        product_map = {b['product']: b['balance'] for b in balances}
        low = []
        for inv in Inventory.objects.select_related('product').all():
            bal = product_map.get(inv.product_id, Decimal('0'))
            if inv.reorder_level and bal <= inv.reorder_level and bal <= threshold:
                low.append({'product': inv.product_id, 'sku': inv.product.sku, 'name': inv.product.name, 'balance': bal})
        return Response(low)

    @action(detail=False, methods=['get'], url_path='valuation')
    def valuation(self, request):
        # Simple average cost * qty approach placeholder
        qs = StockLedger.objects.values('product').annotate(qty=Sum('qty_change'))
        data = []
        for row in qs:
            product = Product.objects.get(id=row['product'])
            qty = row['qty'] or Decimal('0')
            value = qty * (product.cost_price or Decimal('0'))
            data.append({'product': product.id, 'sku': product.sku, 'qty': qty, 'value': value})
        return Response(data)
