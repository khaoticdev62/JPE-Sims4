from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import requests


@dataclass(frozen=True)
class HttpConfig:
    connect_timeout_s: float = 10.0
    read_timeout_s: float = 30.0
    total_timeout_s: float = 60.0
    min_delay_s: float = 1.0
    max_requests_per_run: int = 200
    user_agent: str = "JPE-Studio/ts4rebels-sync"


class RateLimiter:
    def __init__(self, *, min_delay_s: float) -> None:
        self._min_delay_s = float(min_delay_s)
        self._last = 0.0

    def wait(self) -> None:
        if self._min_delay_s <= 0:
            return
        now = time.monotonic()
        delta = now - self._last
        if delta < self._min_delay_s:
            time.sleep(self._min_delay_s - delta)
        self._last = time.monotonic()


class HttpSession:
    def __init__(self, *, config: HttpConfig | None = None, session: requests.Session | None = None) -> None:
        self.config = config or HttpConfig()
        self.session = session or requests.Session()
        self._limiter = RateLimiter(min_delay_s=self.config.min_delay_s)
        self._count = 0

    def request(self, method: str, url: str, **kwargs: Any) -> requests.Response:
        self._count += 1
        if self._count > int(self.config.max_requests_per_run):
            raise RuntimeError("Request limit exceeded.")
        self._limiter.wait()

        headers = dict(kwargs.pop("headers", {}) or {})
        headers.setdefault("User-Agent", self.config.user_agent)
        kwargs["headers"] = headers

        timeout = kwargs.pop("timeout", None)
        if timeout is None:
            timeout = (self.config.connect_timeout_s, self.config.read_timeout_s)
        kwargs["timeout"] = timeout

        # Keep redirects enabled for phpBB login flow, but disallow cross-scheme downgrade in higher layers.
        return self.session.request(method=method, url=url, **kwargs)

