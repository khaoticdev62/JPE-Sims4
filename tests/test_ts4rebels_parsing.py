from __future__ import annotations

from pathlib import Path

from jpe_sims4.ts4rebels.html_parse import parse_forum_listing, parse_login_form, parse_topic


def _read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def test_parse_login_form_ok(tmp_path: Path) -> None:
    html = _read(Path("tests/ts4rebels/fixtures/login_page.html"))
    form, diags = parse_login_form(html_text=html, base_url="https://ts4rebels.cc/")
    assert diags == []
    assert form is not None
    assert "ucp.php?mode=login" in form.action_url
    assert form.fields["creation_time"] == "1234567890"
    assert form.fields["form_token"] == "abc123"


def test_parse_forum_listing_topics() -> None:
    html = _read(Path("tests/ts4rebels/fixtures/forum_listing.html"))
    topics, diags = parse_forum_listing(html_text=html, base_url="https://ts4rebels.cc/")
    assert diags == []
    assert {t.topic_id for t in topics} == {4982, 4920}
    assert any(t.title == "Example Topic A" for t in topics)


def test_parse_topic_guest_stripped_emits_auth_required() -> None:
    html = _read(Path("tests/ts4rebels/fixtures/topic_guest_stripped.html"))
    posts, diags = parse_topic(html_text=html, base_url="https://ts4rebels.cc/")
    assert posts
    assert any(d.code == "E_TS4REBEL_AUTH_REQUIRED" for d in diags)


def test_parse_topic_logged_in_links_extracts_links() -> None:
    html = _read(Path("tests/ts4rebels/fixtures/topic_logged_in_links.html"))
    posts, diags = parse_topic(html_text=html, base_url="https://ts4rebels.cc/")
    assert diags == []
    assert posts and posts[0].links
    urls = {l.url for l in posts[0].links}
    assert any("download/file.php?id=123" in u for u in urls)
    assert any("example.com/files/mod.zip" in u for u in urls)

