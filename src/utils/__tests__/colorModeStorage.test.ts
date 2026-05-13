import { readColorMode, writeColorMode } from '../colorModeStorage'

const STORAGE_KEY = 'currency-converter:color-mode'

beforeEach(() => {
  localStorage.clear()
})

describe('readColorMode', () => {
  it('defaults to dark when nothing is stored', () => {
    expect(readColorMode()).toBe('dark')
  })

  it('returns the stored value when it is a valid mode', () => {
    localStorage.setItem(STORAGE_KEY, 'light')
    expect(readColorMode()).toBe('light')
  })

  it('falls back to default when stored value is unrecognised', () => {
    localStorage.setItem(STORAGE_KEY, 'sepia')
    expect(readColorMode()).toBe('dark')
  })
})

describe('writeColorMode', () => {
  it('persists the chosen mode', () => {
    writeColorMode('light')
    expect(readColorMode()).toBe('light')
  })

  it('overwrites the previous value', () => {
    writeColorMode('light')
    writeColorMode('dark')
    expect(readColorMode()).toBe('dark')
  })
})
