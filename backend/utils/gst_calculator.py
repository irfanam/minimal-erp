from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP, getcontext
from typing import Literal, Optional

# Increase global precision for decimal arithmetic
getcontext().prec = 28

TaxMode = Literal['exclusive', 'inclusive']


@dataclass(frozen=True)
class GSTBreakup:
    taxable_value: Decimal
    cgst_rate: Decimal
    sgst_rate: Decimal
    igst_rate: Decimal
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    total_tax: Decimal
    total_amount: Decimal


def _q(value: str | float | int | Decimal) -> Decimal:
    """Coerce inputs to Decimal conveniently."""
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def _round_money(value: Decimal) -> Decimal:
    """Round to 2 decimal places using bankers' rounding (half-up)."""
    return value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def calculate_gst(
    base_amount: str | float | int | Decimal,
    gst_rate: str | float | int | Decimal,
    *,
    interstate: bool = False,
    mode: TaxMode = 'exclusive',
) -> GSTBreakup:
    """
    Calculate GST breakup for a line item.

    Args:
        base_amount: Amount either before tax (exclusive) or total (inclusive).
        gst_rate: Total GST percentage (e.g., 18 for 18%).
        interstate: If True uses IGST, else split equally into CGST+SGST.
        mode: 'exclusive' (tax on top) or 'inclusive' (tax included in amount).

    Returns:
        GSTBreakup with rounded monetary values.

    Examples:
        - Exclusive intra-state, 18% on 1000:
          taxable=1000.00, CGST=90.00, SGST=90.00, total=1180.00
        - Inclusive inter-state, 18% on 1180:
          taxable=1000.00, IGST=180.00, total=1180.00
    """
    amount = _q(base_amount)
    rate = _q(gst_rate)

    if rate < 0 or rate > 100:
        raise ValueError("gst_rate must be between 0 and 100")

    if mode == 'exclusive':
        taxable = amount
    elif mode == 'inclusive':
        divisor = (Decimal('1') + rate / Decimal('100'))
        taxable = amount / divisor
    else:
        raise ValueError("mode must be 'exclusive' or 'inclusive'")

    total_tax = taxable * rate / Decimal('100')

    if interstate:
        cgst_rate = Decimal('0')
        sgst_rate = Decimal('0')
        igst_rate = rate
        cgst_amount = Decimal('0')
        sgst_amount = Decimal('0')
        igst_amount = total_tax
    else:
        cgst_rate = rate / Decimal('2')
        sgst_rate = rate / Decimal('2')
        igst_rate = Decimal('0')
        cgst_amount = total_tax / Decimal('2')
        sgst_amount = total_tax / Decimal('2')
        igst_amount = Decimal('0')

    # Round display amounts
    taxable_r = _round_money(taxable)
    cgst_r = _round_money(cgst_amount)
    sgst_r = _round_money(sgst_amount)
    igst_r = _round_money(igst_amount)
    total_tax_r = _round_money(cgst_r + sgst_r + igst_r)

    if mode == 'exclusive':
        total_amount = taxable_r + total_tax_r
    else:
        total_amount = _round_money(amount)

    return GSTBreakup(
        taxable_value=taxable_r,
        cgst_rate=_round_money(cgst_rate),
        sgst_rate=_round_money(sgst_rate),
        igst_rate=_round_money(igst_rate),
        cgst_amount=cgst_r,
        sgst_amount=sgst_r,
        igst_amount=igst_r,
        total_tax=total_tax_r,
        total_amount=total_amount,
    )


__all__ = [
    'GSTBreakup',
    'calculate_gst',
]
