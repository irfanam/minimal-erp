from datetime import date
from decimal import Decimal
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions

from sales.models import SalesOrder, Customer
from accounting.models import Invoice
from inventory.models import Product, Inventory, StockLedger


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_metrics(request):
    """Aggregate key metrics with optional date range filtering via ?start=YYYY-MM-DD&end=YYYY-MM-DD."""
    start_param = request.query_params.get('start')
    end_param = request.query_params.get('end')
    today = timezone.localdate()
    try:
        start = date.fromisoformat(start_param) if start_param else today.replace(day=1)
    except ValueError:
        start = today.replace(day=1)
    try:
        end = date.fromisoformat(end_param) if end_param else today
    except ValueError:
        end = today

    # Sales metrics
    orders_qs = SalesOrder.objects.filter(order_date__range=(start, end))
    total_sales = orders_qs.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    recent_orders = list(orders_qs.order_by('-order_date')[:5].values('id', 'order_number', 'order_date', 'status', 'total_amount'))

    invoices_qs = Invoice.objects.filter(invoice_date__range=(start, end))
    pending_invoices = invoices_qs.exclude(status__in=['PAID', 'CANCELLED']).count()

    # Inventory metrics
    total_products = Product.objects.count()
    low_stock = Inventory.objects.filter(on_hand__lte=F('reorder_level')).count()
    inv_value = Inventory.objects.select_related('product').aggregate(val=Sum(F('on_hand') * F('product__cost_price')))['val'] or Decimal('0')

    # Customer metrics
    total_customers = Customer.objects.count()
    new_customers = Customer.objects.filter(created_at__gte=start).count()

    # Financial metrics
    outstanding = invoices_qs.aggregate(balance=Sum('balance_amount'))['balance'] or Decimal('0')
    monthly_revenue = invoices_qs.aggregate(rev=Sum('grand_total'))['rev'] or Decimal('0')

    data = {
        'range': {'start': start, 'end': end},
        'sales': {
            'total_sales': total_sales,
            'recent_orders': recent_orders,
            'pending_invoices': pending_invoices,
        },
        'inventory': {
            'total_products': total_products,
            'low_stock': low_stock,
            'inventory_value': inv_value,
        },
        'customers': {
            'total_customers': total_customers,
            'new_customers': new_customers,
        },
        'financial': {
            'outstanding_receivables': outstanding,
            'monthly_revenue': monthly_revenue,
        }
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def global_search(request):
    """Search across customers, products, orders, invoices. ?q=term&limit=10"""
    term = (request.query_params.get('q') or '').strip()
    limit = int(request.query_params.get('limit', 10))
    if not term:
        return Response({'results': []})

    # Basic case-insensitive icontains search; could expand to trigrams/fuzzy
    customer_hits = Customer.objects.filter(Q(name__icontains=term) | Q(customer_code__icontains=term))[:limit]
    product_hits = Product.objects.filter(Q(name__icontains=term) | Q(sku__icontains=term))[:limit]
    order_hits = SalesOrder.objects.filter(Q(order_number__icontains=term))[:limit]
    invoice_hits = Invoice.objects.filter(Q(invoice_number__icontains=term))[:limit]

    def serialize(qs, type_name, fields):
        return [
            {
                'type': type_name,
                'id': obj.id,
                **{f: getattr(obj, f) for f in fields}
            }
            for obj in qs
        ]

    results = (
        serialize(customer_hits, 'customer', ['customer_code', 'name']) +
        serialize(product_hits, 'product', ['sku', 'name']) +
        serialize(order_hits, 'order', ['order_number', 'status']) +
        serialize(invoice_hits, 'invoice', ['invoice_number', 'status'])
    )
    return Response({'query': term, 'count': len(results), 'results': results[:limit]})
