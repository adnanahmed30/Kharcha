from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.config import ACCESS_TOKEN_LIFETIME, COOKIE_SECURE, SESSION_COOKIE_NAME
from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import LoginIn, RegisterIn, UserOut
from app.services.rate_limit import login_failures_by_email, login_failures_by_ip, registrations_by_ip
from app.services.security import create_access_token
from app.services.users import InvalidCredentialsError, authenticate_user, create_user

router = APIRouter(prefix = "/api/auth", tags = ["auth"])

# Shared by set and delete: a browser only removes a cookie if these match.
COOKIE_OPTIONS = {
    "httponly": True,       # JavaScript can't read it, so XSS can't steal the token
    "secure": COOKIE_SECURE,
    "samesite": "strict",   # never sent on requests started by another website
    "path": "/api",
}


def start_session(response: Response, user: User) -> None:
    response.set_cookie(
        SESSION_COOKIE_NAME,
        create_access_token(user.id),
        max_age = int(ACCESS_TOKEN_LIFETIME.total_seconds()),
        **COOKIE_OPTIONS,
    )


def client_ip(request: Request) -> str:
    # The direct caller. Behind a real reverse proxy, run uvicorn with --proxy-headers
    # (and --forwarded-allow-ips) so this becomes the visitor's address.
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model = UserOut, status_code = 201)
def register(payload: RegisterIn, request: Request, response: Response, db: Session = Depends(get_db)):
    ip = client_ip(request)
    registrations_by_ip.check(ip)
    registrations_by_ip.hit(ip)   # every attempt counts, so accounts can't be mass-created
    user = create_user(db, payload.name, payload.email, payload.password)
    start_session(response, user)
    return user


@router.post("/login", response_model = UserOut)
def login(payload: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    ip = client_ip(request)
    # Checked before the password: a locked account stays locked even if the next guess is
    # right, otherwise an attacker could keep guessing and learn the password from a success.
    login_failures_by_email.check(payload.email)
    login_failures_by_ip.check(ip)
    try:
        user = authenticate_user(db, payload.email, payload.password)
    except InvalidCredentialsError:
        login_failures_by_email.hit(payload.email)
        login_failures_by_ip.hit(ip)
        raise
    login_failures_by_email.reset(payload.email)
    start_session(response, user)
    return user


@router.post("/logout", status_code = 204)
def logout(response: Response):
    # The JWT itself stays valid until it expires; removing the cookie is what logs out this browser.
    response.delete_cookie(SESSION_COOKIE_NAME, **COOKIE_OPTIONS)


@router.get("/me", response_model = UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
