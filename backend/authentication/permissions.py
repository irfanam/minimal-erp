"""Custom DRF permission classes for role-based access control (RBAC).

Each permission logs its evaluation to the 'auth.rbac' logger for audit trails.
Use these in views or viewsets via `permission_classes`.
"""
from __future__ import annotations

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import View
from typing import Any
import logging

logger = logging.getLogger("auth.rbac")


class _LoggingPermission(BasePermission):
    """Base permission that provides structured logging."""
    message = "You do not have permission to perform this action."

    def _log(self, request: Request, allowed: bool, reason: str):  # pragma: no cover (simple logging)
        user = getattr(request, "user", None)
        logger.info(
            "rbac_check user=%s role=%s path=%s method=%s allowed=%s reason=%s",
            getattr(user, "username", None),
            getattr(user, "role", None),
            request.path,
            request.method,
            allowed,
            reason,
        )
        return allowed


class IsAdmin(_LoggingPermission):
    def has_permission(self, request: Request, view: View):
        allowed = bool(request.user and request.user.is_authenticated and request.user.is_admin())
        return self._log(request, allowed, "is_admin required")


class IsManagerOrAdmin(_LoggingPermission):
    def has_permission(self, request: Request, view: View):
        u = request.user
        allowed = bool(u and u.is_authenticated and (u.is_manager() or u.is_admin()))
        return self._log(request, allowed, "manager or admin required")


class CanEditFinances(_LoggingPermission):
    def has_permission(self, request: Request, view: View):
        u = request.user
        allowed = bool(u and u.is_authenticated and u.can_edit_finances())
        return self._log(request, allowed, "edit finances capability required")


class CanApproveOrders(_LoggingPermission):
    def has_permission(self, request: Request, view: View):
        u = request.user
        allowed = bool(u and u.is_authenticated and u.can_approve_orders())
        return self._log(request, allowed, "approve orders capability required")


class CanViewReports(_LoggingPermission):
    def has_permission(self, request: Request, view: View):
        u = request.user
        allowed = bool(u and u.is_authenticated and u.can_view_reports())
        return self._log(request, allowed, "view reports capability required")


class CanCreateTransactions(_LoggingPermission):
    def has_permission(self, request: Request, view: View):
        u = request.user
        allowed = bool(u and u.is_authenticated and u.can_create_transactions())
        return self._log(request, allowed, "create transactions capability required")


class ReadOnlyOrViewer(_LoggingPermission):
    """Allow safe (GET/HEAD/OPTIONS) for any authenticated user; restrict unsafe to staff+."""
    def has_permission(self, request: Request, view: View):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            allowed = bool(request.user and request.user.is_authenticated)
            return self._log(request, allowed, "safe method")
        u = request.user
        allowed = bool(u and u.is_authenticated and not u.is_viewer())
        return self._log(request, allowed, "write requires non-viewer role")


__all__ = [
    "IsAdmin",
    "IsManagerOrAdmin",
    "CanEditFinances",
    "CanApproveOrders",
    "CanViewReports",
    "CanCreateTransactions",
    "ReadOnlyOrViewer",
    "RoleScopedPermission",
]


def _resolve_attr(obj: Any, dotted: str | None) -> Any:
    """Safely traverse dotted/dunder paths (e.g., "customer__department")."""
    if not obj or not dotted:
        return None
    current = obj
    for part in dotted.split("__"):
        current = getattr(current, part, None)
        if current is None:
            break
    return current


class RoleScopedPermission(_LoggingPermission):
    """Grant baseline access to authenticated users while enforcing role-based scopes.

    - ADMIN pass through automatically.
    - MANAGER limited to department (direct field or creator's department).
    - STAFF/VIEWER limited to record ownership (creator).

    The permission logs every decision and captures denied attempts at WARNING level
    for incident response.
    """

    message = "You do not have permission to perform this action."

    def _deny(self, request: Request, *, reason: str, message: str | None = None):
        if message:
            self.message = message
        user = getattr(request, "user", None)
        logger.warning(
            "rbac_denied user=%s role=%s dept=%s path=%s method=%s reason=%s",
            getattr(user, "username", None),
            getattr(user, "role", None),
            getattr(user, "department", None),
            request.path,
            request.method,
            reason,
        )
        return False

    def has_permission(self, request: Request, view: View):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return self._deny(request, reason="not_authenticated", message="Authentication credentials were not provided.")
        return self._log(request, True, "authenticated")

    def has_object_permission(self, request: Request, view: View, obj: Any):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return self._deny(request, reason="not_authenticated_object", message="Authentication credentials were not provided.")

        if user.is_admin():
            return self._log(request, True, "admin access")

        owner_field = getattr(view, "role_owner_field", "created_by")
        department_field = getattr(view, "role_department_field", None)
        owner = _resolve_attr(obj, owner_field)
        owner_department = getattr(owner, "department", None)
        department = _resolve_attr(obj, department_field) or owner_department

        if user.is_manager():
            if user.department and department and user.department != department:
                return self._deny(
                    request,
                    reason="manager_out_of_department",
                    message="Managers may only access records within their department.",
                )
            return self._log(request, True, "manager department access")

        # STAFF/VIEWER: require direct ownership
        if owner and owner == user:
            return self._log(request, True, "owner access")

        return self._deny(
            request,
            reason="owner_mismatch",
            message="You may only access records you created.",
        )