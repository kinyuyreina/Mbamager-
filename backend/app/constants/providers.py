"""
Mbamager Support Providers Constants

This module lists all supported financial providers, mobile money network operators,
and microfinance institutions in Cameroon.
"""

from typing import Dict, Final

# Financial Providers in Cameroon
MTN_MOMO: Final[str] = "MTN Mobile Money"
ORANGE_MONEY: Final[str] = "Orange Money"
EXPRESS_UNION: Final[str] = "Express Union Mobile"
SARA_MONEY: Final[str] = "Sara Money"

PROVIDERS: Final[Dict[str, str]] = {
    "MTN": MTN_MOMO,
    "ORANGE": ORANGE_MONEY,
    "EU": EXPRESS_UNION,
    "SARA": SARA_MONEY,
}
