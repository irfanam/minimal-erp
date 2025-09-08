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


class StockEntry(BaseModel):
    class EntryType(models.TextChoices):
        IN = "IN", "Stock In"
        OUT = "OUT", "Stock Out"
        ADJUST = "ADJUST", "Adjustment"

    reference_number = models.CharField(max_length=50, blank=True)
    entry_type = models.CharField(max_length=10, choices=EntryType.choices)
    entry_date = models.DateField(auto_now_add=True)
    remarks = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["entry_date"]),
            models.Index(fields=["entry_type"]),
        ]
        ordering = ("-entry_date", "-id")

    def __str__(self):  # pragma: no cover
        return f"StockEntry {self.id} {self.entry_type} {self.reference_number}"  # type: ignore[str-format]

    def apply_to_inventory(self):
        for line in self.lines.all():
            inv, _ = Inventory.objects.get_or_create(product=line.product, defaults={"on_hand": Decimal("0.000"), "created_by": self.created_by, "updated_by": self.created_by})
            if self.entry_type == self.EntryType.IN:
                inv.on_hand = (inv.on_hand or Decimal('0')) + line.quantity
            elif self.entry_type == self.EntryType.OUT:
                inv.on_hand = (inv.on_hand or Decimal('0')) - line.quantity
            else:  # ADJUST uses signed quantity
                inv.on_hand = (inv.on_hand or Decimal('0')) + line.quantity
            inv.updated_by = self.updated_by
            inv.save(update_fields=["on_hand", "updated_at", "updated_by"])
            # Ledger row
            StockLedger.record_movement(
                product=line.product,
                change=line.quantity if self.entry_type != self.EntryType.OUT else -line.quantity,
                entry=self,
                rate=line.rate,
                user=self.updated_by or self.created_by,
            )


class StockEntryLine(BaseModel):
    stock_entry = models.ForeignKey(StockEntry, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="stock_entry_lines")
    quantity = models.DecimalField(max_digits=16, decimal_places=3, default=Decimal("0.000"))
    rate = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        indexes = [
            models.Index(fields=["stock_entry"]),
        ]

    def save(self, *args, **kwargs):
        self.amount = (self.quantity or Decimal('0')) * (self.rate or Decimal('0'))
        super().save(*args, **kwargs)


class StockLedger(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stock_ledger")
    stock_entry = models.ForeignKey(StockEntry, null=True, blank=True, on_delete=models.SET_NULL, related_name="ledger_rows")
    movement_date = models.DateTimeField(auto_now_add=True)
    qty_change = models.DecimalField(max_digits=16, decimal_places=3)
    balance_qty = models.DecimalField(max_digits=16, decimal_places=3, default=Decimal("0.000"))
    rate = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        ordering = ("-movement_date", "-id")
        indexes = [
            models.Index(fields=["product", "movement_date"]),
        ]

    @classmethod
    def record_movement(cls, *, product: Product, change: Decimal, entry: StockEntry | None, rate: Decimal, user):
        last = cls.objects.filter(product=product).order_by('-movement_date', '-id').first()
        prev_balance = last.balance_qty if last else Decimal('0')
        new_balance = (prev_balance + change).quantize(Decimal('0.000'))
        row = cls.objects.create(
            product=product,
            stock_entry=entry,
            qty_change=change,
            balance_qty=new_balance,
            rate=rate or Decimal('0.00'),
            created_by=user,
            updated_by=user,
        )
        return row
