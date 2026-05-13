import {
  addFavoritePair,
  isFavoritePair,
  pairKey,
  readFavoritePairs,
  removeFavoritePair,
  toggleFavoritePair,
  writeFavoritePairs,
} from '../favoritePairs'

beforeEach(() => {
  localStorage.clear()
})

describe('pairKey', () => {
  it('joins from and to with >', () => {
    expect(pairKey({ from: 'USD', to: 'EUR' })).toBe('USD>EUR')
  })
})

describe('readFavoritePairs', () => {
  it('returns an empty list by default', () => {
    expect(readFavoritePairs()).toEqual([])
  })

  it('returns an empty list when stored value is invalid JSON', () => {
    localStorage.setItem('currency-converter:favorite-pairs', 'not-json')
    expect(readFavoritePairs()).toEqual([])
  })

  it('dedupes entries by pair key', () => {
    writeFavoritePairs([
      { from: 'USD', to: 'EUR' },
      { from: 'USD', to: 'EUR' },
      { from: 'EUR', to: 'GBP' },
    ])
    const list = readFavoritePairs()
    expect(list).toEqual([
      { from: 'USD', to: 'EUR' },
      { from: 'EUR', to: 'GBP' },
    ])
  })
})

describe('addFavoritePair', () => {
  it('inserts a new pair at the top', () => {
    addFavoritePair({ from: 'USD', to: 'EUR' })
    addFavoritePair({ from: 'EUR', to: 'GBP' })
    expect(readFavoritePairs()[0]).toEqual({ from: 'EUR', to: 'GBP' })
  })

  it('moves an existing pair to the top instead of duplicating it', () => {
    addFavoritePair({ from: 'USD', to: 'EUR' })
    addFavoritePair({ from: 'EUR', to: 'GBP' })
    addFavoritePair({ from: 'USD', to: 'EUR' })
    const list = readFavoritePairs()
    expect(list).toEqual([
      { from: 'USD', to: 'EUR' },
      { from: 'EUR', to: 'GBP' },
    ])
  })

  it('ignores pairs where from === to', () => {
    addFavoritePair({ from: 'USD', to: 'USD' })
    expect(readFavoritePairs()).toEqual([])
  })

  it('caps the list at 24 entries', () => {
    for (let i = 0; i < 30; i++) {
      addFavoritePair({ from: 'AAA', to: `Z${(i % 100).toString().padStart(2, '0')}` })
    }
    expect(readFavoritePairs().length).toBeLessThanOrEqual(24)
  })
})

describe('removeFavoritePair', () => {
  it('removes the matching pair', () => {
    addFavoritePair({ from: 'USD', to: 'EUR' })
    addFavoritePair({ from: 'EUR', to: 'GBP' })
    removeFavoritePair({ from: 'USD', to: 'EUR' })
    expect(readFavoritePairs()).toEqual([{ from: 'EUR', to: 'GBP' }])
  })
})

describe('isFavoritePair / toggleFavoritePair', () => {
  it('toggles a pair on and off', () => {
    const pair = { from: 'USD', to: 'MYR' }
    expect(isFavoritePair(pair)).toBe(false)
    expect(toggleFavoritePair(pair)).toBe(true)
    expect(isFavoritePair(pair)).toBe(true)
    expect(toggleFavoritePair(pair)).toBe(false)
    expect(isFavoritePair(pair)).toBe(false)
  })

  it('toggling a same-currency pair has no effect', () => {
    expect(toggleFavoritePair({ from: 'USD', to: 'USD' })).toBe(false)
    expect(readFavoritePairs()).toEqual([])
  })
})
