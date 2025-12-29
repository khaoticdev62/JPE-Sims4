from __future__ import annotations

from jpe_sims4.validation import extract_placeholders, validate_segment


def test_extract_placeholders() -> None:
    assert extract_placeholders("Hi {0} %s ${name}") == ["${name}", "%s", "{0}"]


def test_validate_placeholder_mismatch() -> None:
    seg = {"id": "abc", "file_path": "x.xml", "location": "l", "source": "Hi {0}", "target": "Hi {1}"}
    diags = validate_segment(segment=seg)
    assert len(diags) == 1
    assert diags[0].code == "E_PLACEHOLDER_MISMATCH"


def test_validate_rules_forbidden_and_tokens_and_length() -> None:
    rules = {
        "max_target_len": 4,
        "forbidden_chars": ["$"],
        "token_regexes": [r"\[[A-Z_]+\]"],
        "preserve_whitespace": True,
    }
    seg = {
        "id": "s1",
        "file_path": "x.xml",
        "location": "l",
        "source": "Hello [TOKEN]",
        "target": " hi$ ",
    }
    diags = validate_segment(segment=seg, rules=rules)
    codes = {d.code for d in diags}
    assert "E_TARGET_TOO_LONG" in codes
    assert "E_FORBIDDEN_CHAR" in codes
    assert "E_TOKEN_MISMATCH" in codes
    assert "W_WHITESPACE_CHANGED" in codes


def test_blank_target_emits_no_errors() -> None:
    rules = {"token_regexes": [r"\[[A-Z_]+\]"], "max_target_len": 1, "forbidden_chars": ["$"]}
    seg = {"id": "s2", "file_path": "x.xml", "location": "l", "source": "Hello [TOKEN]", "target": ""}
    diags = validate_segment(segment=seg, rules=rules)
    assert diags == []


def test_whitespace_only_target_emits_no_errors() -> None:
    rules = {"token_regexes": [r"\[[A-Z_]+\]"], "max_target_len": 1, "forbidden_chars": ["$"], "forbidden_regexes": [r".+"]}
    seg = {"id": "s3", "file_path": "x.xml", "location": "l", "source": "Hello [TOKEN]", "target": "   "}
    diags = validate_segment(segment=seg, rules=rules)
    assert diags == []
