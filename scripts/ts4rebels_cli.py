#!/usr/bin/env python3
"""
Standalone TS4Rebels CLI for JPE Studio Electron App
No jpe_sims4 dependency — uses only requests + stdlib
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from html.parser import HTMLParser
from typing import Any

try:
    import requests
except ImportError:
    print(json.dumps({"success": False, "error": "requests library not installed. Run: pip install requests"}))
    sys.exit(1)


class TS4RebelsClient:
    """Minimal TS4Rebels API client using only requests."""
    
    def __init__(self, base_url: str = "https://ts4rebels.cc/", enable_network: bool = True):
        self.base_url = base_url.rstrip("/") + "/"
        self.enable_network = enable_network
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        self._cookies: dict[str, str] = {}

    def set_cookies(self, cookies: dict[str, str]):
        self._cookies = cookies
        self.session.cookies.update(cookies)

    def get_cookies(self) -> dict[str, str]:
        return dict(self.session.cookies)

    def login(self, username: str, password: str) -> list[dict[str, Any]]:
        """Login and return list of diagnostics (empty = success)."""
        diags = []
        try:
            # First, get CSRF token
            resp = self.session.get(self.base_url, timeout=30)
            csrf_match = re.search(r'name="csrfmiddlewaretoken"\s+value="([^"]+)"', resp.text)
            csrf_token = csrf_match.group(1) if csrf_match else ""

            # POST login
            login_data = {
                "csrfmiddlewaretoken": csrf_token,
                "username": username,
                "password": password,
            }
            resp = self.session.post(
                self.base_url + "accounts/login/",
                data=login_data,
                headers={"Referer": self.base_url + "accounts/login/"},
                timeout=30,
                allow_redirects=True,
            )

            # Check if login succeeded (redirect to home, no error messages)
            if "login" not in resp.url.lower() and resp.status_code == 200:
                return []  # Success
            else:
                diags.append({"severity": "error", "message": "Login failed. Check credentials."})
        except requests.RequestException as e:
            diags.append({"severity": "error", "message": str(e)})
        return diags

    def list_forum_topics(self, forum_id: int, page: int = 1) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        """List topics in a forum."""
        diags = []
        topics = []
        try:
            url = f"{self.base_url}forum/{forum_id}/"
            if page > 1:
                url += f"page-{page}/"
            
            resp = self.session.get(url, timeout=30)
            resp.raise_for_status()
            
            # Parse topics from HTML
            topics = self._parse_topic_list(resp.text)
        except requests.RequestException as e:
            diags.append({"severity": "error", "message": str(e)})
        return topics, diags

    def get_topic_posts(self, topic_id: int, page: int = 1) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        """Get posts from a topic."""
        diags = []
        posts = []
        try:
            url = f"{self.base_url}topic/{topic_id}/"
            if page > 1:
                url += f"page-{page}/"
            
            resp = self.session.get(url, timeout=30)
            resp.raise_for_status()
            
            posts = self._parse_posts(resp.text)
        except requests.RequestException as e:
            diags.append({"severity": "error", "message": str(e)})
        return posts, diags

    def publish_mod(self, title: str, description: str, package_path: str, tags: str = "") -> dict[str, Any]:
        """Publish a mod package."""
        try:
            # Get CSRF
            resp = self.session.get(self.base_url, timeout=30)
            csrf_match = re.search(r'name="csrfmiddlewaretoken"\s+value="([^"]+)"', resp.text)
            csrf_token = csrf_match.group(1) if csrf_match else ""

            # Prepare multipart form
            with open(package_path, "rb") as f:
                files = {"package_file": (os.path.basename(package_path), f, "application/octet-stream")}
                data = {
                    "csrfmiddlewaretoken": csrf_token,
                    "title": title,
                    "description": description,
                    "tags": tags,
                }
                resp = self.session.post(
                    self.base_url + "upload/",
                    data=data,
                    files=files,
                    timeout=300,
                )

            if resp.status_code in (200, 302):
                return {"success": True, "message": "Upload completed"}
            else:
                return {"success": False, "error": f"Upload failed: HTTP {resp.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def _parse_topic_list(self, html: str) -> list[dict[str, Any]]:
        """Extract topic summaries from forum HTML."""
        topics = []
        # Simple regex-based extraction (more robust than HTMLParser for this use case)
        topic_pattern = re.compile(
            r'<a\s+href="[^"]*topic/(\d+)[^"]*"[^>]*>([^<]+)</a>.*?'
            r'(?:by|author)[^>]*>([^<]+)<.*?'
            r'(?:replies|responses)[^>]*>(\d+)<',
            re.DOTALL
        )
        for match in topic_pattern.finditer(html):
            topics.append({
                "topic_id": int(match.group(1)),
                "title": match.group(2).strip(),
                "author": match.group(3).strip(),
                "reply_count": int(match.group(4)),
            })
        return topics

    def _parse_posts(self, html: str) -> list[dict[str, Any]]:
        """Extract posts from topic HTML."""
        posts = []
        post_pattern = re.compile(
            r'<div\s+class="[^"]*post[^"]*".*?'
            r'(?:author|username)[^>]*>([^<]+)<.*?'
            r'(?:date|time)[^>]*>([^<]+)<.*?'
            r'<div\s+class="[^"]*content[^"]*">(.*?)</div>',
            re.DOTALL
        )
        for match in post_pattern.finditer(html):
            content = match.group(3).strip()
            links = self._extract_links(content)
            posts.append({
                "author": match.group(1).strip(),
                "created_at": match.group(2).strip(),
                "content": content,
                "links": links,
            })
        return posts

    def _extract_links(self, html: str) -> list[dict[str, Any]]:
        """Extract links from HTML content."""
        links = []
        link_pattern = re.compile(r'<a\s+href="([^"]+)"[^>]*>([^<]*)</a>')
        for match in link_pattern.finditer(html):
            url = match.group(1)
            label = match.group(2).strip()
            host = url.split("/")[2] if "/" in url else ""
            links.append({
                "url": url,
                "host": host,
                "kind": "external" if "ts4rebels.cc" not in url else "internal",
                "label": label or None,
            })
        return links


def cmd_login(args: argparse.Namespace) -> int:
    """Handle login command."""
    user = args.username or os.environ.get("JPE_TS4REBELS_USER", "").strip()
    pw = args.password or os.environ.get("JPE_TS4REBELS_PASS", "")
    
    if not user or not pw:
        print(json.dumps({"success": False, "error": "Username and password required"}))
        return 1

    client = TS4RebelsClient(
        base_url=args.base_url,
        enable_network=args.enable_network,
    )
    
    if args.cookies:
        try:
            cookie_data = json.loads(args.cookies)
            if isinstance(cookie_data, dict):
                client.set_cookies(cookie_data)
        except Exception:
            pass

    diags = client.login(username=user, password=pw)
    cookies = client.get_cookies()

    result = {
        "success": not diags,
        "data": {
            "ok": not diags,
            "cookies": cookies if not diags else {},
            "diagnostics": diags,
        },
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if not diags else 1


def cmd_forum(args: argparse.Namespace) -> int:
    """Handle forum command."""
    client = TS4RebelsClient(
        base_url=args.base_url,
        enable_network=args.enable_network,
    )
    
    if args.cookies:
        try:
            client.set_cookies(json.loads(args.cookies))
        except Exception:
            pass

    if not args.enable_network:
        print(json.dumps({
            "success": False,
            "error": "Network is disabled. Pass --enable-network.",
        }))
        return 1

    topics, diags = client.list_forum_topics(forum_id=int(args.forum), page=int(args.page))
    
    result = {
        "success": not diags,
        "data": {"topics": topics},
        "diagnostics": diags,
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if not diags else 1


def cmd_topic(args: argparse.Namespace) -> int:
    """Handle topic command."""
    client = TS4RebelsClient(
        base_url=args.base_url,
        enable_network=args.enable_network,
    )
    
    if args.cookies:
        try:
            client.set_cookies(json.loads(args.cookies))
        except Exception:
            pass

    if not args.enable_network:
        print(json.dumps({
            "success": False,
            "error": "Network is disabled. Pass --enable-network.",
        }))
        return 1

    posts, diags = client.get_topic_posts(topic_id=int(args.topic), page=int(args.page))
    
    result = {
        "success": not diags,
        "data": {"posts": posts},
        "diagnostics": diags,
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if not diags else 1


def cmd_publish(args: argparse.Namespace) -> int:
    """Handle publish command."""
    client = TS4RebelsClient(
        base_url=args.base_url,
        enable_network=args.enable_network,
    )
    
    if args.cookies:
        try:
            client.set_cookies(json.loads(args.cookies))
        except Exception:
            pass

    result = client.publish_mod(
        title=args.title,
        description=args.description,
        package_path=args.package,
        tags=args.tags or "",
    )
    
    print(json.dumps({"success": result.get("success", False), "data": result}, indent=2, ensure_ascii=False))
    return 0 if result.get("success") else 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="ts4rebels-cli")
    parser.add_argument("--base-url", default="https://ts4rebels.cc/", help="Base URL")
    parser.add_argument("--enable-network", action="store_true", help="Enable network access")
    parser.add_argument("--cookies", help="JSON-encoded cookies")
    
    sub = parser.add_subparsers(dest="command")
    
    # login
    login_p = sub.add_parser("login")
    login_p.add_argument("--username", default="")
    login_p.add_argument("--password", default="")
    login_p.set_defaults(func=cmd_login)
    
    # forum
    forum_p = sub.add_parser("forum")
    forum_p.add_argument("forum", type=int)
    forum_p.add_argument("--page", type=int, default=1)
    forum_p.set_defaults(func=cmd_forum)
    
    # topic
    topic_p = sub.add_parser("topic")
    topic_p.add_argument("topic", type=int)
    topic_p.add_argument("--page", type=int, default=1)
    topic_p.set_defaults(func=cmd_topic)
    
    # publish
    publish_p = sub.add_parser("publish")
    publish_p.add_argument("--title", required=True)
    publish_p.add_argument("--description", required=True)
    publish_p.add_argument("--package", required=True)
    publish_p.add_argument("--tags", default="")
    publish_p.set_defaults(func=cmd_publish)
    
    args = parser.parse_args(argv)
    
    if not args.command:
        parser.print_help()
        return 1
    
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
