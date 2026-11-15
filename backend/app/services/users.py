from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import User
from app.services.security import hash_password, verify_password


class EmailTakenError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


def create_user(db: Session, name: str, email: str, password: str) -> User:
    if db.scalar(select(User).where(User.email == email)) is not None:
        raise EmailTakenError("Email already registered")
    user = User(name = name, email = email, password_hash = hash_password(password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError as error:
        # Two sign-ups with the same email at the same moment: the unique index catches the second.
        db.rollback()
        raise EmailTakenError("Email already registered") from error
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email))
    # Always run one password check so unknown and known emails take about the same time.
    if not verify_password(password, user.password_hash if user else None):
        raise InvalidCredentialsError("Login failed")
    return user
