from __future__ import annotations
from dataclasses import dataclass
import re
from typing import List, Optional


@dataclass
class RewriteRule:
    pattern: str
    replacement: str
    domain: str = "generic"
    priority: int = 0
    id: Optional[str] = None

    def apply(self, text: str) -> str:
        # Simple regex replacement for now, supporting placeholders in future.
        return re.sub(self.pattern, self.replacement, text, flags=re.IGNORECASE)


class RuleEngine:
    def __init__(self, rules: List[RewriteRule] = None):
        self._rules = rules or []

    def add_rule(self, rule: RewriteRule):
        self._rules.append(rule)
        # Sort by priority (higher first)
        self._rules.sort(key=lambda r: r.priority, reverse=True)

    def process(self, text: str, domain: str = "generic") -> str:
        result = text
        for rule in self._rules:
            if rule.domain == "generic" or rule.domain == domain:
                result = rule.apply(result)
        return result


def load_rules_from_data(data: list) -> RuleEngine:
    engine = RuleEngine()
    for r in data:
        engine.add_rule(
            RewriteRule(
                pattern=r["pattern"],
                replacement=r["replacement"],
                domain=r.get("domain", "generic"),
                priority=r.get("priority", 0),
                id=r.get("id"),
            )
        )
    return engine
