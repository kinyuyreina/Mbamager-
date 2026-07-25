"""
Mbamager Currency Constants

This module sets default currencies and metadata, with a primary focus
on Central African CFA Franc (XAF).
"""

from typing import Final

PRIMARY_CURRENCY: Final[str] = "XAF"
PRIMARY_CURRENCY_SYMBOL: Final[str] = "FCFA"

CURRENCY_DECIMAL_PLACES: Final[int] = 0  # CFA Franc is traditionally integer-only
