"""Report writer for build reports."""

from pathlib import Path
from typing import List
from .errors import BuildReport, EngineError


class ReportWriter:
    """Writes build reports to disk."""

    def __init__(self, reports_dir: Path):
        self.reports_dir = reports_dir
        self.reports_dir.mkdir(parents=True, exist_ok=True)

    def write_report(self, report: BuildReport) -> Path:
        """Write a build report to disk."""
        report_file = self.reports_dir / f"{report.build_id}.json"
        
        # Simple JSON serialization
        import json
        data = {
            'status': report.status,
            'errors': [e.to_dict() for e in report.errors],
            'warnings': [w.to_dict() for w in report.warnings],
            'info': report.info,
            'build_id': report.build_id,
            'timestamp': report.timestamp,
        }
        
        report_file.write_text(json.dumps(data, indent=2))
        return report_file

    def get_report(self, build_id: str) -> BuildReport | None:
        """Read a build report from disk."""
        report_file = self.reports_dir / f"{build_id}.json"
        
        if not report_file.exists():
            return None
        
        import json
        from .errors import ErrorCategory, ErrorSeverity
        
        data = json.loads(report_file.read_text())
        
        # Reconstruct objects
        errors = [
            EngineError(
                code=e['code'],
                category=ErrorCategory(e['category']),
                severity=ErrorSeverity(e['severity']),
                message_short=e['message_short'],
                message_long=e['message_long'],
                suggested_fix=e.get('suggested_fix'),
                file_path=e.get('file_path'),
                line_number=e.get('line_number'),
                column=e.get('column'),
            )
            for e in data.get('errors', [])
        ]
        
        warnings = [
            EngineError(
                code=w['code'],
                category=ErrorCategory(w['category']),
                severity=ErrorSeverity(w['severity']),
                message_short=w['message_short'],
                message_long=w['message_long'],
                suggested_fix=w.get('suggested_fix'),
                file_path=w.get('file_path'),
                line_number=w.get('line_number'),
                column=w.get('column'),
            )
            for w in data.get('warnings', [])
        ]
        
        return BuildReport(
            status=data['status'],
            errors=errors,
            warnings=warnings,
            info=data.get('info', []),
            build_id=data['build_id'],
            timestamp=data['timestamp'],
        )
