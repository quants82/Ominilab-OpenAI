# Current status

Last updated: 2026-07-19.

## Completed

- Standalone public repository renamed to `quants82/Ominilab-OpenAI`.
- Product, backend, frontend, server paths, database filename, demo password, and production title migrated to canonical `Ominilab`/`ominilab` naming.
- Exactly six experiments retained; unrelated backend and frontend features removed.
- Minimal login/register/JWT authentication and one-table SQLite database operational.
- Public MicroPython firmware and WebSerial flasher operational for five ESP32 families.
- FastAPI REST API, firmware bundles, OpenAI adapter, and bidirectional WebSocket relay operational.
- Production site deployed independently at `https://ominilab.vatli365.vn` behind Nginx and Let's Encrypt.
- Backend health, judge login, six-item firmware manifest, GPT-5.6 request, and bidirectional secure WebSocket relay verified on production.
- Certbot renewal timer enabled and dry-run successful.
- Local combined check script, production deployment script, backend smoke tests, and GitHub Actions validation added.
- Login modal moved outside the sticky header with viewport scrolling.
- Legacy frontend directory moved outside the Git checkout for recoverable cleanup.

## Known issues and next actions

1. **Automatic GitHub Actions deployment is not yet green.** Validation succeeds, but deployment fails at Base64 decoding of `OMINILAB_SSH_PRIVATE_KEY_B64`. Replace the repository secret using the exact byte-to-Base64 procedure in `OPERATIONS.md`, then rerun the workflow.
2. **Competition evidence is incomplete.** Replace the Codex Session ID placeholder in the root README before submission.
3. **Hardware regression testing remains manual.** Exercise every sensor, browser chart, flashing path, and device-prefix pairing on representative ESP32 boards before the final demonstration.
4. **WebSocket channels are unauthenticated.** This matches the current low-security competition scope, but device IDs should not be treated as secrets. Reassess only if the deployment becomes public beyond judging.
5. **Dependency audit reports known npm findings.** Review `npm audit` output and upgrade deliberately; do not use `npm audit fix --force` without testing for breaking changes.
6. **Legacy backup cleanup is deferred.** Keep `/root/ominilab-migration-20260719-024239` and `/var/www/ominilab.vatli365.vn/legacy/frontend_OmiLb-20260719` until the migration has been accepted and a separate backup policy exists.

## Recommended order

1. Repair and verify the GitHub Actions deployment secret.
2. Push and confirm automatic deployment end to end.
3. Complete six-experiment hardware acceptance testing.
4. Add the Codex Session ID and final competition evidence.
