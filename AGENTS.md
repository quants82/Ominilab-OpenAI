# Ominilab repository instructions

## Canonical naming

- Product name: `Ominilab`.
- Domain and Unix identifiers: `ominilab`.
- Repository folders: `backend_Ominilab` and `frontend_Ominilab`.
- Do not reintroduce the legacy spellings `OmniLab`, `OminiLab`, or `omnilab`.

## Product boundary

Keep the standalone product limited to the six experiments listed in `docs/PROJECT_OVERVIEW.md`. Do not add Teacher/Student roles, PRO subscriptions, device ownership checks, encrypted firmware, marketing, quizzes, document generation, or unrelated VatLi365 features unless the user explicitly expands scope.

## Change workflow

1. Read `docs/PROJECT_OVERVIEW.md` and the task-specific document.
2. Inspect the working tree before editing and preserve unrelated user changes.
3. Update every affected layer: firmware, backend registry/API, frontend page/component, tests, and docs.
4. Keep OpenAI credentials server-side. Never commit `.env`, databases, tokens, private keys, or GitHub secret values.
5. Run `./ops/check-local.ps1` from PowerShell before committing. For documentation-only changes, also validate links and skill metadata.

## Backend

- Run backend commands with `backend_Ominilab` as the working directory because imports are module-local.
- Keep SQLite limited to data needed by the labs; the current schema contains only users.
- Authentication is intentionally simple, but passwords must remain hashed and protected routes must continue to require Bearer tokens.
- WebSocket device IDs must remain compatible with `^[A-Za-z0-9_-]{3,80}$`.

## Frontend and firmware

- The frontend is a static Astro build with React islands. Public runtime configuration uses `PUBLIC_API_URL`.
- Firmware is public MicroPython source. Do not add flash encryption, secure boot, subscription checks, device ownership validation, or hidden source delivery.
- Preserve the device-ID prefix shared by each firmware and its matching React component.
- Use desktop Chrome or Edge for WebSerial flashing.

## Production safety

- Read `docs/DEPLOYMENT.md` and `docs/OPERATIONS.md` before server changes.
- Do not manually edit generated `dist` files.
- Deploy through `/usr/local/sbin/deploy-ominilab` or the reviewed repository script.
- Back up configuration and the SQLite database before path, schema, or credential migrations.
- Verify the local health endpoint, public HTTPS health endpoint, frontend title, authentication, and relevant WebSocket path after deployment.
