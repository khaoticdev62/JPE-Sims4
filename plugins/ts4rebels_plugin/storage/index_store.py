import sqlite3
import os
import json


class IndexStore:
    def __init__(self):
        self.db_path = os.path.expanduser("~/.jpe/ts4rebels_index.db")
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

    def initialize(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("""
        CREATE TABLE IF NOT EXISTS mods (
            mod_id TEXT PRIMARY KEY,
            name TEXT,
            metadata TEXT
        )
        """)
        c.execute("""
        CREATE TABLE IF NOT EXISTS mod_files (
            path TEXT PRIMARY KEY,
            mod_id TEXT,
            size INTEGER,
            mtime REAL,
            hash TEXT,
            resources TEXT,
            FOREIGN KEY(mod_id) REFERENCES mods(mod_id)
        )
        """)
        conn.commit()
        conn.close()

    def get_vault_path(self):
        return os.environ.get("TS4REBEL_VAULT", "./vault")

    def update_mods(self, mods):
        """
        mods: List of Mod/dict
        """
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        for m in mods:
            mid = getattr(m, "id", None) or (
                m.get("id") if isinstance(m, dict) else None
            )
            name = getattr(m, "name", None) or (
                m.get("name") if isinstance(m, dict) else mid
            )

            c.execute(
                "INSERT OR REPLACE INTO mods(mod_id, name) VALUES(?,?)",
                (mid, name),
            )

            files = getattr(m, "files", []) or (
                m.get("files", []) if isinstance(m, dict) else []
            )
            for f in files:
                c.execute(
                    "INSERT OR REPLACE INTO mod_files(path, mod_id, size, mtime, hash, resources) VALUES(?,?,?,?,?,?)",
                    (
                        f["path"],
                        mid,
                        f["size"],
                        f["mtime"],
                        f.get("hash"),
                        json.dumps(f.get("resources", [])),
                    ),
                )
        conn.commit()
        conn.close()

    def list_mods(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        rows = c.execute("SELECT * FROM mods").fetchall()

        mods = []
        for r in rows:
            mod_id = r["mod_id"]
            file_rows = c.execute(
                "SELECT * FROM mod_files WHERE mod_id = ?", (mod_id,)
            ).fetchall()
            files = []
            for fr in file_rows:
                files.append(
                    {
                        "path": fr["path"],
                        "size": fr["size"],
                        "mtime": fr["mtime"],
                        "hash": fr["hash"],
                        "resources": json.loads(fr["resources"] or "[]"),
                    }
                )
            mods.append({"id": mod_id, "name": r["name"], "files": files})

        conn.close()
        return mods

    def get_mod(self, mod_id):
        mods = self.list_mods()
        for m in mods:
            if m["id"] == mod_id:
                return m
        return None
