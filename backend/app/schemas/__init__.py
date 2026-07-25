"""
Mbamager Pydantic Schemas Package

This package contains Pydantic models used for input validation, request payloads,
and API response structures. It acts as the contract for our presentation layer.
"""

from app.schemas.account import AccountBase, AccountCreate, AccountResponse, AccountUpdate
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.budget import BudgetBase, BudgetCreate, BudgetResponse, BudgetUpdate
from app.schemas.common import BaseSchema, ErrorResponse, MessageResponse, PaginatedResponse, PaginationParams, SuccessResponse, TimestampSchema
from app.schemas.financial_profile import FinancialProfileBase, FinancialProfileCreate, FinancialProfileResponse, FinancialProfileUpdate, RiskTolerance
from app.schemas.transaction import TransactionBase, TransactionCreate, TransactionResponse, TransactionUpdate
from app.schemas.user import UserBase, UserCreate, UserResponse, UserUpdate
from app.schemas.sms import SMSImportRequest, SMSMessageResponse
from app.schemas.savings_goal import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse, SavingsGoalProgressResponse
from app.schemas.recurring_transaction import RecurringTransactionCreate, RecurringTransactionUpdate, RecurringTransactionResponse
from app.schemas.notification import NotificationUpdate, NotificationResponse
from app.schemas.dashboard import (
    DashboardSummary,
    NetWorthResponse,
    IncomeSummaryResponse,
    ExpenseSummaryResponse,
    AccountBalanceResponse,
    CategorySpendingResponse,
    BudgetProgressResponse,
)

__all__ = [
    "BaseSchema",
    "TimestampSchema",
    "PaginationParams",
    "PaginatedResponse",
    "MessageResponse",
    "SuccessResponse",
    "ErrorResponse",
    "LoginRequest",
    "TokenResponse",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "SMSImportRequest",
    "SMSMessageResponse",
    "RiskTolerance",
    "FinancialProfileBase",
    "FinancialProfileCreate",
    "FinancialProfileUpdate",
    "FinancialProfileResponse",
    "AccountBase",
    "AccountCreate",
    "AccountUpdate",
    "AccountResponse",
    "TransactionBase",
    "TransactionCreate",
    "TransactionUpdate",
    "TransactionResponse",
    "BudgetBase",
    "BudgetCreate",
    "BudgetUpdate",
    "BudgetResponse",
    "DashboardSummary",
    "NetWorthResponse",
    "IncomeSummaryResponse",
    "ExpenseSummaryResponse",
    "AccountBalanceResponse",
    "CategorySpendingResponse",
    "BudgetProgressResponse",
    "SavingsGoalCreate",
    "SavingsGoalUpdate",
    "SavingsGoalResponse",
    "SavingsGoalProgressResponse",
    "RecurringTransactionCreate",
    "RecurringTransactionUpdate",
    "RecurringTransactionResponse",
    "NotificationUpdate",
    "NotificationResponse",
]
