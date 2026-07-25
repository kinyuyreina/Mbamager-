"""
Mbamager SMS Regex Parsing Patterns

This module stores deterministic regular expression patterns for parsing known Cameroon
mobile money operators (MTN MoMo and Orange Money) to achieve extremely fast, free,
and local transactional ingestion before optionally falling back to Gemini.
"""

import re
from typing import Dict, Final, Pattern

# Example MTN MoMo Transfer Confirmation:
# "Transfer of 5000 FCFA to 677XXXXXX succeeded. New balance: 12500 FCFA. Fee: 50 FCFA. Transaction ID: 1982736127"
MTN_TRANSFER_PATTERN: Final[Pattern[str]] = re.compile(
    r"Transfer of (?P<amount>\d+) FCFA to (?P<recipient>\d+) succeeded\..*?New balance: (?P<balance>\d+) FCFA.*?Fee: (?P<fee>\d+) FCFA.*?Transaction ID: (?P<tx_id>\d+)",
    re.IGNORECASE
)

# Example Orange Money Transfer Confirmation:
# "You have sent 10000 FCFA to 655XXXXXX. Transaction ID: TX82738. Fee: 100 FCFA. New balance: 35000 FCFA."
ORANGE_TRANSFER_PATTERN: Final[Pattern[str]] = re.compile(
    r"You have sent (?P<amount>\d+) FCFA to (?P<recipient>\d+)\..*?Transaction ID: (?P<tx_id>\w+).*?Fee: (?P<fee>\d+) FCFA.*?New balance: (?P<balance>\d+) FCFA",
    re.IGNORECASE
)

SMS_PATTERNS: Final[Dict[str, Pattern[str]]] = {
    "MTN_TRANSFER": MTN_TRANSFER_PATTERN,
    "ORANGE_TRANSFER": ORANGE_TRANSFER_PATTERN,
}
