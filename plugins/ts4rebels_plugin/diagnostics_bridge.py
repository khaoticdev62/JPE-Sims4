import json
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Dict, List, Any

from engine.errors import EngineError
from .orchestrator import TranslationRun, TranslationResult


class Severity(str, Enum):
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"
    INFO = "info"

class IssueStatus(str, Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    WONT_FIX = "wont_fix"

@dataclass
class Note:
    author: str
    timestamp: datetime
    content: str

@dataclass
class DiagnosticIssue:
    id: str
    mod_id: str
    severity: Severity
    status: IssueStatus
    category: str
    summary: str
    details: str
    created_at: datetime
    updated_at: datetime
    files: List[Path] = field(default_factory=list)
    plugin_version: str = "unknown"
    jpe_core_version: str = "unknown"
    notes: List[Note] = field(default_factory=list)

class DiagnosticsBridge:
    """Stores and queries TS4Rebels diagnostics for CRM‑style views."""

    def __init__(self, cache_dir: Path) -> None:
        self.cache_dir = cache_dir
        self.issues_path = self.cache_dir / "ts4rebels_issues.json"
        self._issues: Dict[str, DiagnosticIssue] = self._load_issues()

    def _load_issues(self) -> Dict[str, DiagnosticIssue]:
        if not self.issues_path.exists():
            return {}
        
        with open(self.issues_path, "r") as f:
            data = json.load(f)
            issues = {}
            for issue_data in data:
                issue_data["severity"] = Severity(issue_data["severity"])
                issue_data["status"] = IssueStatus(issue_data["status"])
                issue_data["created_at"] = datetime.fromisoformat(issue_data["created_at"])
                issue_data["updated_at"] = datetime.fromisoformat(issue_data["updated_at"])
                issue_data["files"] = [Path(f) for f in issue_data["files"]]
                issue_data["notes"] = [Note(author=n["author"], timestamp=datetime.fromisoformat(n["timestamp"]), content=n["content"]) for n in issue_data.get("notes", [])]
                issue = DiagnosticIssue(**issue_data)
                issues[issue.id] = issue
            return issues

    def _save_issues(self) -> None:
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        with open(self.issues_path, "w") as f:
            # Convert datetimes and Paths to strings for JSON serialization
            serializable_issues = []
            for issue in self._issues.values():
                issue_dict = asdict(issue)
                issue_dict["severity"] = issue_dict["severity"].value
                issue_dict["status"] = issue_dict["status"].value
                issue_dict["created_at"] = issue_dict["created_at"].isoformat()
                issue_dict["updated_at"] = issue_dict["updated_at"].isoformat()
                issue_dict["files"] = [str(f) for f in issue_dict["files"]]
                issue_dict["notes"] = [asdict(n) for n in issue_dict["notes"]]
                for note in issue_dict["notes"]:
                    note["timestamp"] = note["timestamp"].isoformat()
                serializable_issues.append(issue_dict)
            json.dump(serializable_issues, f, indent=2)

    def add_issue(self, issue: DiagnosticIssue) -> None:
        self._issues[issue.id] = issue
        self._save_issues()

    def add_errors_from_translation_run(self, run: TranslationRun, plugin_version: str, jpe_core_version: str):
        for mod_id, result in run.results.items():
            if result.errors:
                for error in result.errors:
                    issue_id = f"translation_error_{mod_id}_{datetime.now().isoformat().replace(':', '-')}"
                    new_issue = DiagnosticIssue(
                        id=issue_id,
                        mod_id=mod_id,
                        severity=Severity.CRITICAL if error.level == "error" else Severity.MAJOR, # Map EngineError level to Severity
                        status=IssueStatus.OPEN,
                        category="Translation",
                        summary=f"Translation Error in {mod_id}: {error.message[:100]}...",
                        details=error.message,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                        files=[error.file_path] if error.file_path else [],
                        plugin_version=plugin_version,
                        jpe_core_version=jpe_core_version
                    )
                    self.add_issue(new_issue)

    def list_issues(self, 
                    status: IssueStatus | None = None,
                    mod_id: str | None = None,
                    severity: Severity | None = None,
                    category: str | None = None) -> List[DiagnosticIssue]:
        
        issues = list(self._issues.values())
        
        if status is not None:
            issues = [i for i in issues if i.status == status]
        if mod_id is not None:
            issues = [i for i in issues if i.mod_id == mod_id]
        if severity is not None:
            issues = [i for i in issues if i.severity == severity]
        if category is not None:
            issues = [i for i in issues if i.category == category]
            
        return sorted(issues, key=lambda i: i.created_at)

    def update_status(self, issue_id: str, status: IssueStatus) -> None:
        issue = self._issues.get(issue_id)
        if not issue:
            raise KeyError(f"No issue with id {issue_id}")
        issue.status = status
        issue.updated_at = datetime.utcnow()
        self._save_issues()

    def add_note(self, issue_id: str, author: str, content: str) -> None:
        issue = self._issues.get(issue_id)
        if not issue:
            raise KeyError(f"No issue with id {issue_id}")
        new_note = Note(author=author, timestamp=datetime.utcnow(), content=content)
        issue.notes.append(new_note)
        issue.updated_at = datetime.utcnow()
        self._save_issues()

    def apply_retention_policy(self, retention_days: int) -> None:
        if retention_days <= 0:
            return # No retention policy
        
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        issues_to_keep = {}
        for issue_id, issue in self._issues.items():
            if issue.created_at >= cutoff_date:
                issues_to_keep[issue_id] = issue
        self._issues = issues_to_keep
        self._save_issues()

    def export_issues(self, 
                      issue_ids: List[str], 
                      format: str, 
                      privacy_config: Dict[str, Any]) -> str:
        
        selected_issues = [self._issues[issue_id] for issue_id in issue_ids if issue_id in self._issues]
        
        if format.lower() == "json":
            return self._export_to_json(selected_issues, privacy_config)
        elif format.lower() == "markdown":
            return self._export_to_markdown(selected_issues, privacy_config)
        else:
            raise ValueError(f"Unsupported export format: {format}")

    def _export_to_json(self, issues: List[DiagnosticIssue], privacy_config: Dict[str, Any]) -> str:
        serializable_issues = []
        for issue in issues:
            issue_dict = asdict(issue)
            # Apply redaction for JSON
            if privacy_config.get("redact_local_paths_in_exports", False):
                issue_dict["files"] = ["<REDACTED_PATH>" for _ in issue_dict["files"]]
            # Redact username if applicable (issue_dict does not contain username currently)
            if privacy_config.get("redact_username_in_exports", False):
                pass # No username field in DiagnosticIssue for now
            
            # Convert enums and datetimes to strings
            issue_dict["severity"] = issue_dict["severity"].value
            issue_dict["status"] = issue_dict["status"].value
            issue_dict["created_at"] = issue_dict["created_at"].isoformat()
            issue_dict["updated_at"] = issue_dict["updated_at"].isoformat()
            issue_dict["notes"] = [asdict(n) for n in issue_dict["notes"]]
            for note in issue_dict["notes"]:
                note["timestamp"] = note["timestamp"].isoformat()
            
            serializable_issues.append(issue_dict)
        return json.dumps(serializable_issues, indent=2)

    def _export_to_markdown(self, issues: List[DiagnosticIssue], privacy_config: Dict[str, Any]) -> str:
        markdown_output = []
        for issue in issues:
            markdown_output.append(f"## Issue: {issue.summary}")
            markdown_output.append(f"- **ID:** `{issue.id}`")
            markdown_output.append(f"- **Mod ID:** `{issue.mod_id}`")
            markdown_output.append(f"- **Severity:** {issue.severity.value.upper()}")
            markdown_output.append(f"- **Status:** {issue.status.value.replace('_', ' ').title()}")
            markdown_output.append(f"- **Category:** {issue.category}")
            markdown_output.append(f"- **Created:** {issue.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            markdown_output.append(f"- **Last Updated:** {issue.updated_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            markdown_output.append("\n### Details\n")
            markdown_output.append(issue.details)
            
            # Files
            markdown_output.append("\n### Affected Files\n")
            if privacy_config.get("redact_local_paths_in_exports", False):
                markdown_output.append("- <REDACTED_PATHS>")
            else:
                for f_path in issue.files:
                    markdown_output.append(f"- `{f_path}`")

            # Notes
            if issue.notes:
                markdown_output.append("\n### Notes\n")
                for note in issue.notes:
                    markdown_output.append(f"- **{note.author}** ({note.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}): {note.content}")
            
            markdown_output.append("\n---\n") # Separator between issues
        
        return "\n".join(markdown_output)
