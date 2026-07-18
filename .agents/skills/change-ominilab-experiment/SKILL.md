---
name: change-ominilab-experiment
description: Change an Ominilab physics experiment end to end across MicroPython firmware, backend firmware registry and bundles, WebSocket contracts, React analysis UI, Astro routes, tests, and documentation. Use when adding, removing, renaming, repairing, or changing the hardware, telemetry, calculations, charts, device ID, or flashing bundle for an experiment.
---

# Change an Ominilab experiment

## Read the contract

Read `../../../AGENTS.md`, `../../../docs/PROJECT_OVERVIEW.md`, `../../../docs/API_AND_DATA_FLOW.md`, and `../../../docs/ESP32_FIRMWARE.md`. Identify the current experiment ID, firmware source, helper files, page route, React component, device prefix, sensor payload, and expected analysis.

Do not exceed the approved six-experiment scope without explicit user direction.

## Map every affected layer

Check these locations before editing:

1. `../../../frontend_Ominilab/esp32/` for MicroPython and drivers.
2. `../../../backend_Ominilab/routers/lab.py` for `EXPERIMENTS`, bundles, base images, and relay behavior.
3. `../../../frontend_Ominilab/src/components/` for the WebSocket parser and analysis UI.
4. `../../../frontend_Ominilab/src/pages/` and the experiments listing/navigation.
5. `../../../backend_Ominilab/tests/test_smoke.py` for exact manifest expectations.
6. Project READMEs and `../../../docs/` for user and operator guidance.

## Preserve shared identifiers

The firmware and browser must construct the same device ID. Preserve or update both sides together. Keep IDs compatible with `^[A-Za-z0-9_-]{3,80}$`.

Treat telemetry field names and units as a versioned contract. If firmware changes a JSON field, prefix, unit, sampling rate, or event, update every parser and calculation in the same commit. Document browser-to-device commands such as `calib`.

## Keep firmware open and constrained

- Ship readable MicroPython and required helpers in the authenticated source bundle.
- Keep the experiment entry program mapped to `main.py`.
- Avoid CPython-only packages and unbounded allocations in sample loops.
- Preserve reconnect, missing-sensor, and Wi-Fi setup behavior.
- Never add encryption, secure boot requirements, device ownership, subscription checks, or secrets to firmware.

## Verify the full path

1. Run `../../../ops/check-local.ps1` from repository root.
2. Confirm `/api/lab/firmware` contains the intended exact six IDs.
3. Request the changed bundle and verify filenames, sizes, SHA-256 values, Base64 decoding, and public-host replacement.
4. Confirm frontend production build succeeds.
5. Test the WebSocket parser with representative frames and commands.
6. Test real ESP32 hardware for changes involving pins, buses, sensors, timing, calibration, power, or flashing.

Report hardware verification separately from software-only checks. Never infer successful sensor behavior from a frontend build.
