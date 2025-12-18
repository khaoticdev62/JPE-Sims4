from __future__ import annotations

import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import ClassVar
from zipfile import ZipFile

import requests

from jpe_sims4.ts4rebels.client import ClientConfig, TS4RebelsClient
from jpe_sims4.ts4rebels.downloads import DownloadLimits
from jpe_sims4.ts4rebels.http import HttpConfig, HttpSession
from jpe_sims4.ts4rebels.sync import download_and_import_zip, extract_zip_to_folder


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


def test_extract_zip_to_folder_skips_unsafe_member(tmp_path: Path) -> None:
    z = tmp_path / "m.zip"
    with ZipFile(z, "w") as zf:
        zf.writestr("ok.txt", "hi")
        zf.writestr("../evil.txt", "nope")

    out = tmp_path / "out"
    files, bytes_written, diags = extract_zip_to_folder(zip_path=z, dest_dir=out)
    assert files == 1
    assert bytes_written > 0
    assert (out / "ok.txt").exists()
    assert not (out / "evil.txt").exists()
    assert any(d.code == "E_ZIP_PATH_TRAVERSAL" for d in diags)


def test_download_and_import_zip_happy_path(tmp_path: Path) -> None:
    # Build a tiny zip payload served over localhost http (allowed only for tests via allow_insecure_http + DownloadLimits).
    z = tmp_path / "payload.zip"
    with ZipFile(z, "w") as zf:
        zf.writestr("mod/readme.txt", "hello")
    data = z.read_bytes()

    httpd, base = _serve({("GET", "/files/mod.zip"): (200, data, {"Content-Type": "application/zip"})})
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

        res = download_and_import_zip(
            client=client,
            url=f"{base}files/mod.zip",
            downloads_dir=tmp_path / "dl",
            imports_root=tmp_path / "imports",
            download_limits=DownloadLimits(max_bytes=5_000_000, allowed_hosts=("127.0.0.1",), allow_insecure_http=True),
        )
        assert res.downloaded_path is not None
        assert res.import_dir is not None
        assert (res.import_dir / "mod" / "readme.txt").read_text(encoding="utf-8") == "hello"
        assert res.files_written == 1
        assert not any(d.severity in {"ERROR", "FATAL"} for d in res.diagnostics if d.code != "E_ZIP_PATH_TRAVERSAL")
    finally:
        httpd.shutdown()


def test_download_and_import_zip_network_disabled(tmp_path: Path) -> None:
    sess = requests.Session()
    http = HttpSession(config=HttpConfig(min_delay_s=0.0, max_requests_per_run=10), session=sess)
    client = TS4RebelsClient(
        config=ClientConfig(
            base_url="https://ts4rebels.cc/",
            enable_network=False,
            allowed_hosts=("ts4rebels.cc",),
        ),
        http=http,
    )
    res = download_and_import_zip(
        client=client,
        url="https://ts4rebels.cc/files/mod.zip",
        downloads_dir=tmp_path / "dl",
        imports_root=tmp_path / "imports",
    )
    assert res.import_dir is None
    assert any(d.code == "E_TS4REBEL_NETWORK_DISABLED" for d in res.diagnostics)


def test_download_and_import_zip_rejects_unallowlisted_host(tmp_path: Path) -> None:
    z = tmp_path / "payload.zip"
    with ZipFile(z, "w") as zf:
        zf.writestr("mod/readme.txt", "hello")
    data = z.read_bytes()

    httpd, base = _serve({("GET", "/files/mod.zip"): (200, data, {"Content-Type": "application/zip"})})
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

        res = download_and_import_zip(
            client=client,
            url=f"{base}files/mod.zip",
            downloads_dir=tmp_path / "dl",
            imports_root=tmp_path / "imports",
            download_limits=DownloadLimits(max_bytes=5_000_000, allowed_hosts=("example.com",), allow_insecure_http=True),
        )
        assert res.import_dir is None
        assert any(d.code == "E_TS4REBEL_UNSUPPORTED_HOST" for d in res.diagnostics)
    finally:
        httpd.shutdown()


def test_download_and_import_zip_requires_zip_extension(tmp_path: Path) -> None:
    payload = b"not a zip"

    httpd, base = _serve({("GET", "/files/mod.bin"): (200, payload, {"Content-Type": "application/octet-stream"})})
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

        res = download_and_import_zip(
            client=client,
            url=f"{base}files/mod.bin",
            downloads_dir=tmp_path / "dl",
            imports_root=tmp_path / "imports",
            download_limits=DownloadLimits(max_bytes=5_000_000, allowed_hosts=("127.0.0.1",), allow_insecure_http=True),
        )
        assert res.import_dir is None
        assert any(d.code == "E_TS4REBEL_UNSUPPORTED_DOWNLOAD" for d in res.diagnostics)
    finally:
        httpd.shutdown()
