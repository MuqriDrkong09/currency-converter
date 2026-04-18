export function formatMoney(amount: number, currencyCode: string, locale = navigator.language): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 6,
  }).format(amount)
}

export function formatRate(rate: number, locale = navigator.language): string {
  return new Intl.NumberFormat(locale, {
    maximumSignificantDigits: 8,
  }).format(rate)
}

export function formatRateTimestamp(unixSeconds: number, locale = navigator.language): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(unixSeconds * 1000))
}
