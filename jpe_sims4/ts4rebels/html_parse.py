from __future__ import annotations

import html
import re
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

from jpe_sims4.diagnostics import Diagnostic
import jpe_sims4.ts4rebels.diagnostics as di
from jpe_sims4.ts4rebels.types import DownloadLink, LoginForm, PostRef, TopicRef


class _LinkCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str | None]] = []
        self._in_a = False
        self._href: str | None = None
        self._text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        self._in_a = True
        self._href = None
        self._text = []
        for k, v in attrs:
            if k.lower() == "href" and v:
                self._href = v

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() != "a":
            return
        if self._in_a and self._href:
            label = html.unescape("".join(self._text).strip() or "")
            self.links.append((self._href, label or None))
        self._in_a = False
        self._href = None
        self._text = []

    def handle_data(self, data: str) -> None:
        if self._in_a:
            self._text.append(data)


class _FormParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.forms: list[dict[str, object]] = []
        self._current: dict[str, object] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        t = tag.lower()
        if t == "form":
            action = ""
            method = ""
            for k, v in attrs:
                if k.lower() == "action" and v:
                    action = v
                if k.lower() == "method" and v:
                    method = v.lower()
            self._current = {"action": action, "method": method, "inputs": {}}
            return

        if t == "input" and self._current is not None:
            name = None
            value = ""
            itype = ""
            for k, v in attrs:
                lk = k.lower()
                if lk == "name":
                    name = v
                elif lk == "value" and v is not None:
                    value = v
                elif lk == "type" and v:
                    itype = v.lower()
            if name and itype in {"hidden", "submit", ""}:
                inputs: dict[str, str] = self._current["inputs"]  # type: ignore[assignment]
                inputs[str(name)] = str(value)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "form" and self._current is not None:
            self.forms.append(self._current)
            self._current = None


_TOPIC_ID_RE = re.compile(r"(?:\?|&|\b)t=(\d+)\b")
_POST_ID_RE = re.compile(r"(?:\?|&|\b)p=(\d+)\b")


def parse_login_form(*, html_text: str, base_url: str) -> tuple[LoginForm | None, list[Diagnostic]]:
    parser = _FormParser()
    try:
        parser.feed(html_text)
    except Exception as e:
        return None, [di.parse_failed(message=str(e))]

    best: dict[str, object] | None = None
    for f in parser.forms:
        action = str(f.get("action") or "")
        if "ucp.php" in action and "mode=login" in action:
            best = f
            break
    if best is None:
        for f in parser.forms:
            action = str(f.get("action") or "")
            if "ucp.php" in action and "login" in action:
                best = f
                break

    if best is None:
        return None, [di.parse_failed(message="Login form not found.")]

    action = urljoin(base_url, str(best.get("action") or "").strip())
    fields: dict[str, str] = dict(best.get("inputs") or {})  # type: ignore[arg-type]
    # phpBB typically requires these hidden fields.
    required = {"form_token", "creation_time"}
    missing = sorted([k for k in required if not str(fields.get(k) or "").strip()])
    if missing:
        return None, [di.parse_failed(message=f"Login form missing required fields: {', '.join(missing)}.")]

    return LoginForm(action_url=action, fields=fields), []


def parse_forum_listing(*, html_text: str, base_url: str) -> tuple[list[TopicRef], list[Diagnostic]]:
    diags: list[Diagnostic] = []
    links = _LinkCollector()
    try:
        links.feed(html_text)
    except Exception as e:
        return [], [di.parse_failed(message=str(e))]

    topics: dict[int, TopicRef] = {}
    for href, label in links.links:
        if "viewtopic.php" not in href:
            continue
        m = _TOPIC_ID_RE.search(href)
        if not m:
            continue
        tid = int(m.group(1))
        url = urljoin(base_url, href)
        title = (label or "").strip()
        if not title:
            continue
        topics[tid] = TopicRef(topic_id=tid, title=title, url=url)

    if not topics:
        diags.append(di.parse_failed(message="No topics found in forum listing."))
    return list(topics.values()), diags


def parse_topic(*, html_text: str, base_url: str) -> tuple[list[PostRef], list[Diagnostic]]:
    diags: list[Diagnostic] = []

    if "[External Link Removed for Guests]" in html_text:
        diags.append(di.auth_required(message="Links are hidden for guests; sign in to view downloads."))

    links = _LinkCollector()
    try:
        links.feed(html_text)
    except Exception as e:
        return [], [di.parse_failed(message=str(e))]

    # Best-effort: treat any https link as a candidate; classify attachments.
    out_links: list[DownloadLink] = []
    for href, label in links.links:
        abs_url = urljoin(base_url, href)
        parsed = urlparse(abs_url)
        host = parsed.hostname or ""
        kind = "unknown"
        if "download/file.php" in abs_url:
            kind = "attachment"
        elif parsed.scheme in {"http", "https"}:
            kind = "external"
        out_links.append(DownloadLink(url=abs_url, host=host, kind=kind, label=label))

    # Post id extraction is weak without full DOM; infer from any p= links on the page.
    post_ids: list[int] = []
    for href, _label in links.links:
        m = _POST_ID_RE.search(href)
        if m:
            post_ids.append(int(m.group(1)))
    post_id = max(post_ids) if post_ids else 0

    content_text = html.unescape(re.sub(r"<[^>]+>", " ", html_text))
    content_text = re.sub(r"\\s+", " ", content_text).strip()
    post = PostRef(post_id=post_id, author=None, created_at=None, content_text=content_text, links=out_links)
    return [post], diags
