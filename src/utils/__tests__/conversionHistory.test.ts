import {
  appendConversionHistory,
  clearConversionHistory,
  readConversionHistory,
  removeConversionHistoryEntry,
} from '../conversionHistory'

const STORAGE_KEY = 'currency-converter:conversion-history'

beforeEach(() => {
  localStorage.clear()
})

describe('readConversionHistory', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(readConversionHistory()).toEqual([])
  })

  it('returns an empty list when stored value is corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')
    expect(readConversionHistory()).toEqual([])
  })

  it('filters out malformed entries while keeping valid ones', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'a', from: 'USD', to: 'EUR', amount: 100, createdAt: 1 },
        { id: 'b', from: 'USD', to: 'EUR', amount: 'not-a-number', createdAt: 2 },
        null,
        { id: 'c', from: 'USD', to: 'EUR', amount: 50, createdAt: 3 },
      ]),
    )

    const entries = readConversionHistory()
    expect(entries.map((e) => e.id)).toEqual(['a', 'c'])
  })
})

describe('appendConversionHistory', () => {
  it('prepends a new entry with a generated id and timestamp', () => {
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 100 })
    const history = readConversionHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({ from: 'USD', to: 'EUR', amount: 100 })
    expect(typeof history[0].id).toBe('string')
    expect(history[0].createdAt).toBeGreaterThan(0)
  })

  it('caps the stored list at 10 entries', () => {
    // Spread the inserts over 1ms so the dedupe window is irrelevant.
    for (let i = 0; i < 15; i++) {
      appendConversionHistory({ from: 'USD', to: 'EUR', amount: i + 1 })
    }
    expect(readConversionHistory()).toHaveLength(10)
  })

  it('dedupes the same pair+amount inside the dedupe window', () => {
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 100 })
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 100 })
    expect(readConversionHistory()).toHaveLength(1)
  })

  it('does not dedupe when amount or pair differs', () => {
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 100 })
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 200 })
    appendConversionHistory({ from: 'USD', to: 'GBP', amount: 100 })
    expect(readConversionHistory()).toHaveLength(3)
  })

  it('dedupes against the latest entry only, not the entire list', () => {
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 100 })
    appendConversionHistory({ from: 'USD', to: 'JPY', amount: 50 })
    // Same as the *first* entry but not the head — should be inserted.
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 100 })
    expect(readConversionHistory()).toHaveLength(3)
  })
})

describe('removeConversionHistoryEntry', () => {
  it('removes the entry with the given id', () => {
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 100 })
    appendConversionHistory({ from: 'USD', to: 'GBP', amount: 50 })
    const [first] = readConversionHistory()
    removeConversionHistoryEntry(first.id)
    const after = readConversionHistory()
    expect(after).toHaveLength(1)
    expect(after.some((e) => e.id === first.id)).toBe(false)
  })

  it('is a no-op for an unknown id', () => {
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 100 })
    removeConversionHistoryEntry('does-not-exist')
    expect(readConversionHistory()).toHaveLength(1)
  })
})

describe('clearConversionHistory', () => {
  it('removes all entries', () => {
    appendConversionHistory({ from: 'USD', to: 'EUR', amount: 100 })
    appendConversionHistory({ from: 'USD', to: 'GBP', amount: 50 })
    clearConversionHistory()
    expect(readConversionHistory()).toEqual([])
  })
})
