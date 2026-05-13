import { afterEach, describe, expect, it, jest } from '@jest/globals'
import {
  fetchFrankfurterConversion,
  fetchFrankfurterCurrencies,
  fetchFrankfurterExchangeTrend,
  fetchFrankfurterMultiRates,
} from '../frankfurter'

type MockResponseInit = { ok?: boolean; status?: number; jsonError?: boolean }

function installFetchMock(body: unknown, init: MockResponseInit = {}) {
  const ok = init.ok ?? true
  const status = init.status ?? (ok ? 200 : 500)
  const response = {
    ok,
    status,
    json: async () => {
      if (init.jsonError) throw new Error('invalid json')
      return body
    },
  } as unknown as Response
  const fn = jest.fn().mockResolvedValue(response)
  global.fetch = fn as unknown as typeof fetch
  return fn
}

function installFetchRejection(error: Error) {
  const fn = jest.fn().mockRejectedValue(error)
  global.fetch = fn as unknown as typeof fetch
  return fn
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('fetchFrankfurterCurrencies', () => {
  it('parses the `{code: name}` map into a sorted CurrencyOption[]', async () => {
    installFetchMock({
      USD: 'United States Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
    })
    const out = await fetchFrankfurterCurrencies()
    expect(out).toEqual([
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'British Pound' },
      { code: 'USD', name: 'United States Dollar' },
    ])
  })

  it('ignores non-string entries', async () => {
    installFetchMock({ USD: 'United States Dollar', BAD: 42 })
    const out = await fetchFrankfurterCurrencies()
    expect(out).toEqual([{ code: 'USD', name: 'United States Dollar' }])
  })

  it('throws a friendly network error when fetch rejects', async () => {
    installFetchRejection(new Error('ECONNRESET'))
    await expect(fetchFrankfurterCurrencies()).rejects.toThrow(/network/i)
  })

  it('throws when the JSON body is malformed', async () => {
    installFetchMock({}, { jsonError: true })
    await expect(fetchFrankfurterCurrencies()).rejects.toThrow(/invalid response/i)
  })

  it('surfaces the API error message when the response is not ok', async () => {
    installFetchMock({ message: 'rate limited' }, { ok: false, status: 429 })
    await expect(fetchFrankfurterCurrencies()).rejects.toThrow('rate limited')
  })

  it('falls back to a generic message when no error message is provided', async () => {
    installFetchMock({}, { ok: false, status: 500 })
    await expect(fetchFrankfurterCurrencies()).rejects.toThrow('Request failed (500).')
  })

  it('throws when the body is not an object', async () => {
    installFetchMock('not-an-object')
    await expect(fetchFrankfurterCurrencies()).rejects.toThrow(/unexpected currency list/i)
  })
})

describe('fetchFrankfurterConversion', () => {
  it('returns the result, derived rate, and a unix timestamp', async () => {
    installFetchMock({
      amount: 100,
      base: 'USD',
      date: '2024-06-01',
      rates: { EUR: 92.5 },
    })
    const out = await fetchFrankfurterConversion({ from: 'USD', to: 'EUR', amount: 100 })
    expect(out.result).toBe(92.5)
    expect(out.rate).toBeCloseTo(0.925)
    expect(out.timestamp).toBeGreaterThan(0)
    // 2024-06-01T12:00:00Z = unix 1717243200
    expect(out.timestamp).toBe(Math.floor(Date.parse('2024-06-01T12:00:00Z') / 1000))
  })

  it('passes the requested params via the query string', async () => {
    const fetchMock = installFetchMock({
      amount: 1,
      base: 'USD',
      date: '2024-06-01',
      rates: { EUR: 0.92 },
    })
    await fetchFrankfurterConversion({ from: 'USD', to: 'EUR', amount: 1 })
    const [calledUrl] = fetchMock.mock.calls[0] as [string]
    expect(calledUrl).toContain('https://api.frankfurter.dev/v1/latest?')
    expect(calledUrl).toContain('amount=1')
    expect(calledUrl).toContain('from=USD')
    expect(calledUrl).toContain('to=EUR')
  })

  it('throws when the rate for the target currency is missing', async () => {
    installFetchMock({ amount: 1, base: 'USD', date: '2024-06-01', rates: {} })
    await expect(
      fetchFrankfurterConversion({ from: 'USD', to: 'EUR', amount: 1 }),
    ).rejects.toThrow(/does not publish a rate/i)
  })

  it('throws on a malformed body', async () => {
    installFetchMock({ amount: 1, base: 'USD' })
    await expect(
      fetchFrankfurterConversion({ from: 'USD', to: 'EUR', amount: 1 }),
    ).rejects.toThrow(/unexpected conversion response/i)
  })

  it('surfaces the API error when the response is not ok', async () => {
    installFetchMock({ message: 'not found' }, { ok: false, status: 404 })
    await expect(
      fetchFrankfurterConversion({ from: 'XXX', to: 'YYY', amount: 1 }),
    ).rejects.toThrow('not found')
  })
})

describe('fetchFrankfurterMultiRates', () => {
  it('returns an empty rates object without calling fetch when symbols list is empty', async () => {
    const fetchMock = installFetchMock({}, { ok: true })
    const out = await fetchFrankfurterMultiRates({ base: 'USD', symbols: [] })
    expect(out).toEqual({ base: 'USD', date: '', rates: {} })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('filters out the base from the requested symbols and uppercases inputs', async () => {
    const fetchMock = installFetchMock({
      amount: 1,
      base: 'USD',
      date: '2024-06-01',
      rates: { EUR: 0.92, GBP: 0.78 },
    })
    await fetchFrankfurterMultiRates({ base: 'USD', symbols: ['usd', 'eur', 'gbp'] })
    const [calledUrl] = fetchMock.mock.calls[0] as [string]
    expect(calledUrl).toMatch(/symbols=EUR%2CGBP|symbols=EUR,GBP/)
  })

  it('returns base / date / rates and drops non-numeric values', async () => {
    installFetchMock({
      base: 'USD',
      date: '2024-06-01',
      rates: { EUR: 0.92, GBP: 'bad', JPY: 149.5 },
    })
    const out = await fetchFrankfurterMultiRates({ base: 'USD', symbols: ['EUR', 'GBP', 'JPY'] })
    expect(out.base).toBe('USD')
    expect(out.date).toBe('2024-06-01')
    expect(out.rates).toEqual({ EUR: 0.92, JPY: 149.5 })
  })

  it('throws on a malformed body', async () => {
    installFetchMock({ rates: 'not-an-object' })
    await expect(
      fetchFrankfurterMultiRates({ base: 'USD', symbols: ['EUR'] }),
    ).rejects.toThrow(/unexpected multi-rates/i)
  })

  it('surfaces the API error message when not ok', async () => {
    installFetchMock({ message: 'invalid symbols' }, { ok: false, status: 422 })
    await expect(
      fetchFrankfurterMultiRates({ base: 'USD', symbols: ['EUR'] }),
    ).rejects.toThrow('invalid symbols')
  })
})

describe('fetchFrankfurterExchangeTrend', () => {
  it('returns points sorted by date', async () => {
    installFetchMock({
      base: 'USD',
      start_date: '2024-01-01',
      end_date: '2024-01-03',
      rates: {
        '2024-01-03': { EUR: 0.93 },
        '2024-01-01': { EUR: 0.91 },
        '2024-01-02': { EUR: 0.92 },
      },
    })
    const out = await fetchFrankfurterExchangeTrend({
      from: 'USD',
      to: 'EUR',
      startDate: '2024-01-01',
      endDate: '2024-01-03',
    })
    expect(out).toEqual([
      { date: '2024-01-01', rate: 0.91 },
      { date: '2024-01-02', rate: 0.92 },
      { date: '2024-01-03', rate: 0.93 },
    ])
  })

  it('skips days where the target currency rate is missing or not numeric', async () => {
    installFetchMock({
      rates: {
        '2024-01-01': { EUR: 0.91 },
        '2024-01-02': { GBP: 0.78 },
        '2024-01-03': { EUR: 'bad' },
        '2024-01-04': { EUR: 0.94 },
      },
    })
    const out = await fetchFrankfurterExchangeTrend({
      from: 'USD',
      to: 'EUR',
      startDate: '2024-01-01',
      endDate: '2024-01-04',
    })
    expect(out.map((p) => p.date)).toEqual(['2024-01-01', '2024-01-04'])
  })

  it('throws on a malformed body', async () => {
    installFetchMock({})
    await expect(
      fetchFrankfurterExchangeTrend({ from: 'USD', to: 'EUR', startDate: '2024-01-01', endDate: '2024-01-02' }),
    ).rejects.toThrow(/unexpected trend response/i)
  })
})
