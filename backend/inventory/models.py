from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.db import models

from core.models import BaseModel


class Product(BaseModel):
    """Simple product master used across inventory and sales."""

    sku = models.CharField(
        max_length=64,
        unique=True,
        help_text="Unique SKU or code, e.g., PRD-001",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    hsn_code = models.CharField(max_length=20, blank=True, help_text="HSN/SAC code if applicable")

    class Unit(models.TextChoices):
        PCS = "PCS", "Pieces"
        KG = "KG", "Kilogram"
        LTR = "LTR", "Litre"
        MTR = "MTR", "Metre"
        BOX = "BOX", "Box"

    unit = models.CharField(max_length=10, choices=Unit.choices, default=Unit.PCS)

    cost_price = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"),
                                     validators=[MinValueValidator(Decimal("0.00"))])
    selling_price = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"),
                                        validators=[MinValueValidator(Decimal("0.00"))])
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"),
                                   validators=[MinValueValidator(Decimal("0.00")), MaxValueValidator(Decimal("100.00"))])
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        indexes = [
            models.Index(fields=["sku"]),
            models.Index(fields=["name"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.sku} - {self.name}"


class Inventory(BaseModel):
    """
    Simple inventory snapshot per product.
    For multi-warehouse support, extend this with a Warehouse FK later.
    """

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="inventory")
    on_hand = models.DecimalField(max_digits=16, decimal_places=3, default=Decimal("0.000"))
    reorder_level = models.DecimalField(max_digits=16, decimal_places=3, default=Decimal("0.000"))

    class Meta:
        unique_together = ("product",)
        indexes = [
            models.Index(fields=["product"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Stock {self.product.sku}: {self.on_hand} {self.product.unit}"
