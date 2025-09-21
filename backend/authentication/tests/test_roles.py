import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from authentication import permissions as perm

User = get_user_model()


@pytest.mark.django_db
def test_role_capability_matrix():
    viewer = User.objects.create_user(username="v", password="x", role="viewer")
    staff = User.objects.create_user(username="s", password="x", role="staff")
    accountant = User.objects.create_user(username="a", password="x", role="accountant")
    manager = User.objects.create_user(username="m", password="x", role="manager")
    admin = User.objects.create_user(username="ad", password="x", role="admin")

    assert viewer.can_view_reports() and viewer.is_viewer()
    assert not viewer.can_create_transactions()
    assert staff.can_create_transactions() and not staff.can_edit_finances()
    assert accountant.can_edit_finances() and accountant.can_view_finances()
    assert manager.can_approve_orders() and manager.can_edit_inventory()
    assert admin.can_manage_users() and admin.is_admin()

    # Precedence ordering
    assert admin.has_role_at_least('manager')
    assert manager.has_role_at_least('staff')
    assert not staff.has_role_at_least('manager')


@pytest.mark.django_db
def test_permission_classes_basic():
    factory = APIRequestFactory()
    admin = User.objects.create_user(username="ad", password="x", role="admin")
    viewer = User.objects.create_user(username="v", password="x", role="viewer")

    req_admin = factory.get("/reports/")
    req_admin.user = admin
    req_viewer = factory.post("/orders/approve/")
    req_viewer.user = viewer

    assert perm.IsAdmin().has_permission(req_admin, None) is True
    assert perm.IsAdmin().has_permission(req_viewer, None) is False
    assert perm.ReadOnlyOrViewer().has_permission(req_admin, None) is True
    # viewer cannot POST (unsafe) using ReadOnlyOrViewer
    assert perm.ReadOnlyOrViewer().has_permission(req_viewer, None) is False
