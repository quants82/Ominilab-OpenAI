# API and data flow

Local base URL is `http://localhost:8000`; production is `https://ominilab.vatli365.vn`.

## Authentication

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Create user and return JWT |
| `POST` | `/api/auth/login` | No | Validate credentials and return JWT |
| `GET` | `/api/auth/me` | Bearer | Return current public user |

Credential payload:

```json
{"username":"judge","password":"ominilab-demo"}
```

Usernames are normalized to lowercase, must be 3–40 characters, and allow letters, numbers, `_`, `.`, and `-`. Passwords must be 6–128 characters. Passwords use PBKDF2-SHA256; JWTs use HS256 and expire according to `ACCESS_TOKEN_MINUTES`.

## Lab and firmware API

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/lab/health` | No | Service and in-memory connection counts |
| `GET` | `/api/lab/firmware` | Bearer | Six experiments and supported ESP32 base images |
| `GET` | `/api/lab/firmware/{experiment_id}/bundle` | Bearer | Base64 public source files with hashes |

The source bundle renames the experiment program to `main.py`, includes required helpers, and replaces `your-backend.example.com` with `PUBLIC_WS_HOST`. It does not encrypt the files.

## OpenAI API

`POST /api/ai/explain` requires a Bearer token.

```json
{
  "messages": [
    {"role": "user", "content": "Explain this measured period."}
  ],
  "max_tokens": 800
}
```

The endpoint accepts 1–20 messages with `system`, `user`, or `assistant` roles and 100–2000 output tokens. The backend calls the OpenAI Responses API with the server-configured model, then returns a small Chat Completions-compatible `choices` wrapper. The client cannot override `OPENAI_MODEL`.

## WebSocket relay

```text
/api/lab/ws/esp32/{device_id}  <--> in-memory relay <-->  /api/lab/ws/client/{device_id}
```

- Device IDs allow 3–80 letters, numbers, underscores, or hyphens.
- A new ESP32 connection replaces the previous ESP32 using the same ID.
- Multiple browser clients can observe one device.
- Text frames pass through unchanged in both directions.
- WebSocket endpoints currently do not require a JWT; the device ID acts as the channel selector.
- Connections and telemetry are not persisted.

## Experiment messages

| Experiment | ESP32 to browser |
| --- | --- |
| Harmonic motion | Events for calibration/online/start/stop; samples `{"t":...,"ax":...,"ay":...,"az":...,"gm":...}` |
| Specific heat | `RESULT={"t":...,"temp":...,"P":...,"cmd":...}` |
| Induction | `{"v":...}` |
| Capacitor | `{"v":...,"i":...,"sw":0|1}` |
| Lamp I-V | `{"u":...,"i":...,"m":"REAL"}` |
| Resistor I-V | `{"u":...,"i":...,"m":"REAL"}` |

The harmonic-motion browser may send `calib`; browser-to-device forwarding is generic and can carry future text commands.

## Request flow

1. The frontend signs in and stores `jwt_token` in local storage.
2. Protected REST calls add `Authorization: Bearer <token>`.
3. The flasher requests a manifest and experiment bundle, flashes the selected MicroPython base image, and uploads the readable source files through WebSerial.
4. Firmware connects to the ESP32 WebSocket route using its prefixed MAC identifier.
5. The experiment page connects to the client route using the same identifier.
6. FastAPI relays frames; React calculates and renders experiment-specific results.
