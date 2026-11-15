from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request

from app.dates import InvalidYearMonthError
from app.deps import ForbiddenOriginError
from app.services.exchange_rates import RateNotFoundError, RateServiceError
from app.services.rate_limit import RateLimitedError
from app.services.security import NotAuthenticatedError
from app.services.users import EmailTakenError, InvalidCredentialsError

import logging

logger = logging.getLogger(__name__)


ERROR_RESPONSES = {
    InvalidYearMonthError: (422, None),
    RateNotFoundError: (422, "No exchange rate is available for that currency and date."),
    RateServiceError: (502, "Couldn't fetch the exchange rate right now. Please try again later."),
    NotAuthenticatedError: (401, "Please log in."),
    # Same message for unknown email and wrong password, so emails can't be probed.
    InvalidCredentialsError: (401, "Invalid email or password."),
    EmailTakenError: (409, "An account with this email already exists."),
    ForbiddenOriginError: (403, "This request was blocked."),
    RateLimitedError: (429, None),
}


async def domain_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.warning("%s: %s", type(exc).__name__, exc)
    status_code, message = ERROR_RESPONSES[type(exc)]
    if message is None:
        message = str(exc)
    headers = None
    if isinstance(exc, RateLimitedError):
        # Standard header telling clients how many seconds to wait.
        headers = {"Retry-After": str(exc.retry_after_seconds)}
    return JSONResponse(
        status_code=status_code,
        content={"detail": message},
        headers=headers,
    )


def register_error_handlers(app: FastAPI) -> None:
    for error_class in ERROR_RESPONSES:
        app.add_exception_handler(error_class, domain_error_handler)