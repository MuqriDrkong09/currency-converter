import { formatErrorMessage } from '../errorMessages'

describe('formatErrorMessage', () => {
  describe('falsy / empty input', () => {
    it('returns the fallback when error is null or undefined', () => {
      expect(formatErrorMessage(null)).toBe('Something went wrong.')
      expect(formatErrorMessage(undefined)).toBe('Something went wrong.')
    })

    it('returns the fallback when the Error message is empty / whitespace', () => {
      expect(formatErrorMessage(new Error(''))).toBe('Something went wrong.')
      expect(formatErrorMessage(new Error('   '))).toBe('Something went wrong.')
    })

    it('respects a custom fallback', () => {
      expect(formatErrorMessage(undefined, 'Could not load trend data.')).toBe(
        'Could not load trend data.',
      )
    })
  })

  describe('known patterns', () => {
    it('rewrites rate-limit errors to actionable copy', () => {
      expect(formatErrorMessage(new Error('Rate limited (429)'))).toMatch(/rate limit/i)
      expect(formatErrorMessage(new Error('Rate limited (429)'))).toMatch(/retry/i)
    })

    it('rewrites invalid access key errors to mention the env var', () => {
      const out = formatErrorMessage(new Error('invalid_access_key'))
      expect(out).toContain('VITE_EXCHANGERATE_HOST_ACCESS_KEY')
    })

    it('passes through the friendly "missing access key" message unchanged', () => {
      const raw = 'Missing exchangerate.host access key. Set VITE_EXCHANGERATE_HOST_ACCESS_KEY in a .env file.'
      expect(formatErrorMessage(new Error(raw))).toBe(raw)
    })

    it('appends a network hint to unreachable-host errors', () => {
      const out = formatErrorMessage(new Error('Unable to reach Frankfurter.'))
      expect(out).toMatch(/check your internet connection/i)
    })

    it('passes through "does not publish a rate" errors verbatim (already actionable)', () => {
      const raw = 'Frankfurter does not publish a rate for USD → XXX. Try another pair.'
      expect(formatErrorMessage(new Error(raw))).toBe(raw)
    })

    it('rewrites unexpected-response / invalid-response errors to a soft retry hint', () => {
      const out = formatErrorMessage(new Error('Unexpected conversion response from Frankfurter.'))
      expect(out).toMatch(/try again in a moment/i)
    })
  })

  describe('fall-through', () => {
    it('returns the raw message when no known pattern matches', () => {
      expect(formatErrorMessage(new Error('Some unknown problem.'))).toBe('Some unknown problem.')
    })

    it('coerces non-Error inputs to string', () => {
      expect(formatErrorMessage('plain string error')).toBe('plain string error')
    })
  })
})
