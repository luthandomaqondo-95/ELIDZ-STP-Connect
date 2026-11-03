/**
 * Shared helpers for dashboard/report charts.
 *
 * Months are bucketed by calendar month in SAST over a rolling 12-month window, so
 * Nov 2025 and Nov 2026 are never summed together.
 */

const REPORT_TIME_ZONE = "Africa/Johannesburg"

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: REPORT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
})

/** "YYYY-MM" for a timestamp, in SAST. Null for missing/invalid values. */
export function monthKey(value: string | Date | null | undefined): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return keyFormatter.format(date).slice(0, 7)
}

export type ReportMonth = { key: string; label: string }

/** The last 12 calendar months (oldest first), labelled like "Nov 25". */
export function lastTwelveMonths(now = new Date()): ReportMonth[] {
  const [year, month] = (monthKey(now) ?? "1970-01").split("-").map(Number)
  const months: ReportMonth[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(year, month - 1 - i, 1))
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("en-ZA", { month: "short", year: "2-digit", timeZone: "UTC" })
    months.push({ key, label })
  }
  return months
}

/** ISO timestamp for `days` days before now. */
export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

/** Count rows per month key over the rolling window. */
export function countByMonth<T>(rows: T[], getDate: (row: T) => string | null | undefined) {
  const counts: Record<string, number> = {}
  for (const row of rows) {
    const key = monthKey(getDate(row))
    if (key) counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

type RangeQuery<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

/**
 * Fetch every row of a query, page by page. PostgREST caps a single response at
 * 1,000 rows, which silently truncates chart breakdowns while exact counts keep growing.
 * `build(from, to)` must return a fresh query with `.range(from, to)` applied.
 */
export async function fetchAllRows<T>(
  build: (from: number, to: number) => RangeQuery<T>,
  pageSize = 1000
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(from, from + pageSize - 1)
    if (error) throw new Error(error.message)
    const page = data ?? []
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}
