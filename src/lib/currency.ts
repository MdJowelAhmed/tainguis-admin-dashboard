const pesoFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

export function formatPeso(amount: number): string {
  return pesoFormatter.format(amount)
}

export const PESO = 'MX$'
export const CURRENCY_CODE = 'MXN'
