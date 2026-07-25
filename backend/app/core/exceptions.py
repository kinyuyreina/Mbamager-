"""
Mbamager Global Exception Handlers
"""

import datetime
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "message": str(exc),
                "error_code": "VALUE_ERROR",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "path": request.url.path,
            }
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        error_code = "HTTP_EXCEPTION"
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = "UNAUTHORIZED"
        elif exc.status_code == status.HTTP_403_FORBIDDEN:
            error_code = "FORBIDDEN"
        elif exc.status_code == status.HTTP_404_NOT_FOUND:
            error_code = "NOT_FOUND"
        elif exc.status_code == status.HTTP_400_BAD_REQUEST:
            error_code = "BAD_REQUEST"
        
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail,
                "error_code": error_code,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "path": request.url.path,
            },
            headers=getattr(exc, "headers", None)
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        messages = []
        for err in errors:
            loc = " -> ".join(str(l) for l in err.get("loc", []))
            msg = err.get("msg", "Validation error")
            messages.append(f"{loc}: {msg}")
        
        message = "; ".join(messages) if messages else "Request validation failed"
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": message,
                "error_code": "VALIDATION_ERROR",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "path": request.url.path,
            }
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error_code = "DATABASE_ERROR"
        message = "A database error occurred."
        
        if isinstance(exc, IntegrityError):
            status_code = status.HTTP_400_BAD_REQUEST
            error_code = "INTEGRITY_ERROR"
            message = "Database integrity violation (e.g., duplicate unique constraint or foreign key mismatch)."
        
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "message": message,
                "error_code": error_code,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "path": request.url.path,
            }
        )

    @app.exception_handler(Exception)
    async def unexpected_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": f"An unexpected error occurred: {str(exc)}",
                "error_code": "INTERNAL_SERVER_ERROR",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "path": request.url.path,
            }
        )
