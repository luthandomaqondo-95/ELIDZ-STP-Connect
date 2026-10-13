/**
 * Public site origin for redirects (invite, recovery, OAuth).
 * Set NEXT_PUBLIC_APP_URL in production (e.g. https://elidzconnect.vercel.app).
 * On Vercel, VERCEL_URL is a fallback if NEXT_PUBLIC_APP_URL was missing at build time.
 */
export function getAppOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
  return "http://localhost:3000"
}
