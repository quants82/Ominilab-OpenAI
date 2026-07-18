# Ominilab: AI-Powered Open Physics Sandbox

Ominilab turns low-cost ESP32 hardware into an open physics laboratory. Users flash readable MicroPython source from the browser, stream real measurements through a FastAPI WebSocket relay, inspect live charts, and use GPT-5.6 for experiment-grounded feedback.

Production: [https://ominilab.vatli365.vn](https://ominilab.vatli365.vn)

Repository: [quants82/Ominilab-OpenAI](https://github.com/quants82/Ominilab-OpenAI)

## Competition scope

Only these six experiments are included:

1. Harmonic motion with BMI160
2. Specific heat capacity of water
3. Electromagnetic induction
4. Capacitor charge and discharge
5. Incandescent lamp I-V characteristic
6. Resistor I-V characteristic

The standalone edition contains simple authentication, a minimal SQLite user database, public firmware delivery, ESP32/browser WebSocket relay, and an OpenAI-powered assistant. It deliberately excludes Teacher/Student roles, PRO subscriptions, private device approval, encrypted firmware, quizzes, marketing, document generation, and unrelated VatLi365 modules.

## Architecture

```text
ESP32 MicroPython --WSS--> FastAPI relay --WSS--> Astro/React lab UI
                                                |
                                                +--> OpenAI Responses API
```

- [`backend_Ominilab`](./backend_Ominilab): FastAPI, SQLite authentication, firmware API, WebSockets, OpenAI adapter
- [`frontend_Ominilab`](./frontend_Ominilab): Astro/React UI, live charts, WebSerial flasher, public MicroPython source
- [`ops`](./ops): local verification and production deployment scripts
- [`.agents/skills`](./.agents/skills): reusable Codex project skills

## Documentation

- [Project overview and complete feature map](./docs/PROJECT_OVERVIEW.md)
- [Local development and testing](./docs/DEVELOPMENT.md)
- [API and data flow](./docs/API_AND_DATA_FLOW.md)
- [ESP32 firmware and flashing](./docs/ESP32_FIRMWARE.md)
- [Production deployment](./docs/DEPLOYMENT.md)
- [Operations and troubleshooting](./docs/OPERATIONS.md)
- [Current status and remaining work](./docs/CURRENT_STATUS.md)

## Quick start on Windows

```powershell
Set-Location "D:\Ominilab-OpenAI"

py -3.13 -m venv .\backend_Ominilab\.venv
.\backend_Ominilab\.venv\Scripts\python.exe -m pip install -r .\backend_Ominilab\requirements.txt
Copy-Item .\backend_Ominilab\.env.example .\backend_Ominilab\.env

npm --prefix .\frontend_Ominilab ci
Copy-Item .\frontend_Ominilab\.env.example .\frontend_Ominilab\.env
```

Run the backend and frontend in separate PowerShell windows:

```powershell
Set-Location "D:\Ominilab-OpenAI\backend_Ominilab"
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

```powershell
Set-Location "D:\Ominilab-OpenAI"
npm --prefix .\frontend_Ominilab run dev
```

Open `http://localhost:3003`; the API documentation is at `http://localhost:8000/docs`.

Before committing, run:

```powershell
.\ops\check-local.ps1
```

## Demo access

The backend seeds a public judge account from `DEMO_USERNAME` and `DEMO_PASSWORD`. The documented demo values are `judge` / `ominilab-demo`. Production secrets and the OpenAI key stay in the server environment and are never committed.

## License and openness

Released under the [MIT License](./LICENSE). ESP32 programs are stored as readable source and uploaded without application-level encryption or secure boot requirements.

## Competition evidence

Codex Session ID: `[add session ID before submission]`
