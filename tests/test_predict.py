from __future__ import annotations

from jpe_sims4.predict import predict_targets


def test_predict_targets_prefers_tm() -> None:
    tm = [
        {"id": "1", "source": "Hello", "target": "Bonjour"},
        {"id": "2", "source": "Hello there", "target": "Bonjour là"},
        {"id": "3", "source": "Other", "target": "Autre"},
    ]
    preds = predict_targets(tm, source="Hello", partial_target="", limit=3, min_tm_score=70)
    assert preds
    assert preds[0].target == "Bonjour"
    assert preds[0].reason == "tm"


def test_predict_targets_respects_partial_prefix() -> None:
    tm = [
        {"id": "1", "source": "Hello", "target": "Bonjour"},
        {"id": "2", "source": "Hello", "target": "Salut"},
    ]
    preds = predict_targets(tm, source="Hello", partial_target="Bon", limit=5, min_tm_score=70)
    assert preds and all(p.target.lower().startswith("bon") for p in preds)

