from __future__ import annotations
from aave_conversion.rules import RewriteRule, RuleEngine


def test_rule_application():
    rule = RewriteRule(pattern=r"if (.+) then (.+)", replacement=r"if \1 then go ahead and \2")
    text = "if the sim is tired then sleep"
    assert rule.apply(text) == "if the sim is tired then go ahead and sleep"


def test_rule_priority():
    engine = RuleEngine()
    engine.add_rule(RewriteRule(pattern="foo", replacement="bar", priority=1))
    engine.add_rule(RewriteRule(pattern="foo", replacement="baz", priority=10))
    # Priority 10 should win because it's processed first if they overlap,
    # but since they target the same string, the first match transforms it.
    assert engine.process("foo") == "baz"


def test_rule_domain_filtering():
    engine = RuleEngine()
    engine.add_rule(RewriteRule(pattern="increase", replacement="boost", domain="skills"))
    engine.add_rule(RewriteRule(pattern="increase", replacement="turn up", domain="generic"))

    assert engine.process("increase", domain="skills") == "boost"
    assert engine.process("increase", domain="generic") == "turn up"
