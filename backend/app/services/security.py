from datetime import datetime, timezone

import jwt
from pwdlib import PasswordHash

from app.config import ACCESS_TOKEN_LIFETIME, JWT_ALGORITHM, JWT_SECRET_KEY


# Argon2 with pwdlib's recommended settings. Each hash gets its own random salt,
# stored inside the hash string together with the Argon2 parameters.
password_hasher = PasswordHash.recommended()

# Used when a login email doesn't exist, so that case takes as long as a wrong password.
_DUMMY_HASH = password_hasher.hash("dummy password used only for timing")


class NotAuthenticatedError(Exception):
    pass


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    if password_hash is None:
        password_hasher.verify(password, _DUMMY_HASH)
        return False
    return password_hasher.verify(password, password_hash)


def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user_id), "iat": now, "exp": now + ACCESS_TOKEN_LIFETIME}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def read_user_id(token: str) -> int:
    try:
        # algorithms is a fixed list so a token can't choose its own (e.g. "none").
        payload = jwt.decode(
            token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM], options={"require": ["exp", "sub"]}
        )
        return int(payload["sub"])
    except (jwt.PyJWTError, ValueError) as error:
        raise NotAuthenticatedError("Invalid or expired session token") from error
