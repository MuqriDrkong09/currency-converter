export type CurrencyOption = {
  code: string
  name: string
}

export type ExchangeHostErrorBody = {
  success: false
  error: {
    code: number
    type?: string
    info: string
  }
}

export type ExchangeHostListResponse =
  | {
      success: true
      currencies: Record<string, string>
    }
  | ExchangeHostErrorBody

export type ExchangeHostConvertResponse =
  | {
      success: true
      query: { from: string; to: string; amount: number }
      info: { timestamp: number; rate: number }
      result: number
    }
  | ExchangeHostErrorBody
