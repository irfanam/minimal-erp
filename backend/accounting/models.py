from decimal import Decimal

from django.db import models
from django.utils import timezone

from core.models import BaseModel
from sales.models import Customer
from inventory.models import Product
from utils.gst_calculator import calculate_gst_breakdown


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
    invoice_date = models.DateField(default=timezone.localdate)
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


class Invoice(BaseModel):
    """
    Sales invoice with line items and GST totals.

    Totals are computed from InvoiceLine rows via calculate_totals().
    """

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SENT = "SENT", "Sent"
        PARTIAL = "PARTIAL", "Partially Paid"
        PAID = "PAID", "Paid"
        OVERDUE = "OVERDUE", "Overdue"
        CANCELLED = "CANCELLED", "Cancelled"

    class GSTType(models.TextChoices):
        INTRA = "intra_state", "Intra State (CGST+SGST)"
        INTER = "inter_state", "Inter State (IGST)"

    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, related_name="invoices_new")
    sales_order = models.ForeignKey('sales.SalesOrder', null=True, blank=True, on_delete=models.SET_NULL, related_name='invoices')
    invoice_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    gst_type = models.CharField(max_length=12, choices=GSTType.choices, default=GSTType.INTRA)
    currency_code = models.CharField(max_length=3, default="INR")

    # Totals
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    cgst_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    sgst_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    igst_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    total_tax = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    grand_total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    # Payment tracking
    paid_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    balance_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    payment_status = models.CharField(
        max_length=10,
        choices=[
            ("UNPAID", "Unpaid"),
            ("PARTIAL", "Partially Paid"),
            ("PAID", "Paid"),
            ("OVERDUE", "Overdue"),
        ],
        default="UNPAID",
    )
    pdf_generated = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["invoice_number"]),
            models.Index(fields=["invoice_date"]),
            models.Index(fields=["customer"]),
        ]
        ordering = ("-invoice_date", "-id")

    def __str__(self):  # pragma: no cover
        return f"Invoice {self.invoice_number} - {self.customer}"

    def calculate_totals(self, save: bool = True) -> None:
        """
        Compute subtotal, tax components, and grand total from lines.

        This uses utils.calculate_gst_breakdown for each line based on
        the invoice's gst_type and line gst_rate.
        """
        subtotal = Decimal("0.00")
        cgst = Decimal("0.00")
        sgst = Decimal("0.00")
        igst = Decimal("0.00")

        for line in self.lines.all():
            line_subtotal = (line.quantity or Decimal("0")) * (line.unit_price or Decimal("0"))
            subtotal += line_subtotal
            br = calculate_gst_breakdown(line_subtotal, line.gst_rate or Decimal("0"), self.gst_type)
            cgst += br['cgst']
            sgst += br['sgst']
            igst += br['igst']

        total_tax = cgst + sgst + igst
        grand = subtotal + total_tax

        # Persist rounded values
        self.subtotal = subtotal.quantize(Decimal('0.01'))
        self.cgst_amount = cgst.quantize(Decimal('0.01'))
        self.sgst_amount = sgst.quantize(Decimal('0.01'))
        self.igst_amount = igst.quantize(Decimal('0.01'))
        self.total_tax = total_tax.quantize(Decimal('0.01'))
        self.grand_total = grand.quantize(Decimal('0.01'))
        # Update balance & payment status if already payments exist
        self.balance_amount = (self.grand_total - (self.paid_amount or Decimal('0.00'))).quantize(Decimal('0.01'))
        self._update_payment_status(save=False)
        if save:
            self.save(update_fields=[
                'subtotal', 'cgst_amount', 'sgst_amount', 'igst_amount', 'total_tax', 'grand_total', 'balance_amount', 'payment_status', 'updated_at'
            ])

    def _update_payment_status(self, save: bool = True):
        """Derive payment_status (and possibly status) from amounts and due date."""
        from django.utils import timezone
        due = self.due_date
        paid = self.paid_amount or Decimal('0.00')
        grand = self.grand_total or Decimal('0.00')
        balance = grand - paid
        now_date = timezone.localdate()
        if grand <= Decimal('0.00'):
            ps = 'UNPAID'
        elif balance <= Decimal('0.00'):
            ps = 'PAID'
        elif due and due < now_date:
            ps = 'OVERDUE'
        elif paid > Decimal('0.00'):
            ps = 'PARTIAL'
        else:
            ps = 'UNPAID'
        self.payment_status = ps
        # Mirror to status for overdue/paid if appropriate unless cancelled
        if self.status not in {self.Status.CANCELLED}:
            if ps == 'PAID':
                self.status = self.Status.PAID
            elif ps == 'OVERDUE':
                self.status = self.Status.OVERDUE
            elif ps == 'PARTIAL' and self.status == self.Status.DRAFT:
                self.status = self.Status.PARTIAL
        if save:
            self.save(update_fields=['payment_status', 'status', 'updated_at'])

    def apply_payment(self, amount: Decimal, save: bool = True):
        amount = (amount or Decimal('0')).quantize(Decimal('0.01'))
        if amount <= 0:
            return
        self.paid_amount = (self.paid_amount or Decimal('0.00')) + amount
        if self.paid_amount > self.grand_total:
            self.paid_amount = self.grand_total
        self.balance_amount = (self.grand_total - self.paid_amount).quantize(Decimal('0.01'))
        self._update_payment_status(save=False)
        if save:
            self.save(update_fields=['paid_amount', 'balance_amount', 'payment_status', 'status', 'updated_at'])

    @property
    def amount_in_words(self):  # pragma: no cover
        from utils.gst_utils import convert_amount_to_words
        return convert_amount_to_words(self.grand_total)


class InvoiceLine(BaseModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoice_lines")
    description = models.CharField(max_length=255, blank=True)
    quantity = models.DecimalField(max_digits=14, decimal_places=3, default=Decimal("1.000"))
    unit = models.CharField(max_length=10, default="PCS")
    unit_price = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
    hsn_code = models.CharField(max_length=20, blank=True)
    line_total = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))

    class Meta:
        indexes = [
            models.Index(fields=["invoice"]),
        ]

    def __str__(self):  # pragma: no cover
        return f"Line {self.id} of {self.invoice_id}"

    def save(self, *args, **kwargs):
        # Derive hsn_code from product if blank
        if self.product and not self.hsn_code:
            self.hsn_code = self.product.hsn_code or ''
        self.line_total = (self.quantity or Decimal('0')) * (self.unit_price or Decimal('0'))
        super().save(*args, **kwargs)
        # Recalculate parent invoice totals
        if self.invoice_id:
            self.invoice.calculate_totals(save=True)
