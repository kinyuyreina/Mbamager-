"""
Mbamager Security Utilities

This module handles secure password hashing, credential comparison via bcrypt context,
and access token (JWT) issuance. It implements strict validation schemas to safeguard
unbanked and underbanked users from account compromise.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Initialize password encryption mechanism (Bcrypt with automatic work rounds tuning)
pwd_context: CryptContext = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares a raw login password against a persistent hashed verification record.

    Args:
        plain_password: The unhashed raw input string.
        hashed_password: The cryptographically secured hash.

    Returns:
        True if the password matches; False otherwise.
    """
    return bool(pwd_context.verify(plain_password, hashed_password))

def get_password_hash(password: str) -> str:
    """
    Transforms a raw input password into a cryptographically secured bcrypt hash.

    Args:
        password: Raw password string.

    Returns:
        A secure bcrypt-hashed hex string.
    """
    return str(pwd_context.hash(password))

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a secure JSON Web Token (JWT) containing custom claims and an expiration stamp.

    Args:
        data: Key-value attributes to incorporate inside the JWT payload.
        expires_delta: Custom duration for access validation.

    Returns:
        A base64 encoded cryptographic JWT string.
    """
    to_encode: Dict[str, Any] = data.copy()
    if expires_delta:
        expire: datetime = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt: str = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
