import math
import threading
import time
from collections import deque
from collections.abc import Callable

from app.config import LOGIN_FAILURES_PER_EMAIL, LOGIN_FAILURES_PER_IP, REGISTRATIONS_PER_IP


class RateLimitedError(Exception):
    def __init__(self, retry_after_seconds: int):
        minutes = math.ceil(retry_after_seconds / 60)
        unit = "minute" if minutes == 1 else "minutes"
        # This message is shown to the user (error_handler maps it with message None).
        super().__init__(f"Too many attempts. Please try again in {minutes} {unit}.")
        self.retry_after_seconds = retry_after_seconds


class RateLimiter:
    """Sliding window: allow at most `limit` hits per key within the last `window_seconds`.

    In-memory, so it only works for a single server process and resets on restart.
    """

    def __init__(self, limit: int, window_seconds: int, clock: Callable[[], float] = time.monotonic):
        self.limit = limit
        self.window_seconds = window_seconds
        self._clock = clock
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()  # FastAPI runs sync routes in a thread pool

    def _recent_hits(self, key: str, now: float) -> deque[float]:
        hits = self._hits.get(key, deque())
        while hits and hits[0] <= now - self.window_seconds:
            hits.popleft()
        if hits:
            self._hits[key] = hits
        else:
            self._hits.pop(key, None)  # don't keep empty entries around forever
        return hits

    def check(self, key: str) -> None:
        """Raise RateLimitedError if `key` has used up its attempts."""
        with self._lock:
            now = self._clock()
            hits = self._recent_hits(key, now)
            if len(hits) >= self.limit:
                # Allowed again once the oldest hit in the window expires.
                retry_after = math.ceil(hits[0] + self.window_seconds - now)
                raise RateLimitedError(max(retry_after, 1))

    def hit(self, key: str) -> None:
        with self._lock:
            now = self._clock()
            self._recent_hits(key, now)
            self._hits.setdefault(key, deque()).append(now)

    def reset(self, key: str) -> None:
        with self._lock:
            self._hits.pop(key, None)

    def clear(self) -> None:
        """Forget everything (used by tests)."""
        with self._lock:
            self._hits.clear()


login_failures_by_email = RateLimiter(*LOGIN_FAILURES_PER_EMAIL)
login_failures_by_ip = RateLimiter(*LOGIN_FAILURES_PER_IP)
registrations_by_ip = RateLimiter(*REGISTRATIONS_PER_IP)

ALL_LIMITERS = (login_failures_by_email, login_failures_by_ip, registrations_by_ip)
