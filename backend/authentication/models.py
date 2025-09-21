from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models


class User(AbstractUser):
    """Custom user model extended with role-based access helpers.

    Added fields:
    - role: One of (admin, manager, accountant, staff, viewer) controlling coarse permissions.
    - department: Optional organizational grouping.
    - phone, avatar: Profile enrichment (unchanged semantics).

    Role Ladder (least → most privilege):
        viewer → staff → accountant → manager → admin

    IMPORTANT: Use the helper methods (can_edit_finances, can_approve_orders, etc.) rather than
    comparing raw role strings elsewhere. This centralizes logic and eases future adjustments.
    """

    # 1) Coarse-grained role choices for quick checks across the app
    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        MANAGER = "manager", "Manager"
        ACCOUNTANT = "accountant", "Accountant"
        STAFF = "staff", "Staff"
        VIEWER = "viewer", "Viewer"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.STAFF,
        help_text=(
            "Coarse-grained role. Order of privilege (low→high): viewer < staff < accountant < manager < admin."
        ),
        db_index=True,
    )

    # 2) Department information (simple free text)
    department = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional department name (e.g., Sales, Finance, IT).",
    )

    # 3) Basic phone string with loose validation (adjust to your locale if needed)
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[
            RegexValidator(
                regex=r"^[0-9+()\-\s]{6,20}$",
                message="Enter a valid phone number (digits, +, -, space, parentheses).",
            )
        ],
        help_text="Optional contact phone number.",
    )

    # 4) Optional avatar image; requires Pillow to be installed
    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
        help_text="Optional profile image.",
    )

    # ---------- Helper methods for role-based checks ----------
    def is_admin(self) -> bool:
        return self.role == self.Roles.ADMIN

    def is_manager(self) -> bool:
        return self.role in {self.Roles.MANAGER, self.Roles.ADMIN}

    def is_accountant(self) -> bool:
        return self.role in {self.Roles.ACCOUNTANT, self.Roles.ADMIN}

    def is_staff_role(self) -> bool:
        return self.role in {self.Roles.STAFF, self.Roles.ACCOUNTANT, self.Roles.MANAGER, self.Roles.ADMIN}

    def is_viewer(self) -> bool:
        return self.role == self.Roles.VIEWER

    def has_role(self, role: str) -> bool:
        """Generic role equality check (exact match)."""
        return self.role == role

    def has_role_at_least(self, role: str) -> bool:
        order = {
            self.Roles.VIEWER: 1,
            self.Roles.STAFF: 2,
            self.Roles.ACCOUNTANT: 3,
            self.Roles.MANAGER: 4,
            self.Roles.ADMIN: 5,
        }
        return order.get(self.role, 0) >= order.get(role, 0)

    # ---- Capability helpers ----
    def can_manage_users(self) -> bool:
        return self.is_admin()

    def can_edit_finances(self) -> bool:
        return self.is_accountant() or self.is_manager() or self.is_admin()

    def can_view_finances(self) -> bool:
        return self.can_edit_finances() or self.is_staff_role() or self.is_viewer()

    def can_approve_orders(self) -> bool:
        return self.is_manager() or self.is_admin()

    def can_edit_inventory(self) -> bool:
        return self.is_manager() or self.is_admin()

    def can_view_reports(self) -> bool:
        return any([
            self.is_admin(), self.is_manager(), self.is_accountant(), self.is_staff_role(), self.is_viewer()
        ])

    def can_create_transactions(self) -> bool:
        return any([
            self.is_staff_role(), self.is_accountant(), self.is_manager(), self.is_admin()
        ])

    def effective_capabilities(self) -> list[str]:
        caps = []
        if self.can_manage_users(): caps.append("manage_users")
        if self.can_edit_finances(): caps.append("edit_finances")
        if self.can_view_finances(): caps.append("view_finances")
        if self.can_approve_orders(): caps.append("approve_orders")
        if self.can_edit_inventory(): caps.append("edit_inventory")
        if self.can_view_reports(): caps.append("view_reports")
        if self.can_create_transactions(): caps.append("create_transactions")
        if self.is_viewer(): caps.append("readonly")
        return sorted(set(caps))

        def get_permissions(self) -> list[str]:
                """
                Return all Django permissions assigned to this user (directly or via groups).

                How it works (beginner):
                - Django permissions are strings like "app_label.codename" (e.g., "core.add_company").
                - Users can have permissions assigned directly or through Groups.
                - This method calls Django's built-in ``get_all_permissions`` and returns a sorted list
                    to make it easier to display or debug.

                Note:
                - The ``role`` field is a coarse label used for simple gates. Real, object-level access
                    decisions should rely on Django perms or custom DRF permissions.
                """
                return sorted(self.get_all_permissions())

    # Optional: integrate role with Django's permission checks in a coarse way.
    # We do NOT override the core has_perm for fine-grained perms; groups/permissions remain.
    def has_module_perms(self, app_label: str) -> bool:  # pragma: no cover - simple gate
        """
        Allow Admin to access any app; others fall back to the base behavior.
        This helps in Admin site/module-level visibility.
        """
        if self.is_admin():
            return True
        return super().has_module_perms(app_label)

    def __str__(self) -> str:  # pragma: no cover - trivial
        """Readable string representation for admin and logs."""
        return f"{self.username} ({self.get_full_name() or 'No Name'})"
