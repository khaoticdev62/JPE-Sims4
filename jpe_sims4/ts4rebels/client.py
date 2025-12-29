from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

from jpe_sims4.diagnostics import Diagnostic
import jpe_sims4.ts4rebels.diagnostics as di
from jpe_sims4.ts4rebels.html_parse import parse_forum_listing, parse_login_form, parse_topic
from jpe_sims4.ts4rebels.http import HttpConfig, HttpSession
from jpe_sims4.ts4rebels.types import PostRef, TopicRef


@dataclass(frozen=True)
class ClientConfig:
    base_url: str = "https://ts4rebels.cc/"
    enable_network: bool = False
    allowed_hosts: tuple[str, ...] = ("ts4rebels.cc",)
    allow_insecure_http: bool = False


class TS4RebelsClient:
    def __init__(self, *, config: ClientConfig | None = None, http: HttpSession | None = None) -> None:
        self.config = config or ClientConfig()
        self.base_url = self.config.base_url.rstrip("/") + "/"
        self.http = http or HttpSession(config=HttpConfig())

    def _abs(self, path_or_url: str) -> str:
        return urljoin(self.base_url, path_or_url)

    def guard_network(self) -> list[Diagnostic]:
        if not bool(self.config.enable_network):
            return [di.network_disabled(message="Network is disabled. Re-run with --enable-network (CLI) or enable it in Studio.")]

        try:
            parsed = urlparse(self.base_url)
        except Exception:
            return [di.download_blocked(message="Invalid base URL.", file_path=self.base_url)]

        scheme = str(parsed.scheme or "").lower()
        host = str(parsed.hostname or "").lower()
        if scheme != "https":
            if not (scheme == "http" and bool(self.config.allow_insecure_http)):
                return [di.tls_required(message="HTTPS is required for TS4Rebels base URL.", file_path=self.base_url)]
        allowed = {h.strip().lower() for h in (self.config.allowed_hosts or ()) if str(h or "").strip()}
        if allowed and host and host not in allowed:
            return [di.unsupported_host(message=f"Base URL host '{host}' is not allowlisted.", file_path=self.base_url)]
        return []

    def _guard_network(self) -> list[Diagnostic]:
        # Back-compat for older internal callers.
        return self.guard_network()

    def get_cookies(self) -> dict[str, str]:
        try:
            jar = getattr(self.http.session, "cookies", None)
            if jar is None:
                return {}
            return {str(c.name): str(c.value) for c in jar}  # type: ignore[union-attr]
        except Exception:
            return {}

    def set_cookies(self, cookies: dict[str, str]) -> None:
        try:
            jar = getattr(self.http.session, "cookies", None)
            if jar is None:
                return
            for k, v in (cookies or {}).items():
                jar.set(str(k), str(v))  # type: ignore[union-attr]
        except Exception:
            return

    def login(self, *, username: str, password: str) -> list[Diagnostic]:
        diags = self.guard_network()
        if diags:
            return diags
        if not username.strip() or not password:
            return [di.auth_failed(message="Username and password are required.")]
        try:
            resp = self.http.request("GET", self._abs("ucp.php?mode=login"))
            resp.raise_for_status()
        except Exception as e:
            return [di.auth_failed(message=str(e))]

        form, diags = parse_login_form(html_text=resp.text, base_url=self.base_url)
        if form is None:
            return diags or [di.parse_failed(message="Unable to parse login form.")]

        payload = dict(form.fields)
        payload.update({"username": username, "password": password, "login": "Login"})
        try:
            post = self.http.request("POST", form.action_url, data=payload)
            post.raise_for_status()
        except Exception as e:
            return [di.auth_failed(message=str(e))]

        # Heuristic: if the login form is still present, assume auth failed.
        if "name=\"password\"" in post.text and "mode=login" in post.text:
            return [di.auth_failed(message="Login failed (credentials rejected or additional verification required).")]
        return []

    def list_forum_topics(self, *, forum_id: int, page: int = 1) -> tuple[list[TopicRef], list[Diagnostic]]:
        diags = self.guard_network()
        if diags:
            return [], diags
        url = self._abs(f"viewforum.php?f={int(forum_id)}&start={max(0, (int(page) - 1) * 25)}")
        try:
            resp = self.http.request("GET", url)
            resp.raise_for_status()
        except Exception as e:
            return [], [di.download_blocked(message=str(e), file_path=url)]
        return parse_forum_listing(html_text=resp.text, base_url=self.base_url)

    def get_topic(self, *, topic_id: int, page: int = 1) -> tuple[list[PostRef], list[Diagnostic]]:
        diags = self.guard_network()
        if diags:
            return [], diags
        url = self._abs(f"viewtopic.php?t={int(topic_id)}&start={max(0, (int(page) - 1) * 10)}")
        try:
            resp = self.http.request("GET", url)
            resp.raise_for_status()
        except Exception as e:
            return [], [di.download_blocked(message=str(e), file_path=url)]
        return parse_topic(html_text=resp.text, base_url=self.base_url)
