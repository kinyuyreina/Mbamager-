"""
Mbamager Transaction Categories Constants

This file defines static standard financial and transactional categories suitable
for Cameroonian unbanked and underbanked users. It includes income streams, essential
daily spending classes, community savings (Njangi), and operator commission fees.
"""

from typing import Final, List

# Income Categories
INCOME_SALARY: Final[str] = "Salary / Wages"
INCOME_BUSINESS: Final[str] = "Business / Trade"
INCOME_REMITTANCE: Final[str] = "Remittance / Support"

# Expense Categories
EXPENSE_FOOD: Final[str] = "Food & Groceries"
EXPENSE_UTILITIES: Final[str] = "Electricity / Water / Internet"
EXPENSE_HEALTH: Final[str] = "Medical & Health"
EXPENSE_EDUCATION: Final[str] = "School Fees / Education"
EXPENSE_TRANSPORT: Final[str] = "Taxi / Moto / Transport"
EXPENSE_COMMISSION: Final[str] = "Operator Cashout Fees"

# Financial Categories
SAVINGS: Final[str] = "Njangi / Savings Club"
INVESTMENT: Final[str] = "Agriculture / Business Growth"

CATEGORIES: Final[List[str]] = [
    INCOME_SALARY,
    INCOME_BUSINESS,
    INCOME_REMITTANCE,
    EXPENSE_FOOD,
    EXPENSE_UTILITIES,
    EXPENSE_HEALTH,
    EXPENSE_EDUCATION,
    EXPENSE_TRANSPORT,
    EXPENSE_COMMISSION,
    SAVINGS,
    INVESTMENT,
]
