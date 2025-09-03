from django.conf import settings
from django.db import models


class BaseModel(models.Model):
    """
    Abstract base model that adds audit fields to your models:
    - created_at / updated_at timestamps
    - created_by / updated_by user references
    """

    created_at = models.DateTimeField(auto_now_add=True)
    # When a row is first created, Django sets this to the current time once.

    updated_at = models.DateTimeField(auto_now=True)
    # Every time the row is saved, Django updates this to the current time.

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_%(class)ss',
        help_text='User who initially created this record.'
    )
    # Optional link to the user who created the record. If the user is deleted,
    # keep the record and set this field to NULL (SET_NULL).

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_%(class)ss',
        help_text='User who last updated this record.'
    )
    # Optional link to the user who last updated the record.

    class Meta:
        abstract = True  # Django will not create a database table for this model.
        ordering = ('-created_at',)  # Newest first by default when querying.
        get_latest_by = 'created_at'

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        # Generic readable representation: ModelName(pk)
        return f"{self.__class__.__name__}({self.pk})"
