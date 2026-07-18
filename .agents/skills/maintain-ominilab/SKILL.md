---
name: maintain-ominilab
description: Maintain and extend the Ominilab repository while preserving its six-experiment competition scope, canonical naming, open firmware, minimal backend, and verification requirements. Use for cross-cutting code changes, bug fixes, refactors, documentation updates, dependency changes, or repository reviews involving backend_Ominilab, frontend_Ominilab, ops, tests, or docs.
---

# Maintain Ominilab

## Establish context

1. Read `../../../AGENTS.md` and `../../../docs/PROJECT_OVERVIEW.md` completely.
2. Read the task-specific document: `DEVELOPMENT.md`, `API_AND_DATA_FLOW.md`, `ESP32_FIRMWARE.md`, `DEPLOYMENT.md`, or `OPERATIONS.md`.
3. Inspect `git status -sb`, the affected files, and existing tests before editing.
4. Preserve unrelated user changes and remain inside the requested scope.

## Protect project invariants

- Use `Ominilab` for the product, `ominilab` for the domain/Unix identifiers, and the exact folders `backend_Ominilab` and `frontend_Ominilab`.
- Keep exactly the six approved experiments unless the user explicitly changes scope.
- Keep firmware readable and public. Do not add ownership checks, subscription validation, flash encryption, secure boot, or hidden application binaries.
- Keep OpenAI keys, JWT secrets, databases, tokens, SSH keys, and environment files out of Git.
- Keep the backend database minimal and avoid new roles, subscription entities, or unrelated application modules.

## Implement coherently

Trace the feature across all consumers before changing a contract. For REST or WebSocket changes, update the backend, frontend service/parser, tests, and relevant docs in one change. For experiment changes, use `$change-ominilab-experiment`.

Prefer the smallest change that solves the request. Do not edit generated frontend `dist`, installed dependencies, local virtual environments, or production-only secrets.

## Verify

Run from repository root on Windows:

```powershell
.\ops\check-local.ps1
git diff --check
git status -sb
```

For documentation and skill changes, additionally check all referenced paths and run the skill validator on every changed skill. For production-facing changes, follow the verification matrix in `../../../docs/DEPLOYMENT.md`.

## Report

Summarize the outcome first, identify changed layers, list verification actually completed, and state any untested hardware or production behavior. Never describe automatic deployment as successful unless the GitHub Actions deploy job and public health check both passed.
