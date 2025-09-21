"""Signals for auditing role changes and capturing capability snapshots."""
from __future__ import annotations

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.conf import settings
import logging

from .models import User

logger = logging.getLogger("auth.rbac")


@receiver(pre_save, sender=User)
def audit_role_change(sender, instance: User, **kwargs):  # pragma: no cover (logging only)
    if not instance.pk:
        return
    try:
        old = User.objects.get(pk=instance.pk)
    except User.DoesNotExist:
        return
    if old.role != instance.role:
        logger.warning(
            "role_change user=%s from=%s to=%s department=%s",
            instance.username,
            old.role,
            instance.role,
            instance.department,
        )


@receiver(post_save, sender=User)
def audit_capabilities_snapshot(sender, instance: User, created: bool, **kwargs):  # pragma: no cover
    # Log snapshot after save for observability.
    logger.info(
        "capabilities_snapshot user=%s role=%s caps=%s created=%s",
        instance.username,
        instance.role,
        ",".join(instance.effective_capabilities()),
        created,
    )