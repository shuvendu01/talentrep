"""
API Key Middleware for TalentHub
Validates API key for all requests
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os
import logging

logger = logging.getLogger(__name__)

class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate API key for all requests.
    API key should be in header: X-API-Key
    """
    
    def __init__(self, app, excluded_paths: list = None):
        super().__init__(app)
        self.api_key = os.getenv("API_KEY")
        self.excluded_paths = excluded_paths or [
            "/api/docs",
            "/api/redoc",
            "/api/openapi.json",
            "/docs",
            "/redoc",
            "/openapi.json"
        ]
        
        if not self.api_key:
            logger.warning("⚠️  API_KEY not set in environment variables!")
    
    async def dispatch(self, request: Request, call_next):
        # Skip API key check for documentation endpoints
        if request.url.path in self.excluded_paths:
            return await call_next(request)
        
        # Skip if API_KEY is not configured (development mode)
        if not self.api_key:
            logger.debug(f"⚠️  API key validation skipped for {request.url.path} (API_KEY not configured)")
            return await call_next(request)
        
        # Get API key from header
        api_key_header = request.headers.get("X-API-Key") or request.headers.get("x-api-key")
        
        if not api_key_header:
            logger.warning(f"❌ Missing API key for {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "detail": "API key is required. Please include X-API-Key header.",
                    "error_code": "MISSING_API_KEY"
                }
            )
        
        if api_key_header != self.api_key:
            logger.warning(f"❌ Invalid API key attempt for {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "detail": "Invalid API key provided.",
                    "error_code": "INVALID_API_KEY"
                }
            )
        
        # API key valid, proceed
        return await call_next(request)
