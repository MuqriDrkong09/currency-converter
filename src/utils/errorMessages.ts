/**
 * Produce a consistent, user-facing error message from any error value.
 *
 * Returns terse but actionable copy. Known phrases coming back from the
 * underlying APIs (rate limit, invalid access key, unreachable host, malformed
 * payload, etc.) are normalised so the UI speaks in one voice regardless of
 * which provider produced the error.
 */
export function formatErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (!error) return fallback
  const raw = error instanceof Error ? error.message : String(error)
  if (!raw.trim()) return fallback

  const lower = raw.toLowerCase()

  if (lower.includes('rate limit') || lower.includes('429')) {
    return 'Rate limit reached for the currency service. Wait a minute, then retry.'
  }

  // Order matters: the friendlier "missing key" message itself mentions
  // `ACCESS_KEY`, so we must short-circuit on it before the generic match.
  if (lower.includes('missing exchangerate.host access key')) {
    return raw
  }

  if (lower.includes('invalid_access_key') || lower.includes('access_key')) {
    return 'The exchangerate.host access key is invalid or missing. Update VITE_EXCHANGERATE_HOST_ACCESS_KEY and restart the dev server.'
  }

  if (lower.includes('unable to reach') || lower.includes('network')) {
    return `${raw} Try again, or check your internet connection.`
  }

  if (lower.includes('does not publish a rate')) {
    return raw
  }

  if (lower.includes('invalid response') || lower.includes('unexpected')) {
    return 'The currency service returned an unexpected response. Try again in a moment.'
  }

  return raw
}
