//! Structured diagnostics for JPE Sims 4 Mod Translation Suite
use serde::{Deserialize, Serialize};

/// Severity levels for diagnostics
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Severity {
    Info,
    Warning,
    Error,
    Fatal,
}

/// Represents a span in source code (file + position)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Span {
    pub file: String,
    pub start_line: u32,
    pub start_col: u32,
    pub end_line: u32,
    pub end_col: u32,
}

/// A diagnostic message with structured information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Diagnostic {
    pub code: String,  // e.g. "JPE1004"
    pub severity: Severity,
    pub span: Option<Span>,
    pub message: String,
    pub hint: Option<String>,
}

impl Diagnostic {
    pub fn new(code: impl Into<String>, severity: Severity, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            severity,
            span: None,
            message: message.into(),
            hint: None,
        }
    }

    pub fn with_span(mut self, span: Span) -> Self {
        self.span = Some(span);
        self
    }

    pub fn with_hint(mut self, hint: impl Into<String>) -> Self {
        self.hint = Some(hint.into());
        self
    }
}

/// Helper function to check if diagnostics contain error-level issues
pub fn has_error_level(diagnostics: &[Diagnostic]) -> bool {
    diagnostics.iter().any(|d| {
        matches!(d.severity, Severity::Error | Severity::Fatal)
    })
}

/// Helper function to filter diagnostics by severity
pub fn filter_by_severity(diagnostics: &[Diagnostic], severity: &Severity) -> Vec<&Diagnostic> {
    diagnostics.iter().filter(|d| &d.severity == severity).collect()
}

/// Helper function to count diagnostics by severity
pub fn count_by_severity(diagnostics: &[Diagnostic]) -> std::collections::HashMap<String, usize> {
    let mut counts = std::collections::HashMap::new();

    for diag in diagnostics {
        let key = match diag.severity {
            Severity::Info => "info".to_string(),
            Severity::Warning => "warning".to_string(),
            Severity::Error => "error".to_string(),
            Severity::Fatal => "fatal".to_string(),
        };

        *counts.entry(key).or_insert(0) += 1;
    }

    counts
}