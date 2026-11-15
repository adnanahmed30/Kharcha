from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request

from app.dates import InvalidYearMonthError
from app.services.exchange_rates import RateNotFoundError, RateServiceError

import logging

logger = logging.getLogger(__name__)


ERROR_RESPONSES = {
    InvalidYearMonthError: (422, None),
    RateNotFoundError: (422, "No exchange rate is available for that currency and date."),
    RateServiceError: (502, "Couldn't fetch the exchange rate right now. Please try again later."),
}


async def domain_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.warning("%s: %s", type(exc).__name__, exc)
    status_code, message = ERROR_RESPONSES[type(exc)]
    if message is None:
        message = str(exc)
    return JSONResponse(
        status_code=status_code,
        content={"detail": message},
    )


def register_error_handlers(app: FastAPI) -> None:
    for error_class in ERROR_RESPONSES:
        app.add_exception_handler(error_class, domain_error_handler)