from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import ClassVar
from zipfile import ZipFile

import cli


class _BinHandler(BaseHTTPRequestHandler):
    routes: ClassVar[dict[tuple[str, str], tuple[int, bytes, dict[str, str]]]] = {}

    def do_GET(self) -> None:  # noqa: N802
        status, body, headers = self.routes.get(("GET", self.path), (404, b"not found", {}))
        self.send_response(status)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args) -> None:  # pragma: no cover
        return


def _serve(routes: dict[tuple[str, str], tuple[int, bytes, dict[str, str]]]) -> tuple[HTTPServer, str]:
    _BinHandler.routes = routes
    httpd = HTTPServer(("127.0.0.1", 0), _BinHandler)
    host, port = httpd.server_address
    base = f"http://{host}:{port}/"
    th = threading.Thread(target=httpd.serve_forever, daemon=True)
    th.start()
    return httpd, base


def test_cli_ts4rebels_download_import_localhost(tmp_path: Path, capsys) -> None:
    z = tmp_path / "payload.zip"
    with ZipFile(z, "w") as zf:
        zf.writestr("mod/readme.txt", "hello")
    data = z.read_bytes()

    httpd, base = _serve({("GET", "/files/mod.zip"): (200, data, {"Content-Type": "application/zip"})})
    try:
        downloads = tmp_path / "dl"
        imports = tmp_path / "imports"
        code = cli.main(
            [
                "ts4rebels",
                "--enable-network",
                "--base-url",
                base,
                "--allowed-hosts",
                "127.0.0.1",
                "--allowed-download-hosts",
                "127.0.0.1",
                "--allow-insecure-http",
                "download-import",
                f"{base}files/mod.zip",
                "--downloads-dir",
                str(downloads),
                "--imports-root",
                str(imports),
                "--max-bytes",
                "5000000",
            ]
        )
        out = json.loads(capsys.readouterr().out)
        assert code == 0
        assert out["import_dir"]
        imported = Path(out["import_dir"])
        assert (imported / "mod" / "readme.txt").read_text(encoding="utf-8") == "hello"
    finally:
        httpd.shutdown()

