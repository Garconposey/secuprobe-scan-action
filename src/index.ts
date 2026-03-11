import * as core from '@actions/core'

const BASE_URL = 'https://secuprobe.io'
const POLL_INTERVAL_MS = 10_000

const SEVERITY_LEVELS: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
}

interface ScanResult {
  id: string
  status: string
  secuScore: number | null
  url: string
  vulnerabilities?: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
}

async function fetchJson<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

function buildJobSummary(result: ScanResult, reportUrl: string): string {
  const v = result.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  const rows = [
    ['SecuScore', `${result.secuScore ?? 'N/A'}/100`],
    ['Critical', String(v.critical)],
    ['High', String(v.high)],
    ['Medium', String(v.medium)],
    ['Low', String(v.low)],
    ['URL', result.url],
  ]

  const table = [
    '| Metric | Value |',
    '|--------|-------|',
    ...rows.map(([k, v]) => `| ${k} | ${v} |`),
  ].join('\n')

  return `## SecuProbe Security Scan Results\n\n${table}\n\n[View Full Report](${reportUrl})\n`
}

async function run(): Promise<void> {
  const apiKey = core.getInput('api_key', { required: true })
  const url = core.getInput('url', { required: true })
  const failOnSeverity = core.getInput('fail_on_severity') || 'critical'
  const timeoutSec = parseInt(core.getInput('timeout') || '600', 10)

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  core.info(`[SecuProbe] Starting scan for ${url}`)
  core.info(`[SecuProbe] Fail on severity: ${failOnSeverity}, timeout: ${timeoutSec}s`)

  // Create scan
  const createRes = await fetchJson<{ scanId: string }>(`${BASE_URL}/api/v1/scans`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url }),
  })

  const scanId = createRes.scanId
  core.info(`[SecuProbe] Scan created: ${scanId}`)
  core.setOutput('scan_id', scanId)

  const reportUrl = `${BASE_URL}/dashboard/scans/${scanId}`
  core.setOutput('report_url', reportUrl)

  // Poll until completed
  const deadline = Date.now() + timeoutSec * 1000
  let result: ScanResult | null = null

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

    const scan = await fetchJson<{ scan: ScanResult }>(`${BASE_URL}/api/v1/scans/${scanId}`, { headers })
    const status = scan.scan.status

    core.info(`[SecuProbe] Scan status: ${status}`)

    if (status === 'completed') {
      result = scan.scan
      break
    }
    if (status === 'failed') {
      core.setFailed(`[SecuProbe] Scan failed for ${url}`)
      return
    }
  }

  if (!result) {
    core.setFailed(`[SecuProbe] Scan timed out after ${timeoutSec}s`)
    return
  }

  core.setOutput('secu_score', String(result.secuScore ?? 0))

  // Write job summary
  const summary = buildJobSummary(result, reportUrl)
  await core.summary.addRaw(summary).write().catch(() => {})

  core.info(`[SecuProbe] SecuScore: ${result.secuScore}/100`)
  core.info(`[SecuProbe] Report: ${reportUrl}`)

  // Check fail_on_severity
  if (failOnSeverity === 'none') return

  const threshold = SEVERITY_LEVELS[failOnSeverity] ?? 4
  const v = result.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0, info: 0 }

  const hasViolation =
    (threshold <= 4 && v.critical > 0) ||
    (threshold <= 3 && v.high > 0) ||
    (threshold <= 2 && v.medium > 0) ||
    (threshold <= 1 && v.low > 0)

  if (hasViolation) {
    core.setFailed(
      `[SecuProbe] Vulnerabilities above "${failOnSeverity}" severity detected. See ${reportUrl}`
    )
  }
}

run().catch((err) => {
  core.setFailed(`[SecuProbe] Unexpected error: ${err.message}`)
})
