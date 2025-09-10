from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models


class User(AbstractUser):
    """
    Custom user model for authentication and profile.

    Extends Django's AbstractUser and adds:
    - role: Coarse-grained role for feature gating (admin/manager/staff)
    - department: Free-text department name
    - phone: Contact phone number (basic validation)
    - avatar: Optional profile image

    All custom fields are included in the UserProfileSerializer for API responses.
    """

    # 1) Coarse-grained role choices for quick checks across the app
    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        MANAGER = "manager", "Manager"
        STAFF = "staff", "Staff"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.STAFF,
        help_text=(
            "Coarse-grained role: admin (highest), manager, staff. "
            "Use this for quick feature gating."
        ),
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
        """
        Check whether this account has the highest coarse-grained role.

        Returns:
            bool: True if role == ADMIN, otherwise False.

        Beginner tips:
        - Use this for high-level feature gates (e.g., can manage settings?).
        - This does NOT replace Django's fine-grained permissions.
        """
        return self.role == self.Roles.ADMIN

    def is_manager(self) -> bool:
        """
        Check whether this account has at least Manager privileges.

        Returns:
            bool: True if role is MANAGER or ADMIN, otherwise False.

        Beginner tips:
        - Useful for mid-tier access like approving documents.
        - Admins also pass this check since they outrank managers.
        """
        return self.role in {self.Roles.MANAGER, self.Roles.ADMIN}

    def is_staff_role(self) -> bool:
        """Return True if the user is at least Staff (any role)."""
        return self.role in {self.Roles.STAFF, self.Roles.MANAGER, self.Roles.ADMIN}

    def has_role(self, role: str) -> bool:
        """Generic role equality check (exact match)."""
        return self.role == role

    def has_role_at_least(self, role: str) -> bool:
        """
        Check if current role is >= the given role by a simple precedence order:
        Admin > Manager > Staff
        """
        order = {self.Roles.STAFF: 1, self.Roles.MANAGER: 2, self.Roles.ADMIN: 3}
        return order.get(self.role, 0) >= order.get(role, 0)

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
