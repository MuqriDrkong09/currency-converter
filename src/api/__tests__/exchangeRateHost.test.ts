import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

/**
 * Mock the config module so the adapter sees a predictable access key.
 *
 * In Jest's ESM mode `jest.mock(...)` does NOT hoist. We use
 * `jest.unstable_mockModule(...)` + dynamic `import()` instead, which is the
 * officially supported way to mock ES modules.
 */
const mockGetKey = jest.fn<() => string | undefined>(() => 'test-key')

jest.unstable_mockModule('../../config', () => ({
  EXCHANGE_RATE_HOST_BASE: 'https://api.exchangerate.host',
  getExchangeRateHostAccessKey: mockGetKey,
}))

// Importing the SUT must happen *after* the mock is registered.
const { ExchangeRateHostError, fetchConversion, fetchSupportedCurrencies } = await import(
  '../exchangeRateHost'
)

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
  const fn = jest.fn<() => Promise<Response>>().mockResolvedValue(response)
  global.fetch = fn as unknown as typeof fetch
  return fn
}

function installFetchRejection(error: Error) {
  const fn = jest.fn<() => Promise<Response>>().mockRejectedValue(error)
  global.fetch = fn as unknown as typeof fetch
  return fn
}

beforeEach(() => {
  mockGetKey.mockReturnValue('test-key')
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('access key handling', () => {
  it('throws a config-kind ExchangeRateHostError when no access key is configured', async () => {
    mockGetKey.mockReturnValue(undefined)
    const err = await fetchSupportedCurrencies().catch((e) => e)
    expect(err).toBeInstanceOf(ExchangeRateHostError)
    expect((err as InstanceType<typeof ExchangeRateHostError>).kind).toBe('config')
  })

  it('throws a config-kind error from fetchConversion as well', async () => {
    mockGetKey.mockReturnValue(undefined)
    const err = await fetchConversion({ from: 'USD', to: 'EUR', amount: 100 }).catch((e) => e)
    expect(err).toBeInstanceOf(ExchangeRateHostError)
    expect((err as InstanceType<typeof ExchangeRateHostError>).kind).toBe('config')
  })
})

describe('fetchSupportedCurrencies', () => {
  it('parses the `currencies` map into a sorted CurrencyOption[]', async () => {
    installFetchMock({
      success: true,
      currencies: { USD: 'United States Dollar', EUR: 'Euro', GBP: 'British Pound' },
    })
    const out = await fetchSupportedCurrencies()
    expect(out).toEqual([
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'British Pound' },
      { code: 'USD', name: 'United States Dollar' },
    ])
  })

  it('sends the access key as a query parameter', async () => {
    const fetchMock = installFetchMock({ success: true, currencies: { USD: 'USD' } })
    await fetchSupportedCurrencies()
    const [calledUrl] = fetchMock.mock.calls[0] as [string]
    expect(calledUrl).toContain('https://api.exchangerate.host/list?')
    expect(calledUrl).toContain('access_key=test-key')
  })

  it('throws an api-kind error with the API info message on `success: false`', async () => {
    installFetchMock({
      success: false,
      error: { code: 101, info: 'invalid_access_key' },
    })
    const err = (await fetchSupportedCurrencies().catch((e) => e)) as InstanceType<
      typeof ExchangeRateHostError
    >
    expect(err).toBeInstanceOf(ExchangeRateHostError)
    expect(err.kind).toBe('api')
    expect(err.apiCode).toBe(101)
    expect(err.message).toBe('invalid_access_key')
  })

  it('throws a network-kind error when fetch rejects', async () => {
    installFetchRejection(new Error('ENOTFOUND'))
    const err = (await fetchSupportedCurrencies().catch((e) => e)) as InstanceType<
      typeof ExchangeRateHostError
    >
    expect(err).toBeInstanceOf(ExchangeRateHostError)
    expect(err.kind).toBe('network')
  })

  it('throws an api-kind error on malformed JSON', async () => {
    installFetchMock({}, { jsonError: true })
    const err = (await fetchSupportedCurrencies().catch((e) => e)) as InstanceType<
      typeof ExchangeRateHostError
    >
    expect(err).toBeInstanceOf(ExchangeRateHostError)
    expect(err.kind).toBe('api')
  })

  it('throws when success is true but currencies is missing', async () => {
    installFetchMock({ success: true })
    const err = (await fetchSupportedCurrencies().catch((e) => e)) as InstanceType<
      typeof ExchangeRateHostError
    >
    expect(err).toBeInstanceOf(ExchangeRateHostError)
    expect(err.kind).toBe('api')
  })
})

describe('fetchConversion', () => {
  it('returns result / rate / timestamp from the API payload', async () => {
    installFetchMock({
      success: true,
      query: { from: 'USD', to: 'EUR', amount: 100 },
      info: { rate: 0.92, timestamp: 1717243200 },
      result: 92,
    })
    const out = await fetchConversion({ from: 'USD', to: 'EUR', amount: 100 })
    expect(out).toEqual({ result: 92, rate: 0.92, timestamp: 1717243200 })
  })

  it('builds the request with from / to / amount / access_key', async () => {
    const fetchMock = installFetchMock({
      success: true,
      query: { from: 'USD', to: 'EUR', amount: 100 },
      info: { rate: 0.92, timestamp: 1 },
      result: 92,
    })
    await fetchConversion({ from: 'USD', to: 'EUR', amount: 100 })
    const [calledUrl] = fetchMock.mock.calls[0] as [string]
    expect(calledUrl).toContain('/convert?')
    expect(calledUrl).toContain('from=USD')
    expect(calledUrl).toContain('to=EUR')
    expect(calledUrl).toContain('amount=100')
    expect(calledUrl).toContain('access_key=test-key')
  })

  it('throws an api-kind error when the response shape is unexpected', async () => {
    installFetchMock({ success: true, result: 92 })
    const err = (await fetchConversion({ from: 'USD', to: 'EUR', amount: 100 }).catch(
      (e) => e,
    )) as InstanceType<typeof ExchangeRateHostError>
    expect(err).toBeInstanceOf(ExchangeRateHostError)
    expect(err.kind).toBe('api')
  })

  it('throws when the API returns a structured error', async () => {
    installFetchMock({
      success: false,
      error: { code: 202, info: 'invalid_conversion_currency' },
    })
    const err = (await fetchConversion({ from: 'USD', to: 'XXX', amount: 100 }).catch(
      (e) => e,
    )) as InstanceType<typeof ExchangeRateHostError>
    expect(err).toBeInstanceOf(ExchangeRateHostError)
    expect(err.kind).toBe('api')
    expect(err.apiCode).toBe(202)
  })

  it('throws a network-kind error when fetch rejects', async () => {
    installFetchRejection(new Error('timeout'))
    const err = (await fetchConversion({ from: 'USD', to: 'EUR', amount: 1 }).catch(
      (e) => e,
    )) as InstanceType<typeof ExchangeRateHostError>
    expect(err).toBeInstanceOf(ExchangeRateHostError)
    expect(err.kind).toBe('network')
  })
})
