import { readChartMode, writeChartMode } from '../chartModeStorage'

const STORAGE_KEY = 'currency-converter:chart-mode'

beforeEach(() => {
  localStorage.clear()
})

describe('readChartMode', () => {
  it('defaults to area when nothing is stored', () => {
    expect(readChartMode()).toBe('area')
  })

  it('honours line / area when stored', () => {
    localStorage.setItem(STORAGE_KEY, 'line')
    expect(readChartMode()).toBe('line')
    localStorage.setItem(STORAGE_KEY, 'area')
    expect(readChartMode()).toBe('area')
  })

  it('falls back to default for unknown stored values', () => {
    localStorage.setItem(STORAGE_KEY, 'pie')
    expect(readChartMode()).toBe('area')
  })
})

describe('writeChartMode', () => {
  it('persists the chosen mode', () => {
    writeChartMode('line')
    expect(readChartMode()).toBe('line')
  })
})
