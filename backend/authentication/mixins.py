"""Reusable mixins for class-based views enforcing role/capability gates."""
from __future__ import annotations

from django.db.models import Q
from django.http import HttpRequest, HttpResponseForbidden
from django.views import View
from rest_framework.exceptions import NotAuthenticated
import logging

rbac_logger = logging.getLogger("auth.rbac")


def scope_queryset_for_user(user, queryset, *, owner_field: str | None = "created_by", department_field: str | None = None):
    """Return a queryset filtered to the records the user is allowed to see."""
    if not user or not getattr(user, "is_authenticated", False):
        return queryset.none()

    if user.is_admin():
        return queryset

    dept_lookup = department_field
    if not dept_lookup and owner_field:
        dept_lookup = f"{owner_field}__department"

    if user.is_manager():
        filters = Q()
        if owner_field:
            filters |= Q(**{owner_field: user})
        if dept_lookup and user.department:
            filters |= Q(**{dept_lookup: user.department})
        return queryset.filter(filters).distinct() if filters else queryset.none()

    if owner_field:
        return queryset.filter(**{owner_field: user})

    return queryset.none()


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


class RoleScopedQuerysetMixin:
    """Filter queryset results according to the authenticated user's role.

    Attributes can be overridden per viewset:
        - role_owner_field: dotted path to the owning relation (default: "created_by").
        - role_department_field: dotted path to the department field; when omitted the
          creator's department is used.
    """

    role_owner_field = "created_by"
    role_department_field = None
    audit_logger = logging.getLogger("auth.rbac")

    def _get_owner_lookup(self) -> str | None:
        lookup = getattr(self, "role_owner_field", "created_by")
        return lookup if lookup else None

    def _get_department_lookup(self) -> str | None:
        department_lookup = getattr(self, "role_department_field", None)
        owner_lookup = self._get_owner_lookup()
        if department_lookup:
            return department_lookup
        if owner_lookup:
            return f"{owner_lookup}__department"
        return None

    def get_queryset(self):  # pragma: no cover - integration tested via viewsets
        base_qs = super().get_queryset()
        request = getattr(self, "request", None)
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            self.audit_logger.warning(
                "rbac_denied_query user=%s path=%s view=%s reason=not_authenticated",
                getattr(user, "username", None),
                getattr(request, "path", None),
                self.__class__.__name__,
            )
            raise NotAuthenticated()

        owner_lookup = self._get_owner_lookup()
        department_lookup = self._get_department_lookup()
        scoped = scope_queryset_for_user(
            user,
            base_qs,
            owner_field=owner_lookup,
            department_field=department_lookup,
        )

        scope = "all" if user.is_admin() else "department" if user.is_manager() else "owner"
        self.audit_logger.info(
            "rbac_access user=%s role=%s scope=%s dept=%s count=%s view=%s",
            user.username,
            user.role,
            scope,
            getattr(user, "department", None),
            scoped.count(),
            self.__class__.__name__,
        )
        return scoped


__all__ = [
    'CapabilityRequiredMixin',
    'ManagerOrAdminRequiredMixin',
    'AdminRequiredMixin',
    'RoleScopedQuerysetMixin',
    'scope_queryset_for_user',
]