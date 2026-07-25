"""
Mbamager Database Declarative Base

This file declares the SQLAlchemy Base class. All ORM models located in 'app/models/'
must inherit from this Base class to be registered properly for migrations.
"""

from typing import Any

from sqlalchemy.orm import DeclarativeBase, declared_attr

class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.
    Automatically generates table names based on class name in lowercase.
    """
    id: Any

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
