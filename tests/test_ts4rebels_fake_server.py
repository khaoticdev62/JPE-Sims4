from __future__ import annotations

import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import ClassVar

import requests

from jpe_sims4.ts4rebels.client import ClientConfig, TS4RebelsClient
from jpe_sims4.ts4rebels.http import HttpConfig, HttpSession


class _Handler(BaseHTTPRequestHandler):
    routes: ClassVar[dict[tuple[str, str], tuple[int, str, dict[str, str]]]] = {}

    def do_GET(self) -> None:  # noqa: N802
        status, body, headers = self.routes.get(("GET", self.path), (404, "not found", {}))
        self.send_response(status)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body.encode("utf-8"))

    def do_POST(self) -> None:  # noqa: N802
        length = int(self.headers.get("Content-Length", "0") or 0)
        _ = self.rfile.read(length)
        status, body, headers = self.routes.get(("POST", self.path), (200, "<html>ok</html>", {}))
        self.send_response(status)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body.encode("utf-8"))

    def log_message(self, format: str, *args) -> None:  # pragma: no cover
        return


def _serve(routes: dict[tuple[str, str], tuple[int, str, dict[str, str]]]) -> tuple[HTTPServer, str]:
    _Handler.routes = routes
    httpd = HTTPServer(("127.0.0.1", 0), _Handler)
    host, port = httpd.server_address
    base = f"http://{host}:{port}/"
    th = threading.Thread(target=httpd.serve_forever, daemon=True)
    th.start()
    return httpd, base


def test_client_login_flow_uses_parsed_form() -> None:
    login_page = Path("tests/ts4rebels/fixtures/login_page.html").read_text(encoding="utf-8")
    ok_page = "<html><a href='./ucp.php?mode=logout'>Logout</a></html>"
    routes = {
        ("GET", "/ucp.php?mode=login"): (200, login_page, {"Content-Type": "text/html"}),
        ("POST", "/ucp.php?mode=login"): (200, ok_page, {"Content-Type": "text/html"}),
    }

    httpd, base = _serve(routes)
    try:
        sess = requests.Session()
        http = HttpSession(config=HttpConfig(min_delay_s=0.0, max_requests_per_run=10), session=sess)
        client = TS4RebelsClient(
            config=ClientConfig(
                base_url=base,
                enable_network=True,
                allowed_hosts=("127.0.0.1",),
                allow_insecure_http=True,
            ),
            http=http,
        )
        diags = client.login(username="u", password="p")
        assert diags == []
    finally:
        httpd.shutdown()
