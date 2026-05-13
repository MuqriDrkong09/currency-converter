import {
  alertId,
  isRateAlertConditionMet,
  readRateAlerts,
  removeRateAlert,
  updateRateAlert,
  upsertRateAlert,
} from '../rateAlerts'

beforeEach(() => {
  localStorage.clear()
})

describe('alertId', () => {
  it('uses a deterministic from>to format', () => {
    expect(alertId('USD', 'MYR')).toBe('USD>MYR')
  })
})

describe('isRateAlertConditionMet', () => {
  const base = { id: 'USD>MYR', from: 'USD', to: 'MYR', target: 4.7, createdAt: 0, armed: true }

  it('for `above` is met when rate is at or over the target', () => {
    expect(isRateAlertConditionMet({ ...base, direction: 'above' }, 4.69)).toBe(false)
    expect(isRateAlertConditionMet({ ...base, direction: 'above' }, 4.7)).toBe(true)
    expect(isRateAlertConditionMet({ ...base, direction: 'above' }, 4.71)).toBe(true)
  })

  it('for `below` is met when rate is at or under the target', () => {
    expect(isRateAlertConditionMet({ ...base, direction: 'below' }, 4.71)).toBe(false)
    expect(isRateAlertConditionMet({ ...base, direction: 'below' }, 4.7)).toBe(true)
    expect(isRateAlertConditionMet({ ...base, direction: 'below' }, 4.69)).toBe(true)
  })
})

describe('upsertRateAlert', () => {
  it('persists the alert and returns it', () => {
    const alert = upsertRateAlert({ from: 'USD', to: 'MYR', target: 4.7, direction: 'above' })
    expect(alert).toMatchObject({
      id: 'USD>MYR',
      from: 'USD',
      to: 'MYR',
      target: 4.7,
      direction: 'above',
      armed: true,
    })
    expect(readRateAlerts()).toHaveLength(1)
  })

  it('seeds armed=true when the condition is not yet met (above)', () => {
    const a = upsertRateAlert({
      from: 'USD',
      to: 'MYR',
      target: 4.7,
      direction: 'above',
      currentRate: 4.5,
    })
    expect(a.armed).toBe(true)
  })

  it('seeds armed=false when the condition is already met (above)', () => {
    const a = upsertRateAlert({
      from: 'USD',
      to: 'MYR',
      target: 4.7,
      direction: 'above',
      currentRate: 4.8,
    })
    expect(a.armed).toBe(false)
  })

  it('seeds armed=true when the condition is not yet met (below)', () => {
    const a = upsertRateAlert({
      from: 'USD',
      to: 'MYR',
      target: 4.7,
      direction: 'below',
      currentRate: 5.0,
    })
    expect(a.armed).toBe(true)
  })

  it('seeds armed=false when the condition is already met (below)', () => {
    const a = upsertRateAlert({
      from: 'USD',
      to: 'MYR',
      target: 4.7,
      direction: 'below',
      currentRate: 4.5,
    })
    expect(a.armed).toBe(false)
  })

  it('replaces an existing alert for the same pair', () => {
    upsertRateAlert({ from: 'USD', to: 'MYR', target: 4.7, direction: 'above' })
    upsertRateAlert({ from: 'USD', to: 'MYR', target: 4.6, direction: 'below' })
    const list = readRateAlerts()
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ target: 4.6, direction: 'below' })
  })

  it('rejects same-currency pairs', () => {
    expect(() => upsertRateAlert({ from: 'USD', to: 'USD', target: 1, direction: 'above' })).toThrow()
  })

  it('rejects non-positive or non-finite targets', () => {
    expect(() => upsertRateAlert({ from: 'USD', to: 'MYR', target: 0, direction: 'above' })).toThrow()
    expect(() => upsertRateAlert({ from: 'USD', to: 'MYR', target: -1, direction: 'above' })).toThrow()
    expect(() =>
      upsertRateAlert({ from: 'USD', to: 'MYR', target: Number.NaN, direction: 'above' }),
    ).toThrow()
  })
})

describe('updateRateAlert', () => {
  it('updates the matching alert in place', () => {
    const alert = upsertRateAlert({ from: 'USD', to: 'MYR', target: 4.7, direction: 'above' })
    updateRateAlert({ ...alert, armed: false, lastTriggeredAt: 12345 })
    const after = readRateAlerts()
    expect(after[0]).toMatchObject({ armed: false, lastTriggeredAt: 12345 })
  })
})

describe('removeRateAlert', () => {
  it('removes only the matching alert', () => {
    upsertRateAlert({ from: 'USD', to: 'MYR', target: 4.7, direction: 'above' })
    upsertRateAlert({ from: 'EUR', to: 'USD', target: 1.05, direction: 'below' })
    removeRateAlert('USD', 'MYR')
    const after = readRateAlerts()
    expect(after).toHaveLength(1)
    expect(after[0].id).toBe('EUR>USD')
  })
})

describe('readRateAlerts', () => {
  it('ignores corrupt entries', () => {
    localStorage.setItem(
      'currency-converter:rate-alerts',
      JSON.stringify([
        { id: 'USD>MYR', from: 'USD', to: 'MYR', target: 4.7, direction: 'above', createdAt: 1, armed: true },
        { id: 'X', from: '', to: '', target: 0, direction: 'sideways', createdAt: 0, armed: 'yes' },
      ]),
    )
    expect(readRateAlerts()).toHaveLength(1)
  })

  it('returns an empty array on invalid JSON', () => {
    localStorage.setItem('currency-converter:rate-alerts', '<<<')
    expect(readRateAlerts()).toEqual([])
  })
})
