export type CommissionType = 'standard' | 'express' | 'premium'

export type CommissionSetting = {
  id: string
  type: CommissionType
  name: string
  description: string
  percentage: number
  minTransaction?: number
  maxTransaction?: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export const commissionTypeLabels: Record<CommissionType, string> = {
  standard: 'Standard',
  express: 'Express',
  premium: 'Premium',
}

export const initialCommissions: CommissionSetting[] = [
  {
    id: 'com_001',
    type: 'standard',
    name: 'App Charge',
    description: 'Platform fee applied to every transaction',
    percentage: 8,
    active: true,
    createdAt: '2024-01-15',
    updatedAt: '2026-05-19',
  },
]
