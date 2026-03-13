# SecuProbe Security Scan — GitHub Action

[![Version](https://img.shields.io/badge/version-v1.0.0-blue)](https://github.com/Garconposey/secuprobe-scan-action/releases/tag/v1.0.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![SecuProbe](https://img.shields.io/badge/Powered%20by-SecuProbe-cyan)](https://secuprobe.io)

**Catch vulnerabilities before they reach production — free for your first 10 scans.**

Automatically audit your website's security posture on every deploy. SecuProbe runs a full security scan and fails your CI job if vulnerabilities above a configurable severity are detected.

## Quick Start

```yaml
- name: SecuProbe Security Scan
  uses: Garconposey/secuprobe-scan-action@v1.0.0
  with:
    api_key: ${{ secrets.SECUPROBE_API_KEY }}
    url: https://your-app.com
    fail_on_severity: high
```

## What It Checks

| Category | Checks |
|----------|--------|
| **SQL Injection** | Error-based, Boolean-blind, SSTI |
| **XSS** | Reflected XSS (advanced payloads) |
| **HTTP Headers** | CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| **SSL / TLS** | Certificate validity, weak ciphers, protocol versions, HSTS preload |
| **OWASP** | CSRF, open redirects, security misconfigurations |
| **Sensitive Files** | `.env`, `.git`, backup files, admin panels exposed |
| **Supply Chain** | Subresource Integrity (SRI) on external scripts |
| **CORS** | Misconfigured Access-Control-Allow-Origin |
| **Auth Security** | Cookie flags, login security headers |
| **CVE Lookup** | Known vulnerabilities on detected technologies |

Each scan produces a **SecuScore (0–100)** with a severity breakdown and remediation guides.

## Setup

1. **[Create a free SecuProbe account](https://secuprobe.io/register)** — no credit card required. Includes 10 free API scans.
2. Go to **Dashboard → Settings → API** and create an API key.
3. Add the key as a GitHub secret: **Settings → Secrets → Actions → New secret** → name it `SECUPROBE_API_KEY`.
4. Add the action to your workflow (see examples below).

> **Pro plan** unlocks unlimited API scans, PDF executive reports, monitoring, webhooks, and more.

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api_key` | ✅ | — | Your SecuProbe API key (`sp_live_...`). Store it as a GitHub secret. |
| `url` | ✅ | — | The URL to scan. |
| `fail_on_severity` | ❌ | `critical` | Minimum severity that fails the job: `critical`, `high`, `medium`, `low`, or `none`. |
| `timeout` | ❌ | `600` | Maximum time in seconds to wait for the scan to complete. |

## Outputs

| Output | Description |
|--------|-------------|
| `scan_id` | The SecuProbe scan ID (UUID). |
| `secu_score` | The SecuScore (0–100). |
| `report_url` | URL to the full scan report on SecuProbe. |

## Examples

### Fail on any high or critical vulnerability
```yaml
steps:
  - uses: Garconposey/secuprobe-scan-action@v1.0.0
    with:
      api_key: ${{ secrets.SECUPROBE_API_KEY }}
      url: https://your-app.com
      fail_on_severity: high
```

### Scan only — never fail the job
```yaml
steps:
  - uses: Garconposey/secuprobe-scan-action@v1.0.0
    with:
      api_key: ${{ secrets.SECUPROBE_API_KEY }}
      url: https://your-app.com
      fail_on_severity: none
```

### Use scan outputs in subsequent steps
```yaml
steps:
  - id: scan
    uses: Garconposey/secuprobe-scan-action@v1.0.0
    with:
      api_key: ${{ secrets.SECUPROBE_API_KEY }}
      url: https://your-app.com

  - name: Print score
    run: echo "SecuScore ${{ steps.scan.outputs.secu_score }}/100 — Report: ${{ steps.scan.outputs.report_url }}"
```

### Full workflow example
```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - name: SecuProbe Security Scan
        uses: Garconposey/secuprobe-scan-action@v1.0.0
        with:
          api_key: ${{ secrets.SECUPROBE_API_KEY }}
          url: https://your-app.com
          fail_on_severity: high
```

## Job Summary

After each scan, the action writes a summary to the GitHub Actions job page:

| Metric | Value |
|--------|-------|
| SecuScore | 84/100 |
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 7 |
| URL | https://your-app.com |
| Report | [View full report](https://secuprobe.io) |

## Free Trial

New accounts include **10 free API scans** — enough to integrate SecuProbe into your CI/CD and see real results before committing to a plan.

After 10 scans, upgrade to **Pro** for unlimited scanning, team access, scheduled monitoring, PDF reports, and webhooks.

[→ View pricing](https://secuprobe.io/pricing)

## License

MIT
