# Operations and troubleshooting

## Daily health checks

```bash
systemctl status ominilab --no-pager
systemctl status nginx --no-pager
curl -fsS http://127.0.0.1:8010/api/lab/health
curl -fsS https://ominilab.vatli365.vn/api/lab/health
```

A healthy response has `"status":"ok"` and `"experiments":6`. Connection counters are in memory and may be zero when no hardware is online.

## Logs

```bash
journalctl -u ominilab.service -n 100 --no-pager
journalctl -u ominilab.service -f
tail -n 100 /var/log/nginx/ominilab.error.log
tail -n 100 /var/log/nginx/ominilab.access.log
```

## Authentication checks

```bash
TOKEN=$(curl -fsS -X POST https://ominilab.vatli365.vn/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"judge","password":"ominilab-demo"}' | \
  python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')

curl -fsS -H "Authorization: Bearer $TOKEN" \
  https://ominilab.vatli365.vn/api/auth/me

curl -fsS -H "Authorization: Bearer $TOKEN" \
  https://ominilab.vatli365.vn/api/lab/firmware

unset TOKEN
```

Avoid enabling shell tracing while handling tokens or secrets.

## Database backup

Stop the backend for the simplest consistent file copy:

```bash
BACKUP_DIR="/root/ominilab-backup-$(date +%Y%m%d-%H%M%S)"
install -d -m 0700 "$BACKUP_DIR"
systemctl stop ominilab
cp -a /var/www/ominilab.vatli365.vn/data/ominilab.db "$BACKUP_DIR/"
systemctl start ominilab
curl -fsS http://127.0.0.1:8010/api/lab/health
printf 'Backup: %s\n' "$BACKUP_DIR"
```

The database currently stores users only. Experiment telemetry and results are not stored.

## TLS

```bash
systemctl is-enabled certbot.timer
systemctl is-active certbot.timer
certbot renew --cert-name ominilab.vatli365.vn --dry-run
```

## Common failures

### Backend briefly refuses connections after restart

Uvicorn needs startup time. The deploy script retries health for 15 seconds; one or two initial `curl: (7)` messages followed by a successful health response are expected.

### Public site works but displays an old frontend

Check Nginx's root and the build timestamp:

```bash
grep -E '^[[:space:]]*root ' /etc/nginx/sites-available/ominilab.vatli365.vn
stat /var/www/ominilab.vatli365.vn/app/frontend_Ominilab/dist/index.html
nginx -t && systemctl reload nginx
```

The root must end in `frontend_Ominilab/dist`.

### GitHub Actions reports `base64: invalid input`

The secret must contain only the Base64 string generated from the private-key bytes:

```powershell
$keyPath = "$env:USERPROFILE\.ssh\ominilab_github_actions"
$bytes = [System.IO.File]::ReadAllBytes($keyPath)
$encoded = [Convert]::ToBase64String($bytes)
Set-Clipboard -Value $encoded
$encoded.Length
```

Paste the clipboard into repository secret `OMINILAB_SSH_PRIVATE_KEY_B64`. Do not paste the command, the public key, quotes, PowerShell prompt, length output, or Markdown fences. Reopen the secret editor, replace its entire value, save, then manually rerun the failed workflow.

### SSH host-key verification fails

Do not disable strict host checking. Verify the server's current ED25519 fingerprint through a trusted channel and update the pinned `known_hosts` line in the reviewed workflow only if the server host key genuinely changed.

### Login modal is clipped

The modal is rendered through a React portal into `document.body` and has viewport-bounded scrolling. Confirm the deployed commit includes that fix, rebuild the frontend, then hard-refresh the browser.

### Nginx emits unrelated `lab.vatli365.vn` conflicts

The server already has duplicate configuration warnings for another subdomain. They do not prevent Ominilab from serving when `nginx -t` succeeds, but they should be audited separately without changing Ominilab's server block.
