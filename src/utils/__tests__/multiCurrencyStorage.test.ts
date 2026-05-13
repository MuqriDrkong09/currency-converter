import {
  MULTI_TARGETS_MAX,
  addMultiTarget,
  readMultiTargets,
  removeMultiTarget,
  writeMultiTargets,
} from '../multiCurrencyStorage'

const STORAGE_KEY = 'currency-converter:multi-targets'
const DEFAULTS = ['EUR', 'GBP', 'JPY', 'MYR', 'SGD', 'AUD']

beforeEach(() => {
  localStorage.clear()
})

describe('readMultiTargets', () => {
  it('returns defaults when the key is missing', () => {
    expect(readMultiTargets()).toEqual(DEFAULTS)
  })

  it('returns an empty array when the user has explicitly cleared the list', () => {
    writeMultiTargets([])
    expect(readMultiTargets()).toEqual([])
  })

  it('uppercases and dedupes codes', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['eur', 'EUR', 'gbp']))
    expect(readMultiTargets()).toEqual(['EUR', 'GBP'])
  })

  it('drops entries that do not look like ISO codes', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(['EUR', 'invalid', 12, '', null, 'GB', 'GBPX', 'GBP']),
    )
    expect(readMultiTargets()).toEqual(['EUR', 'GBP'])
  })

  it('returns defaults when stored payload is malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, '<<<')
    expect(readMultiTargets()).toEqual(DEFAULTS)
  })

  it('caps the returned list at MULTI_TARGETS_MAX', () => {
    // Build MULTI_TARGETS_MAX + 5 unique 3-letter codes (AAA, ABA, ACA, ...).
    const many = Array.from({ length: MULTI_TARGETS_MAX + 5 }, (_, i) => {
      const a = String.fromCharCode(65 + Math.floor(i / 26))
      const b = String.fromCharCode(65 + (i % 26))
      return `${a}${b}A`
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(many))
    expect(readMultiTargets().length).toBe(MULTI_TARGETS_MAX)
  })
})

describe('addMultiTarget', () => {
  it('appends a new code', () => {
    writeMultiTargets([])
    addMultiTarget('CHF')
    expect(readMultiTargets()).toEqual(['CHF'])
  })

  it('uppercases on insert', () => {
    writeMultiTargets([])
    addMultiTarget('chf')
    expect(readMultiTargets()).toEqual(['CHF'])
  })

  it('is a no-op when the code already exists', () => {
    writeMultiTargets(['EUR'])
    addMultiTarget('EUR')
    expect(readMultiTargets()).toEqual(['EUR'])
  })

  it('rejects malformed codes', () => {
    writeMultiTargets([])
    addMultiTarget('invalid')
    addMultiTarget('CH')
    addMultiTarget('CHFX')
    expect(readMultiTargets()).toEqual([])
  })

  it('respects the maximum length', () => {
    const filled = Array.from({ length: MULTI_TARGETS_MAX }, (_, i) => {
      const a = String.fromCharCode(65 + Math.floor(i / 26))
      const b = String.fromCharCode(65 + (i % 26))
      return `${a}${b}A`
    })
    writeMultiTargets(filled)
    addMultiTarget('ZZZ')
    expect(readMultiTargets().length).toBe(MULTI_TARGETS_MAX)
    expect(readMultiTargets()).not.toContain('ZZZ')
  })
})

describe('removeMultiTarget', () => {
  it('removes the matching code (case-insensitive)', () => {
    writeMultiTargets(['EUR', 'GBP', 'JPY'])
    removeMultiTarget('gbp')
    expect(readMultiTargets()).toEqual(['EUR', 'JPY'])
  })
})
