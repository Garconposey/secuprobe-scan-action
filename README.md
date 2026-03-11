# SecuProbe Security Scan — GitHub Action

Run a [SecuProbe](https://secuprobe.io) security scan in your CI/CD pipeline and automatically fail the job if vulnerabilities above a configurable severity threshold are detected.

## Usage

```yaml
- name: SecuProbe Security Scan
  uses: Garconposey/secuprobe-scan-action@v1.0.0
  with:
    api_key: ${{ secrets.SECUPROBE_API_KEY }}
    url: https://your-app.com
    fail_on_severity: high
```

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

### Fail on any critical vulnerability
```yaml
steps:
  - uses: Garconposey/secuprobe-scan-action@v1.0.0
    with:
      api_key: ${{ secrets.SECUPROBE_API_KEY }}
      url: https://your-app.com
```

### Fail on high or critical vulnerabilities
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

### Use outputs in subsequent steps
```yaml
steps:
  - id: scan
    uses: Garconposey/secuprobe-scan-action@v1.0.0
    with:
      api_key: ${{ secrets.SECUPROBE_API_KEY }}
      url: https://your-app.com

  - name: Print score
    run: echo "SecuScore: ${{ steps.scan.outputs.secu_score }}/100"
```

## Setup

1. [Create a SecuProbe account](https://secuprobe.io) and subscribe to a Pro plan or higher.
2. Go to **Settings → API** and create an API key with the `scans:create` and `scans:read` scopes.
3. Add the key as a GitHub secret: **Settings → Secrets → Actions → New secret** → name it `SECUPROBE_API_KEY`.

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

## License

MIT
