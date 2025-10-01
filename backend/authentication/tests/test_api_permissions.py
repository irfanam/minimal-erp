import logging
import os
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from accounting.models import Invoice
from inventory.models import Product, StockEntry, StockEntryLine, Inventory
from purchases.models import Supplier
from sales.models import Customer, SalesOrder, SalesOrderLine


@pytest.fixture
def api_log_path(settings):
    log_path = settings.BASE_DIR / 'logs' / 'api_permissions_test.log'
    os.makedirs(log_path.parent, exist_ok=True)

    handler = logging.FileHandler(log_path, mode='w')
    handler.setFormatter(logging.Formatter('[%(asctime)s] %(levelname)s %(name)s %(message)s'))

    audit_logger = logging.getLogger('auth.rbac')
    test_logger = logging.getLogger('api_permissions_test')
    audit_logger.addHandler(handler)
    test_logger.addHandler(handler)
    test_logger.setLevel(logging.INFO)
    audit_logger.setLevel(logging.INFO)

    yield log_path

    audit_logger.removeHandler(handler)
    test_logger.removeHandler(handler)
    handler.close()


@pytest.fixture
def users(db):
    User = get_user_model()
    admin = User.objects.create_user(
        username='admin-user', password='pass', role=User.Roles.ADMIN, department='HQ'
    )
    manager = User.objects.create_user(
        username='manager-user', password='pass', role=User.Roles.MANAGER, department='Sales'
    )
    staff_sales = User.objects.create_user(
        username='staff-sales', password='pass', role=User.Roles.STAFF, department='Sales'
    )
    staff_finance = User.objects.create_user(
        username='staff-finance', password='pass', role=User.Roles.STAFF, department='Finance'
    )
    viewer = User.objects.create_user(
        username='viewer-user', password='pass', role=User.Roles.VIEWER, department='Sales'
    )
    return {
        'admin': admin,
        'manager': manager,
        'staff_sales': staff_sales,
        'staff_finance': staff_finance,
        'viewer': viewer,
    }


def _create_stock_entry_for_user(user, product):
    entry = StockEntry.objects.create(
        entry_type=StockEntry.EntryType.IN,
        remarks=f'Seed entry for {user.username}',
        created_by=user,
        updated_by=user,
    )
    StockEntryLine.objects.create(
        stock_entry=entry,
        product=product,
        quantity=Decimal('5.000'),
        rate=Decimal('100.00'),
        created_by=user,
        updated_by=user,
    )
    entry.apply_to_inventory()
    inventory = Inventory.objects.get(product=product)
    return entry, inventory


@pytest.fixture
def permission_test_data(db, users):
    data = {}
    for key in ['manager', 'staff_sales', 'staff_finance', 'viewer']:
        user = users[key]
        suffix = key.replace('_', '-').upper()
        product = Product.objects.create(
            sku=f'SKU-{suffix}',
            name=f'Product {suffix}',
            created_by=user,
            updated_by=user,
        )
        stock_entry, inventory = _create_stock_entry_for_user(user, product)
        customer = Customer.objects.create(
            customer_code=f'CUST-{suffix}',
            name=f'Customer {suffix}',
            created_by=user,
            updated_by=user,
        )
        order = SalesOrder.objects.create(
            order_number=f'ORDER-{suffix}',
            customer=customer,
            created_by=user,
            updated_by=user,
        )
        SalesOrderLine.objects.create(
            order=order,
            product=product,
            quantity=Decimal('1.00'),
            rate=Decimal('500.00'),
            created_by=user,
            updated_by=user,
        )
        supplier = Supplier.objects.create(
            code=f'SUP-{suffix}',
            name=f'Supplier {suffix}',
            created_by=user,
            updated_by=user,
        )
        invoice = Invoice.objects.create(
            invoice_number=f'INV-{suffix}',
            customer=customer,
            created_by=user,
            updated_by=user,
        )
        invoice.calculate_totals(save=True)

        data[key] = {
            'product': product,
            'stock_entry': stock_entry,
            'inventory': inventory,
            'customer': customer,
            'sales_order': order,
            'supplier': supplier,
            'invoice': invoice,
        }

    # Admin-owned records
    admin_user = users['admin']
    suffix = 'ADMIN'
    product = Product.objects.create(
        sku=f'SKU-{suffix}',
        name=f'Product {suffix}',
        created_by=admin_user,
        updated_by=admin_user,
    )
    _create_stock_entry_for_user(admin_user, product)
    customer = Customer.objects.create(
        customer_code=f'CUST-{suffix}',
        name=f'Customer {suffix}',
        created_by=admin_user,
        updated_by=admin_user,
    )
    order = SalesOrder.objects.create(
        order_number=f'ORDER-{suffix}',
        customer=customer,
        created_by=admin_user,
        updated_by=admin_user,
    )
    SalesOrderLine.objects.create(
        order=order,
        product=product,
        quantity=Decimal('3.00'),
        rate=Decimal('700.00'),
        created_by=admin_user,
        updated_by=admin_user,
    )
    supplier = Supplier.objects.create(
        code=f'SUP-{suffix}',
        name=f'Supplier {suffix}',
        created_by=admin_user,
        updated_by=admin_user,
    )
    invoice = Invoice.objects.create(
        invoice_number=f'INV-{suffix}',
        customer=customer,
        created_by=admin_user,
        updated_by=admin_user,
    )
    invoice.calculate_totals(save=True)

    data['admin'] = {
        'product': product,
        'customer': customer,
        'sales_order': order,
        'supplier': supplier,
        'invoice': invoice,
    }
    return data


@pytest.fixture
def api_request(api_log_path):
    client = APIClient()
    test_logger = logging.getLogger('api_permissions_test')

    def _request(user, method, url, data=None):
        client.force_authenticate(user=user)
        test_logger.info(
            'request role=%s method=%s url=%s payload=%s',
            getattr(user, 'role', None),
            method.upper(),
            url,
            data,
        )
        http_method = getattr(client, method.lower())
        response = http_method(url, data=data, format='json')
        test_logger.info(
            'response role=%s url=%s status=%s',
            getattr(user, 'role', None),
            url,
            response.status_code,
        )
        client.force_authenticate(user=None)
        return response

    return _request


@pytest.mark.django_db
def test_permission_matrix_list_endpoints(users, permission_test_data, api_request):
    endpoints = {
        'customer-list': lambda data: [data['manager']['customer'], data['staff_sales']['customer'], data['viewer']['customer']],
        'sales-order-list': lambda data: [data['manager']['sales_order'], data['staff_sales']['sales_order'], data['viewer']['sales_order']],
        'product-list': lambda data: [data['manager']['product'], data['staff_sales']['product'], data['viewer']['product']],
        'inventory-list': lambda data: [],
        'stock-entry-list': lambda data: [data['manager']['stock_entry'], data['staff_sales']['stock_entry'], data['viewer']['stock_entry']],
        'stock-ledger-list': lambda data: [],
        'supplier-list': lambda data: [data['manager']['supplier'], data['staff_sales']['supplier'], data['viewer']['supplier']],
        'invoice-list': lambda data: [data['manager']['invoice'], data['staff_sales']['invoice'], data['viewer']['invoice']],
    }

    expected_counts = {
        'admin': 5,
        'manager': 3,
        'staff_sales': 1,
        'staff_finance': 1,
        'viewer': 1,
    }

    for endpoint in endpoints:
        url = reverse(endpoint)
        for role, user in users.items():
            response = api_request(user, 'get', url)
            assert response.status_code == 200
            count = response.data['count'] if isinstance(response.data, dict) and 'count' in response.data else len(response.data)
            assert count == expected_counts[role], (
                f"Unexpected count for {endpoint} with role {role}: {count} != {expected_counts[role]}"
            )

    # Explicit ID checks for Customers to ensure matrix expectations
    customer_url = reverse('customer-list')
    response = api_request(users['manager'], 'get', customer_url)
    manager_ids = {item['id'] for item in response.data['results']}
    expected_manager_ids = {
        permission_test_data['manager']['customer'].id,
        permission_test_data['staff_sales']['customer'].id,
        permission_test_data['viewer']['customer'].id,
    }
    assert manager_ids == expected_manager_ids

    response = api_request(users['staff_sales'], 'get', customer_url)
    staff_ids = {item['id'] for item in response.data['results']}
    assert staff_ids == {permission_test_data['staff_sales']['customer'].id}

    response = api_request(users['viewer'], 'get', customer_url)
    viewer_ids = {item['id'] for item in response.data['results']}
    assert viewer_ids == {permission_test_data['viewer']['customer'].id}


@pytest.mark.django_db
def test_role_scoped_detail_enforcement(users, permission_test_data, api_request):
    manager = users['manager']
    staff_sales = users['staff_sales']

    customer_sales = permission_test_data['staff_sales']['customer']
    customer_finance = permission_test_data['staff_finance']['customer']

    detail_url_sales = reverse('customer-detail', args=[customer_sales.id])
    detail_url_finance = reverse('customer-detail', args=[customer_finance.id])

    # Manager can view same department record
    response = api_request(manager, 'get', detail_url_sales)
    assert response.status_code == 200

    # Manager blocked from other department record
    response = api_request(manager, 'get', detail_url_finance)
    assert response.status_code == 404

    # Staff cannot see manager-owned records
    manager_customer = permission_test_data['manager']['customer']
    detail_url_manager = reverse('customer-detail', args=[manager_customer.id])
    response = api_request(staff_sales, 'get', detail_url_manager)
    assert response.status_code == 404


@pytest.mark.django_db
def test_custom_actions_permission_enforcement(users, permission_test_data, api_request):
    manager = users['manager']
    staff_sales = users['staff_sales']

    # Customer bulk activate
    customer_ids = [
        permission_test_data['manager']['customer'].id,
        permission_test_data['staff_sales']['customer'].id,
    ]
    url = reverse('customer-bulk-activate')
    response = api_request(manager, 'post', url, {'ids': customer_ids})
    assert response.status_code == 200
    assert response.data['updated'] == 2

    response = api_request(staff_sales, 'post', url, {'ids': customer_ids})
    assert response.status_code == 403

    # Product bulk price update
    product = permission_test_data['manager']['product']
    url = reverse('product-bulk-price-update')
    response = api_request(manager, 'post', url, {'updates': [{'id': product.id, 'selling_price': '999.00'}]})
    assert response.status_code == 200
    product.refresh_from_db()
    assert str(product.selling_price) == '999.00'

    response = api_request(staff_sales, 'post', url, {'updates': [{'id': product.id, 'selling_price': '555.00'}]})
    assert response.status_code == 403

    # Stock entry bulk adjust
    url = reverse('stock-entry-bulk-adjust')
    adjustments = [{'product': product.id, 'quantity': '2'}]
    response = api_request(manager, 'post', url, {'adjustments': adjustments})
    assert response.status_code == 201
    assert len(response.data['created']) == 1

    response = api_request(staff_sales, 'post', url, {'adjustments': adjustments})
    assert response.status_code == 403

    # Invoice generate pdf
    invoice_manager = permission_test_data['manager']['invoice']
    url = reverse('invoice-generate-pdf', args=[invoice_manager.id])
    response = api_request(manager, 'post', url)
    assert response.status_code == 200

    invoice_staff = permission_test_data['staff_sales']['invoice']
    url = reverse('invoice-generate-pdf', args=[invoice_staff.id])
    response = api_request(staff_sales, 'post', url)
    assert response.status_code == 403


@pytest.mark.django_db
def test_audit_logging_captures_access_attempts(api_log_path, users, permission_test_data, api_request):
    endpoints = [
        reverse('product-list'),
        reverse('customer-list'),
    ]
    for endpoint in endpoints:
        for role, user in users.items():
            resp = api_request(user, 'get', endpoint)
            assert resp.status_code in (200, 403)

    # Forbidden custom action attempt
    viewer = users['viewer']
    viewer_customer = permission_test_data['viewer']['customer']
    resp = api_request(viewer, 'post', reverse('customer-bulk-activate'), {'ids': [viewer_customer.id]})
    assert resp.status_code == 403

    # Unauthenticated access triggers denied log
    client = APIClient()
    client.get(reverse('product-list'))

    for logger_name in ('auth.rbac', 'api_permissions_test'):
        logger = logging.getLogger(logger_name)
        for handler in logger.handlers:
            if hasattr(handler, 'flush'):
                handler.flush()

    contents = api_log_path.read_text()
    for user in users.values():
        assert f"role={user.role}" in contents
    assert 'allowed=False' in contents
    assert 'allowed=True' in contents