import { useSyncExternalStore } from 'react'
import {
  initialAdmins,
  type AdminAccount,
  type AdminStatus,
} from './adminsData'

let admins: AdminAccount[] = initialAdmins
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
  return admins
}

function nextId() {
  const used = admins
    .map((a) => parseInt(a.id.replace('ad_', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = used.length ? Math.max(...used) : 0
  return `ad_${String(max + 1).padStart(3, '0')}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function useAdmins(): AdminAccount[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function createAdmin(
  input: Omit<AdminAccount, 'id' | 'createdAt' | 'lastActiveAt' | 'status'> & {
    status?: AdminStatus
  },
) {
  const entry: AdminAccount = {
    id: nextId(),
    createdAt: today(),
    status: input.status ?? 'active',
    ...input,
  }
  admins = [entry, ...admins]
  emit()
  return entry
}

export function updateAdmin(id: string, patch: Partial<AdminAccount>) {
  admins = admins.map((a) => (a.id === id ? { ...a, ...patch } : a))
  emit()
}

export function deleteAdmin(id: string) {
  admins = admins.filter((a) => a.id !== id)
  emit()
}

export function setAdminStatus(id: string, status: AdminStatus) {
  updateAdmin(id, { status })
}
