from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class LoginForm:
    action_url: str
    fields: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class TopicRef:
    topic_id: int
    title: str
    url: str
    last_post_id: int | None = None
    last_post_at: str | None = None


@dataclass(frozen=True)
class DownloadLink:
    url: str
    host: str
    kind: str  # external|attachment|unknown
    label: str | None = None


@dataclass(frozen=True)
class PostRef:
    post_id: int
    author: str | None
    created_at: str | None
    content_text: str
    links: list[DownloadLink] = field(default_factory=list)

