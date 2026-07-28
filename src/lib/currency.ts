const pesoFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

export function formatPeso(amount: number): string {
  return pesoFormatter.format(amount)
}

export const PESO = '$'
export const CURRENCY_CODE = 'MXN'
