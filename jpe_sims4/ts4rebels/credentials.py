from __future__ import annotations

import json
from dataclasses import dataclass

from jpe_sims4.diagnostics import Diagnostic
import jpe_sims4.ts4rebels.diagnostics as di


@dataclass(frozen=True)
class KeyringStatus:
    available: bool
    reason: str | None = None


def keyring_status() -> KeyringStatus:
    try:
        import keyring  # type: ignore[import-not-found]  # noqa: F401

        return KeyringStatus(available=True, reason=None)
    except Exception as e:
        return KeyringStatus(available=False, reason=str(e))


def _service_name(*, base_url: str) -> str:
    base = (base_url or "").strip().rstrip("/")
    return f"jpe_studio_ts4rebels:{base}"


def store_session(*, base_url: str, keyring_id: str, cookies: dict[str, str]) -> list[Diagnostic]:
    st = keyring_status()
    if not st.available:
        return [di.download_blocked(message=f"Keyring unavailable: {st.reason or 'unknown error'}")]
    try:
        import keyring  # type: ignore[import-not-found]

        payload = json.dumps({"cookies": dict(cookies or {})}, ensure_ascii=False)
        keyring.set_password(_service_name(base_url=base_url), str(keyring_id), payload)
        return []
    except Exception as e:
        return [di.download_blocked(message=f"Failed to store session: {e}")]


def load_session(*, base_url: str, keyring_id: str) -> tuple[dict[str, str] | None, list[Diagnostic]]:
    st = keyring_status()
    if not st.available:
        return None, [di.download_blocked(message=f"Keyring unavailable: {st.reason or 'unknown error'}")]
    try:
        import keyring  # type: ignore[import-not-found]

        raw = keyring.get_password(_service_name(base_url=base_url), str(keyring_id))
        if not raw:
            return None, []
        data = json.loads(raw)
        cookies = dict((data or {}).get("cookies") or {})
        return {str(k): str(v) for k, v in cookies.items()}, []
    except Exception as e:
        return None, [di.download_blocked(message=f"Failed to load session: {e}")]


def delete_session(*, base_url: str, keyring_id: str) -> list[Diagnostic]:
    st = keyring_status()
    if not st.available:
        return [di.download_blocked(message=f"Keyring unavailable: {st.reason or 'unknown error'}")]
    try:
        import keyring  # type: ignore[import-not-found]

        try:
            keyring.delete_password(_service_name(base_url=base_url), str(keyring_id))
        except Exception:
            pass
        return []
    except Exception as e:
        return [di.download_blocked(message=f"Failed to delete session: {e}")]

