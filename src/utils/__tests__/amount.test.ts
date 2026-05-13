import { parsePositiveAmount } from '../amount'

describe('parsePositiveAmount', () => {
  describe('empty inputs', () => {
    it('returns undefined for an empty string', () => {
      expect(parsePositiveAmount('')).toBeUndefined()
    })

    it('returns undefined for whitespace-only input', () => {
      expect(parsePositiveAmount('   ')).toBeUndefined()
      expect(parsePositiveAmount('\t\n')).toBeUndefined()
    })
  })

  describe('valid numbers', () => {
    it('parses integers', () => {
      expect(parsePositiveAmount('42')).toBe(42)
      expect(parsePositiveAmount('1000000')).toBe(1_000_000)
    })

    it('parses decimal numbers with a dot', () => {
      expect(parsePositiveAmount('3.14')).toBeCloseTo(3.14)
      expect(parsePositiveAmount('0.5')).toBe(0.5)
    })

    it('parses decimal numbers using comma as the decimal separator', () => {
      // European-locale input — must be accepted to match the live UI behaviour.
      expect(parsePositiveAmount('3,14')).toBeCloseTo(3.14)
      expect(parsePositiveAmount('0,5')).toBe(0.5)
    })

    it('accepts zero', () => {
      expect(parsePositiveAmount('0')).toBe(0)
      expect(parsePositiveAmount('0.0')).toBe(0)
    })

    it('trims surrounding whitespace before parsing', () => {
      expect(parsePositiveAmount('  12.34  ')).toBeCloseTo(12.34)
    })
  })

  describe('invalid inputs', () => {
    it('returns undefined for negative numbers', () => {
      expect(parsePositiveAmount('-1')).toBeUndefined()
      expect(parsePositiveAmount('-0.0001')).toBeUndefined()
    })

    it('returns undefined for non-numeric strings', () => {
      expect(parsePositiveAmount('abc')).toBeUndefined()
      expect(parsePositiveAmount('12abc')).toBeUndefined()
    })

    it('returns undefined for non-finite numbers', () => {
      expect(parsePositiveAmount('Infinity')).toBeUndefined()
      expect(parsePositiveAmount('NaN')).toBeUndefined()
    })
  })
})
