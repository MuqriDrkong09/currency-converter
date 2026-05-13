import { formatMoney, formatRate, formatRateTimestamp } from '../format'

// Pin locale to make assertions deterministic across machines.
const LOCALE = 'en-US'

describe('formatMoney', () => {
  it('formats a positive USD amount with the en-US locale', () => {
    expect(formatMoney(1234.56, 'USD', LOCALE)).toBe('$1,234.56')
  })

  it('formats a EUR amount with the en-US locale (currency symbol prefixed)', () => {
    expect(formatMoney(99.5, 'EUR', LOCALE)).toBe('€99.50')
  })

  it('preserves up to six fractional digits for tiny values', () => {
    expect(formatMoney(0.012345, 'USD', LOCALE)).toBe('$0.012345')
  })

  it('handles zero amounts', () => {
    expect(formatMoney(0, 'USD', LOCALE)).toBe('$0.00')
  })
})

describe('formatRate', () => {
  it('limits significant digits to a sensible width', () => {
    // 8 significant digits is the configured cap.
    expect(formatRate(1.23456789, LOCALE)).toBe('1.2345679')
  })

  it('renders integer-like rates without trailing zeros', () => {
    expect(formatRate(1, LOCALE)).toBe('1')
  })

  it('renders small rates with full precision up to the configured cap', () => {
    expect(formatRate(0.001234, LOCALE)).toBe('0.001234')
  })
})

describe('formatRateTimestamp', () => {
  it('produces a non-empty, locale-appropriate string for a known unix timestamp', () => {
    // 2024-06-01T12:34:56Z — assert structural properties to stay locale-agnostic.
    const unix = 1717245296
    const out = formatRateTimestamp(unix, LOCALE)
    expect(typeof out).toBe('string')
    expect(out.length).toBeGreaterThan(0)
    // en-US `dateStyle: 'medium'` includes a comma between date and time.
    expect(out).toMatch(/,/)
  })
})
