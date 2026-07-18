---
name: deploy-ominilab
description: Deploy, verify, troubleshoot, or recover the Ominilab production service at ominilab.vatli365.vn. Use for GitHub Actions deployment, manual SSH deployment, systemd, Nginx, TLS, production database/configuration backups, rollback, health checks, or deployment-key and host-key failures.
---

# Deploy Ominilab

## Read before acting

Read `../../../AGENTS.md`, `../../../docs/DEPLOYMENT.md`, `../../../docs/OPERATIONS.md`, and `../../../docs/CURRENT_STATUS.md` completely. Inspect the current Git state and CI run before changing code or server state.

Production actions can affect a live public service. Resolve exact paths with read-only checks, preserve unrelated sites on the shared server, and back up configuration/database before migrations.

## Choose the path

- For normal code delivery, validate locally, push `main`, and observe both GitHub Actions jobs.
- While automatic SSH deployment remains broken, use the documented manual SSH command and state that the deployment was manual.
- For CI key failure, repair only `OMINILAB_SSH_PRIVATE_KEY_B64` using the exact byte-to-Base64 procedure. Never print, log, commit, or request the private key in chat.
- For server failures, inspect service status, journal, Nginx error log, checkout state, and local health before modifying anything.
- For schema, path, naming, credential, service, or Nginx migrations, create a timestamped root-only backup first.

## Deploy

Use `/usr/local/sbin/deploy-ominilab`. It fast-forwards `main`, installs locked dependencies, compiles the backend, builds the frontend, restarts the service, and retries health.

Do not manually edit `dist`, disable strict SSH host-key checking, overwrite the environment file from Git, or use destructive Git resets on a dirty checkout.

## Verify independently

After the script succeeds, verify:

1. `ominilab.service` and Nginx are active.
2. Local `127.0.0.1:8010` health and public HTTPS health return six experiments.
3. The page title and OpenAPI title use `Ominilab`.
4. Judge login and the exact six-item firmware manifest work.
5. AI requests work when the OpenAI key or adapter changed.
6. Bidirectional secure WebSocket relay works when backend, Nginx, or firmware changed.
7. Certbot remains enabled when TLS/Nginx changed.

Do not treat the deploy script's final message as the only verification source.

## Recover and report

If health fails, stop further changes, collect the last 100 service log lines and relevant Nginx errors, and use the backup/rollback procedure in `DEPLOYMENT.md`. Report the deployed commit, deployment path (Actions or manual), checks performed, failures, and recovery state without exposing secrets.
