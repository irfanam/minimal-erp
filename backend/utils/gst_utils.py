"""
GST helpers: state code map and GST type (intra/inter-state) resolution.

Authoritative GST state codes (first two digits of GSTIN) as per Indian Census
coding conventions. Includes Union Territories and special codes.
"""
from __future__ import annotations

from dataclasses import dataclass

# Complete GST state code map (two-digit strings)
STATE_CODE_MAP: dict[str, str] = {
    "01": "Jammu & Kashmir",           # UT (post-2019)
    "02": "Himachal Pradesh",
    "03": "Punjab",
    "04": "Chandigarh",               # UT
    "05": "Uttarakhand",
    "06": "Haryana",
    "07": "Delhi (NCT)",              # UT
    "08": "Rajasthan",
    "09": "Uttar Pradesh",
    "10": "Bihar",
    "11": "Sikkim",
    "12": "Arunachal Pradesh",
    "13": "Nagaland",
    "14": "Manipur",
    "15": "Mizoram",
    "16": "Tripura",
    "17": "Meghalaya",
    "18": "Assam",
    "19": "West Bengal",
    "20": "Jharkhand",
    "21": "Odisha",
    "22": "Chhattisgarh",
    "23": "Madhya Pradesh",
    "24": "Gujarat",
    "25": "Daman & Diu",              # UT (legacy; merged into 26)
    "26": "Dadra & Nagar Haveli and Daman & Diu",  # UT
    "27": "Maharashtra",
    "28": "Andhra Pradesh (Old)",
    "29": "Karnataka",
    "30": "Goa",
    "31": "Lakshadweep",              # UT
    "32": "Kerala",
    "33": "Tamil Nadu",
    "34": "Puducherry",               # UT
    "35": "Andaman & Nicobar Islands",# UT
    "36": "Telangana",
    "37": "Andhra Pradesh",
    "38": "Ladakh",                   # UT
    "97": "Other Territory",
    "99": "Centre Jurisdiction",
}

# Union Territories (for reference; function logic relies on code equality)
UT_CODES: set[str] = {
    "01",  # Jammu & Kashmir (now UT)
    "04",  # Chandigarh
    "07",  # Delhi (NCT)
    "25",  # Daman & Diu (legacy)
    "26",  # Dadra & Nagar Haveli and Daman & Diu
    "31",  # Lakshadweep
    "34",  # Puducherry
    "35",  # Andaman & Nicobar Islands
    "38",  # Ladakh
}


def _normalize_state_code(code: int | str) -> str:
    """Normalize input to a two-digit GST state code string.

    Accepts integers (e.g., 7, 29) or strings ("7", "07", "29").
    Raises ValueError if not a known GST state code.
    """
    s = str(code).strip()
    if not s.isdigit():
        raise ValueError(f"Invalid state code '{code}': must be numeric")
    s2 = s.zfill(2)
    if s2 not in STATE_CODE_MAP:
        raise ValueError(f"Unknown GST state code '{s2}'")
    return s2


def determine_gst_type(company_state_code: int | str, customer_state_code: int | str) -> str:
    """
    Determine GST type for a supply: 'intra_state' if states match else 'inter_state'.

    - For intra-state (same code): tax splits into CGST + SGST.
    - For inter-state (different code): tax is IGST.
    - Union Territories are treated as states for code comparison.

    Args:
        company_state_code: GST state code of the supplier (int or str, e.g., 7, "07", "29").
        customer_state_code: GST state code of the customer (int or str).

    Returns:
        'intra_state' | 'inter_state'

    Examples:
        >>> determine_gst_type('29', '29')
        'intra_state'
        >>> determine_gst_type(29, 7)
        'inter_state'
        >>> determine_gst_type('07', '07')  # Delhi (UT) both sides
        'intra_state'
        >>> determine_gst_type('26', '25')  # Different UTs
        'inter_state'
    """
    comp = _normalize_state_code(company_state_code)
    cust = _normalize_state_code(customer_state_code)
    return 'intra_state' if comp == cust else 'inter_state'


__all__ = [
    'STATE_CODE_MAP',
    'UT_CODES',
    'determine_gst_type',
]
