import { useSyncExternalStore } from 'react'
import { initialNotifications, type Notification } from './notificationsData'

let notifications: Notification[] = initialNotifications
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
  return notifications
}

export function useNotifications(): Notification[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function markRead(id: string) {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  )
  emit()
}

export function markAllRead() {
  notifications = notifications.map((n) =>
    n.read ? n : { ...n, read: true },
  )
  emit()
}

export function deleteNotification(id: string) {
  notifications = notifications.filter((n) => n.id !== id)
  emit()
}

export function clearAll() {
  notifications = []
  emit()
}
