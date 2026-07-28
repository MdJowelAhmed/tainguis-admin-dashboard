import { useSyncExternalStore } from 'react'
import { initialUsers, type UserRecord, type UserStatus } from './usersData'

let users: UserRecord[] = initialUsers
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
  return users
}

export function useUsers(): UserRecord[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useUser(id: string | undefined): UserRecord | undefined {
  const all = useUsers()
  return id ? all.find((u) => u.id === id) : undefined
}

export function updateUser(id: string, patch: Partial<UserRecord>) {
  users = users.map((u) => (u.id === id ? { ...u, ...patch } : u))
  emit()
}

export function setUserStatus(
  id: string,
  status: UserStatus,
  note?: string,
) {
  updateUser(id, { status, statusNote: note })
}
