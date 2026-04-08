
import os

def redact(issue):
    if not issue:
        return issue
    redacted = dict(issue)
    redacted["details"] = redacted.get("details","").replace(os.path.expanduser("~"), "{USER}")
    return redacted
