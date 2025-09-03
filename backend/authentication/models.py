from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    We add:
    - role: simple role field for coarse-grained authorization
    - department: free-text department name
    - phone: normalized phone string (basic validation)
    - avatar: optional user profile image

    Notes:
    - Keep Django's built-in permissions/groups working as-is.
    - Provide helper methods to check permissions based on role.
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
        """Return True if the user is an Admin (highest role)."""
        return self.role == self.Roles.ADMIN

    def is_manager(self) -> bool:
        """Return True if the user is a Manager or higher (Admin)."""
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
