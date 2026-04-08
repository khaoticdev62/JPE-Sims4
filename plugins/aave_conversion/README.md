# AAVE Conversion (AAVEPack) — JPE Plugin

This plugin provides:
- **Normalization**: AAVE-ish JPE → canonical JPE (deterministic, diagnostic-rich)
- **Rendering**: canonical JPE → AAVE-ish JPE (register-controlled)
- **Dictionary modal**: pretty-printed CLI + optional Textual TUI modal
- **Lint + suggest**: ambiguity checks, blocked-term checks, completion-like suggestions

## CLI

```bash
python -m aave_conversion.cli --help
```

## Packs

Packs live in `aave_conversion/dictionary/*.pack.yaml`.
Validate them with:

```bash
python -m aave_conversion.cli validate-pack aave_conversion/dictionary/core.pack.yaml
```

## Keyword locking

Keywords are locked by default in packs to avoid parser weirdness.
You can override per-entry in the pack if you really mean it (and accept the chaos).
