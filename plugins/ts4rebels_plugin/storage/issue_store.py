
import uuid

class IssueStore:

    def __init__(self):
        self.issues = {}

    def create_issue(self, mod_id, severity, category, summary):
        issue_id = str(uuid.uuid4())
        self.issues[issue_id] = {
            "issue_id": issue_id,
            "mod_id": mod_id,
            "severity": severity,
            "category": category,
            "summary": summary,
            "details": ""
        }
        return issue_id

    def get(self, issue_id):
        return self.issues.get(issue_id)
