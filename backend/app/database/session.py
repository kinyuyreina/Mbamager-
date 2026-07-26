"""
Mbamager Database Session Management

This module configures the SQLAlchemy engine and session factory. It provides
a dependency function to retrieve database sessions safely with auto-cleanup.
"""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Load database URL from validated application settings
DATABASE_URL: str = settings.DATABASE_URL

# SQLite requires check_same_thread=False since FastAPI can hand a connection
# across threads; this only matters for the in-memory DB used by the test suite
# (see tests/conftest.py). Postgres does not need this.
connect_args: dict = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Initialize engine and sessionmaker.
# pool_pre_ping avoids "server closed the connection unexpectedly" errors on
# Postgres connections that have gone stale (idle timeout, restart, etc.).
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=not DATABASE_URL.startswith("sqlite"),
    echo=False,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency injector for database sessions.
    Ensures sessions are properly closed after each HTTP request lifetime.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
