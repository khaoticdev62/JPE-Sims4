import sys
import json
import argparse
import os

# Add project root to path so we can import jpe_sims4
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from jpe_sims4.ts4rebels.client import TS4RebelsClient, ClientConfig
from jpe_sims4.ts4rebels.credentials import store_session, load_session


def main():
    parser = argparse.ArgumentParser(description="TS4Rebels Bridge")
    subparsers = parser.add_subparsers(dest="command")

    # Login command
    login_parser = subparsers.add_parser("login")
    login_parser.add_argument("--username", required=True)
    login_parser.add_argument("--password", required=True)

    # List topics command
    list_parser = subparsers.add_parser("list")
    list_parser.add_argument("--forum", type=int, required=True)
    list_parser.add_argument("--page", type=int, default=1)

    # Get topic command
    get_parser = subparsers.add_parser("get")
    get_parser.add_argument("--topic", type=int, required=True)
    get_parser.add_argument("--page", type=int, default=1)

    args = parser.parse_args()

    config = ClientConfig(enable_network=True)
    client = TS4RebelsClient(config=config)

    # Attempt to load existing session
    cookies, _ = load_session(base_url=client.base_url, keyring_id="default")
    if cookies:
        client.set_cookies(cookies)

    if args.command == "login":
        diags = client.login(username=args.username, password=args.password)
        if not diags:
            # Success, store session
            store_session(
                base_url=client.base_url,
                keyring_id="default",
                cookies=client.get_cookies(),
            )
            print(json.dumps({"success": True}))
        else:
            print(json.dumps({"success": False, "error": diags[0].message}))

    elif args.command == "list":
        topics, diags = client.list_forum_topics(forum_id=args.forum, page=args.page)
        if topics:
            result = []
            for t in topics:
                result.append(
                    {
                        "id": t.topic_id,
                        "title": t.title,
                        "url": t.url,
                        "author": "Unknown",
                        "replies": 0,
                        "views": 0,
                        "lastPostTime": t.last_post_at or "",
                    }
                )
            print(json.dumps({"success": True, "topics": result}))
        else:
            error = diags[0].message if diags else "No topics found"
            print(json.dumps({"success": False, "error": error}))

    elif args.command == "get":
        posts, diags = client.get_topic(topic_id=args.topic, page=args.page)
        if posts:
            result = []
            for p in posts:
                result.append(
                    {
                        "id": p.post_id,
                        "author": p.author or "Anonymous",
                        "time": p.created_at or "",
                        "content": p.content_text,
                        "downloadLinks": [l.url for l in p.links],
                    }
                )
            print(json.dumps({"success": True, "posts": result}))
        else:
            error = diags[0].message if diags else "No posts found"
            print(json.dumps({"success": False, "error": error}))

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
