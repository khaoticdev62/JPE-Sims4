# Security & Safety

## Archive Handling (Zip Safety)

The app treats `.zip` inputs as untrusted by default.

- **Path traversal prevention:** zip members with absolute paths, drive letters, or `..` segments emit `E_ZIP_PATH_TRAVERSAL` and are never extracted/written to unsafe locations.
- **Zip bomb protection:** the scanner/reader enforces limits on member count, total uncompressed size, per-entry size, and suspicious compression ratios.

Env overrides (optional):

- `JPE_MAX_ZIP_FILES` (default: 25000)
- `JPE_MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES` (default: 1500000000)
- `JPE_MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES` (default: 75000000)
- `JPE_MAX_ZIP_INFLATE_RATIO` (default: 200.0)

If a mod legitimately exceeds these limits, raise them locally (do not hardcode higher limits into commits without discussion).

## Output Safety

- Builds never overwrite the source input; unsafe output paths emit `E_UNSAFE_OUTPUT` / `E_UNSAFE_PATH`.
- Prefer building into an empty folder or new zip; backups are created when overwriting existing outputs.

## Secrets & Configuration

- Do not commit secrets (API keys, tokens, credentials). Use environment variables and local settings files.
- Keep local `.env` files out of the repo (already ignored in `.gitignore`).

## Error Reporting

Diagnostics are designed to be actionable: messages include remediation steps (e.g., “re-zip without `..` paths”, “increase `JPE_MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES`”).

