import { useSyncExternalStore } from 'react'
import { initialCommissions, type CommissionSetting } from './commissionData'

let commissions: CommissionSetting[] = initialCommissions
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return commissions
}

function nextId() {
  const used = commissions
    .map((c) => parseInt(c.id.replace('com_', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = used.length ? Math.max(...used) : 0
  return `com_${String(max + 1).padStart(3, '0')}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function useCommissions(): CommissionSetting[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useCommission(id: string | undefined): CommissionSetting | undefined {
  const all = useCommissions()
  return id ? all.find((c) => c.id === id) : undefined
}

export function createCommission(
  input: Omit<CommissionSetting, 'id' | 'createdAt' | 'updatedAt'>,
) {
  const entry: CommissionSetting = {
    id: nextId(),
    createdAt: today(),
    updatedAt: today(),
    ...input,
  }
  commissions = [entry, ...commissions]
  emit()
  return entry
}

export function updateCommission(id: string, patch: Partial<CommissionSetting>) {
  commissions = commissions.map((c) =>
    c.id === id
      ? {
          ...c,
          ...patch,
          updatedAt: today(),
        }
      : c,
  )
  emit()
}

export function deleteCommission(id: string) {
  commissions = commissions.filter((c) => c.id !== id)
  emit()
}
