
import json
from ..utils.redaction import redact

class ExportService:

    def __init__(self, issue_store, run_store):
        self.issues = issue_store
        self.runs = run_store

    def export(self, issue_ids, fmt, destination):
        issues = [self.issues.get(i) for i in issue_ids]

        sanitized = [redact(i) for i in issues]

        if fmt == "json":
            with open(destination, "w") as f:
                json.dump(sanitized, f, indent=2)

        elif fmt == "md":
            with open(destination, "w") as f:
                for i in sanitized:
                    f.write(f"## {i['summary']}\n{i['details']}\n\n")

        return {"exported": len(sanitized)}
