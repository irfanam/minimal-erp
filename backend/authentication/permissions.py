"""Custom DRF permission classes for role-based access control (RBAC).

Each permission logs its evaluation to the 'auth.rbac' logger for audit trails.
Use these in views or viewsets via `permission_classes`.
"""
from __future__ import annotations

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import View
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
]