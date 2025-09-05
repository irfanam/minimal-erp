from django.db import models
from django.utils import timezone

from core.models import BaseModel
from sales.models import Customer


class ARInvoice(BaseModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ISSUED = "ISSUED", "Issued"
        PARTIAL = "PARTIAL", "Partially Paid"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, related_name="invoices")
    invoice_number = models.CharField(max_length=50, blank=True, help_text="Optional invoice number")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    invoice_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    currency_code = models.CharField(max_length=3, default="INR")
    grand_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        verbose_name = "AR Invoice"
        verbose_name_plural = "AR Invoices"
        indexes = [
            models.Index(fields=["customer", "status"]),
            models.Index(fields=["invoice_date"]),
        ]

    def __str__(self):
        return f"ARInvoice {self.id} - {self.customer} ({self.grand_total} {self.currency_code})"


class ARPayment(BaseModel):
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, related_name="payments")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    currency_code = models.CharField(max_length=3, default="INR")
    paid_at = models.DateTimeField(default=timezone.now)
    method = models.CharField(max_length=20, default="OTHER")

    class Meta:
        verbose_name = "AR Payment"
        verbose_name_plural = "AR Payments"
        indexes = [
            models.Index(fields=["customer", "paid_at"]),
        ]

    def __str__(self):
        return f"ARPayment {self.id} - {self.customer} ({self.amount} {self.currency_code})"


class ARPaymentAllocation(models.Model):
    payment = models.ForeignKey(ARPayment, on_delete=models.CASCADE, related_name="allocations")
    invoice = models.ForeignKey(ARInvoice, on_delete=models.RESTRICT, related_name="allocations")
    amount_applied = models.DecimalField(max_digits=14, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("payment", "invoice")
        indexes = [
            models.Index(fields=["invoice"]),
            models.Index(fields=["payment"]),
        ]

    def __str__(self):
        return f"Allocation {self.id}: {self.amount_applied} to invoice {self.invoice_id}"
