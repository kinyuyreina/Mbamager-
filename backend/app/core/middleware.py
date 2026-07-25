"""
Mbamager Production Hardening Middleware
"""

import time
import uuid
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import request_id_var, get_logger

logger = get_logger("app.middleware")

class ProductionHardeningMiddleware(BaseHTTPMiddleware):
    """
    Middleware for Request IDs, execution timing, logging, and security headers.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Resolve Request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        token = request_id_var.set(request_id)

        # Start timer
        start_time = time.perf_counter()

        client_host = request.client.host if request.client else "unknown"
        logger.info(f"Incoming Request: {request.method} {request.url.path} from {client_host}")

        try:
            response = await call_next(request)
        except Exception as e:
            duration = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"Request Failed: {request.method} {request.url.path} - Error: {str(e)} - Duration: {duration:.2f}ms"
            )
            request_id_var.reset(token)
            raise e

        # Calculate timing
        duration = (time.perf_counter() - start_time) * 1000

        logger.info(
            f"Outgoing Response: {request.method} {request.url.path} - "
            f"Status: {response.status_code} - Duration: {duration:.2f}ms"
        )

        # Inject Headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"

        request_id_var.reset(token)
        return response

def setup_middleware(app: FastAPI) -> None:
    """
    Applies the hardening middleware to the FastAPI application.
    """
    app.add_middleware(ProductionHardeningMiddleware)
