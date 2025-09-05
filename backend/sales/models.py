from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator, EmailValidator

from core.models import BaseModel


# Validator for Indian GSTIN (15 chars: 2-digit state, 10-char PAN, 1 entity, 1 'Z', 1 checksum)
GSTIN_REGEX = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
validate_gstin = RegexValidator(
    regex=GSTIN_REGEX,
    message='Enter a valid GSTIN (15 characters), e.g., 22AAAAA0000A1Z5.',
)

# Validator for Indian state code (two digits). Example: 29 = Karnataka
STATE_CODE_REGEX = r'^[0-9]{2}$'
validate_state_code = RegexValidator(
    regex=STATE_CODE_REGEX,
    message='Enter a valid 2-digit state code (e.g., 29 for Karnataka).',
)

# Basic phone format (digits, space, +, -, parentheses)
validate_phone = RegexValidator(
    regex=r"^[0-9+()\-\s]{6,20}$",
    message="Enter a valid phone number (digits, +, -, space, parentheses).",
)


class Customer(BaseModel):
    """
    Customer master used by Sales, Invoicing, and Payments.

    Business purpose of key fields:
    - customer_code: Short unique identifier used on orders/invoices; easy to search and reference.
    - name: Legal/trade name shown on documents and reports.
    - contact_person: Primary contact for coordination and support.
    - phone, email: Communication channels for confirmations and notifications.
    - billing_address: Address used for invoicing and taxation.
    - shipping_address: Address for deliveries (can differ from billing).
    - gstin: Mandatory for B2B GST compliance (India), printed on invoices.
    - state_code: Two-digit GST state code, impacts tax calculations (intra/inter-state).
    - credit_limit: Allowed outstanding amount; useful for blocking new orders over limit.
    - payment_terms: Number of days to due date (e.g., 30 = Net 30).
    - is_active: Toggle to soft-deactivate a customer without deleting history.
    """

    customer_code = models.CharField(
        max_length=32,
        unique=True,
        help_text="Unique short code for internal reference (e.g., CUST-001).",
    )

    name = models.CharField(
        max_length=255,
        help_text="Customer legal/trade name shown on documents.",
    )

    contact_person = models.CharField(
        max_length=100,
        blank=True,
        help_text="Primary contact person for coordination.",
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[validate_phone],
        help_text="Customer phone number.",
    )

    email = models.EmailField(
        blank=True,
        validators=[EmailValidator()],
        help_text="Primary email address for communication.",
    )

    billing_address = models.TextField(
        blank=True,
        help_text="Billing address used on invoices.",
    )

    shipping_address = models.TextField(
        blank=True,
        help_text="Shipping/delivery address.",
    )

    gstin = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[validate_gstin],
        help_text="GST identification number (India).",
    )

    state_code = models.CharField(
        max_length=2,
        blank=True,
        validators=[validate_state_code],
        help_text="Two-digit GST state code (e.g., 29 = Karnataka).",
    )

    credit_limit = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Maximum allowed outstanding balance.",
    )

    payment_terms = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(3650)],
        help_text="Payment terms in days (e.g., 30 = Net 30).",
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Uncheck to deactivate without deleting records.",
    )

    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"
        ordering = ("name",)
        indexes = [
            models.Index(fields=["customer_code"]),
            models.Index(fields=["name"]),
        ]

    def __str__(self) -> str:  # pragma: no cover - simple
        """
        Easy-to-read label used in admin and dropdowns.
        Example: "CUST-001 - Acme Corp"
        """
        return f"{self.customer_code} - {self.name}"

    def clean(self):
        """
        Model-level validation/normalization.
        - Normalize GSTIN to uppercase (spec requires uppercase letters)
        - Optional: strip whitespace from code and names
        """
        super().clean()
        if self.customer_code:
            self.customer_code = self.customer_code.strip()
        if self.name:
            self.name = self.name.strip()
        if self.gstin:
            self.gstin = self.gstin.upper().strip()

    def save(self, *args, **kwargs):
        # Ensure clean() runs before save when saving programmatically
        self.full_clean(exclude=None)
        return super().save(*args, **kwargs)
