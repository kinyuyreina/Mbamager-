"""
Mbamager Structured Logging Configuration
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from contextvars import ContextVar

# Context variable to store request ID for the current context
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

class StructuredFormatter(logging.Formatter):
    """
    Custom formatter that injects request_id from contextvars.
    """
    def format(self, record: logging.LogRecord) -> str:
        record.request_id = request_id_var.get()
        # Add a default duration to record if it doesn't exist
        if not hasattr(record, "duration"):
            record.duration = "-"
        return super().format(record)

def setup_logging() -> None:
    """
    Configures rotating file logs, console logs, and standard formatters.
    """
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    log_level = logging.INFO
    
    # Root Logger Setup
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Clear existing handlers to prevent duplicate logging
    root_logger.handlers = []

    # Standardized format string
    log_format = (
        "[%(asctime)s] [%(levelname)s] [ReqID: %(request_id)s] "
        "[%(name)s:%(filename)s:%(lineno)d] - %(message)s"
    )
    
    formatter = StructuredFormatter(log_format)

    # 1. Console Log Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    root_logger.addHandler(console_handler)

    # 2. Rotating File Handler (10MB max, keeping 5 backups)
    file_path = os.path.join(log_dir, "mbamager.log")
    file_handler = RotatingFileHandler(
        file_path, maxBytes=10 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)
    root_logger.addHandler(file_handler)

    # Make sure uvicorn logs propagate or are configured
    for uvicorn_logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
        ulog = logging.getLogger(uvicorn_logger_name)
        ulog.handlers = []
        ulog.propagate = True

def get_logger(name: str) -> logging.Logger:
    """
    Retrieve named logger.
    """
    return logging.getLogger(name)
