from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.config import ALLOWED_ORIGINS, SESSION_COOKIE_NAME
from app.database import get_db
from app.models import User
from app.services.security import NotAuthenticatedError, read_user_id


class ForbiddenOriginError(Exception):
    pass


SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def check_origin(request: Request) -> None:
    """CSRF protection, applied to every route in main.py.

    Browsers send an Origin header with every POST/PATCH/DELETE. If it names another
    website, someone is trying to use the visitor's session cookie from that site.
    Requests without Origin come from non-browser tools (curl, tests), which can't
    borrow a visitor's cookie, so they are allowed.
    """
    origin = request.headers.get("origin")
    if request.method not in SAFE_METHODS and origin is not None and origin not in ALLOWED_ORIGINS:
        raise ForbiddenOriginError(f"Blocked {request.method} from origin {origin}")


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        raise NotAuthenticatedError("No session cookie")
    user = db.get(User, read_user_id(token))
    if user is None:
        raise NotAuthenticatedError("Session refers to a user that no longer exists")
    return user
