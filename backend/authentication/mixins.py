"""Reusable mixins for class-based views enforcing role/capability gates."""
from __future__ import annotations

from django.http import HttpRequest, HttpResponseForbidden
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
import logging

rbac_logger = logging.getLogger("auth.rbac")


class CapabilityRequiredMixin(View):
    """Generic mixin checking a user capability method before dispatch.

    Set `required_capability = "can_edit_finances"` (the name of a User method returning bool).
    """
    required_capability: str | None = None

    def dispatch(self, request: HttpRequest, *args, **kwargs):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return HttpResponseForbidden("Authentication required")
        if self.required_capability:
            checker = getattr(user, self.required_capability, None)
            allowed = bool(callable(checker) and checker())
            rbac_logger.info(
                "mixin_capability_check user=%s role=%s capability=%s allowed=%s path=%s",
                getattr(user, 'username', None), getattr(user, 'role', None),
                self.required_capability, allowed, request.path
            )
            if not allowed:
                return HttpResponseForbidden("Insufficient role capability")
        return super().dispatch(request, *args, **kwargs)


class ManagerOrAdminRequiredMixin(View):
    def dispatch(self, request: HttpRequest, *args, **kwargs):
        u = getattr(request, 'user', None)
        allowed = bool(u and u.is_authenticated and (u.is_manager() or u.is_admin()))
        rbac_logger.info(
            "mixin_manager_or_admin user=%s role=%s allowed=%s path=%s",
            getattr(u, 'username', None), getattr(u, 'role', None), allowed, request.path
        )
        if not allowed:
            return HttpResponseForbidden("Manager or admin required")
        return super().dispatch(request, *args, **kwargs)


class AdminRequiredMixin(View):
    def dispatch(self, request: HttpRequest, *args, **kwargs):
        u = getattr(request, 'user', None)
        allowed = bool(u and u.is_authenticated and u.is_admin())
        rbac_logger.info(
            "mixin_admin_required user=%s role=%s allowed=%s path=%s",
            getattr(u, 'username', None), getattr(u, 'role', None), allowed, request.path
        )
        if not allowed:
            return HttpResponseForbidden("Admin required")
        return super().dispatch(request, *args, **kwargs)


__all__ = [
    'CapabilityRequiredMixin',
    'ManagerOrAdminRequiredMixin',
    'AdminRequiredMixin',
]