from django.conf import settings
from django.db import models
from django.core.validators import RegexValidator

# ==========================
# Company Model
# ==========================

# Validator for Indian GSTIN (15 chars: 2-digit state, 10-char PAN, 1 entity, 1 'Z', 1 checksum)
GSTIN_REGEX = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
validate_gstin = RegexValidator(
    regex=GSTIN_REGEX,
    message=(
        'Enter a valid GSTIN (15 characters). Example format: 22AAAAA0000A1Z5.'
    ),
)

# Validator for Indian PIN code (6 digits, cannot start with 0)
PINCODE_REGEX = r'^[1-9][0-9]{5}$'
validate_pincode = RegexValidator(
    regex=PINCODE_REGEX,
    message='Enter a valid 6-digit Indian PIN code (e.g., 560001).',
)


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


class Company(BaseModel):
    """
    Company master record used across ERP modules for issuing invoices, orders, and compliance.
    """

    # Legal/trade name shown on documents like invoices and orders
    name = models.CharField(max_length=255, unique=True)

    # Head office or registered address (single line; extend to multiple lines if needed)
    address = models.CharField(max_length=255, blank=True)

    # City/town for correspondence and tax region determination
    city = models.CharField(max_length=100, blank=True)

    # State/Union Territory (use standardized names for reporting)
    state = models.CharField(max_length=100, blank=True)

    # Country (ISO names recommended for multi-country ops)
    country = models.CharField(max_length=100, blank=True, default='India')

    # Indian postal index number; used for shipping and tax jurisdiction
    pincode = models.CharField(max_length=6, blank=True, validators=[validate_pincode])

    # Goods and Services Tax Identification Number for statutory compliance
    gstin = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        unique=True,
        validators=[validate_gstin],
        help_text='Government-issued GST number (India).'
    )

    # Primary business contact number
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text='Company phone number for customers/suppliers.'
    )

    # Official email for communications and invoicing
    email = models.EmailField(blank=True)

    # Company logo printed on reports and invoices
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)

    # Public website for reference on documents
    website = models.URLField(blank=True)

    class Meta:
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        ordering = ('name',)  # List companies alphabetically

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.name

    def save(self, *args, **kwargs):
        # Normalize GSTIN to uppercase for consistent storage/validation
        if self.gstin:
            self.gstin = self.gstin.upper()
        super().save(*args, **kwargs)
