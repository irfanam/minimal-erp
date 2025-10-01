from datetime import date
from decimal import Decimal
from django.db.models import Sum, Q, F
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
import logging

from sales.models import SalesOrder, Customer
from accounting.models import Invoice
from inventory.models import Product, Inventory

from authentication.mixins import scope_queryset_for_user

rbac_logger = logging.getLogger("auth.rbac")


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_metrics(request):
    """Aggregate key metrics with optional date range filtering via ?start=YYYY-MM-DD&end=YYYY-MM-DD."""
    user = request.user
    rbac_logger.info(
        "rbac_api_access endpoint=dashboard_metrics user=%s role=%s params=%s",
        getattr(user, "username", None),
        getattr(user, "role", None),
        dict(request.query_params),
    )

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

    orders_qs = scope_queryset_for_user(user, SalesOrder.objects.all()).filter(order_date__range=(start, end))
    total_sales = orders_qs.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    recent_orders = list(orders_qs.order_by('-order_date')[:5].values('id', 'order_number', 'order_date', 'status', 'total_amount'))

    invoices_qs = scope_queryset_for_user(user, Invoice.objects.all()).filter(invoice_date__range=(start, end))
    pending_invoices = invoices_qs.exclude(status__in=['PAID', 'CANCELLED']).count()

    products_qs = scope_queryset_for_user(user, Product.objects.all())
    total_products = products_qs.count()
    inventory_qs = scope_queryset_for_user(user, Inventory.objects.select_related('product').all())
    low_stock = inventory_qs.filter(on_hand__lte=F('reorder_level')).count()
    inv_value = inventory_qs.aggregate(val=Sum(F('on_hand') * F('product__cost_price')))['val'] or Decimal('0')

    # Customer metrics
    customers_qs = scope_queryset_for_user(user, Customer.objects.all())
    total_customers = customers_qs.count()
    new_customers = customers_qs.filter(created_at__gte=start).count()

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

    user = request.user
    rbac_logger.info(
        "rbac_api_access endpoint=global_search user=%s role=%s params=%s",
        getattr(user, "username", None),
        getattr(user, "role", None),
        dict(request.query_params),
    )

    # Basic case-insensitive icontains search; could expand to trigrams/fuzzy
    customer_hits = scope_queryset_for_user(user, Customer.objects.all()).filter(
        Q(name__icontains=term) | Q(customer_code__icontains=term)
    )[:limit]
    product_hits = scope_queryset_for_user(user, Product.objects.all()).filter(
        Q(name__icontains=term) | Q(sku__icontains=term)
    )[:limit]
    order_hits = scope_queryset_for_user(user, SalesOrder.objects.all()).filter(
        Q(order_number__icontains=term)
    )[:limit]
    invoice_hits = scope_queryset_for_user(user, Invoice.objects.all()).filter(
        Q(invoice_number__icontains=term)
    )[:limit]

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
