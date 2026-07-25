"""
Mbamager Rate Limiting - Custom InMemory Rate Limiter
"""

import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    """
    In-memory rate limiter implementing a sliding window algorithm.
    """
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.history = defaultdict(list)

    def check_rate_limit(self, request: Request) -> None:
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Filter out old requests outside the sliding window
        self.history[client_ip] = [
            t for t in self.history[client_ip] if now - t < self.window_seconds
        ]
        
        if len(self.history[client_ip]) >= self.requests_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )
            
        self.history[client_ip].append(now)

# Export standard limiters
auth_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=60)
sms_limiter = InMemoryRateLimiter(requests_limit=15, window_seconds=60)
ai_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=60)

# FastAPI Dependencies
def limit_auth(request: Request) -> None:
    auth_limiter.check_rate_limit(request)

def limit_sms(request: Request) -> None:
    sms_limiter.check_rate_limit(request)

def limit_ai(request: Request) -> None:
    ai_limiter.check_rate_limit(request)
