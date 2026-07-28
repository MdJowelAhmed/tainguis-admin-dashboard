import { useSyncExternalStore } from 'react'
import { initialBroadcasts, type Broadcast } from './broadcastsData'

let broadcasts: Broadcast[] = initialBroadcasts
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
  return broadcasts
}

export function useBroadcasts(): Broadcast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

function nextId() {
  const used = broadcasts
    .map((b) => parseInt(b.id.replace('BC-', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = used.length ? Math.max(...used) : 0
  return `BC-${String(max + 1).padStart(3, '0')}`
}

function now() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

export function addBroadcast(input: Omit<Broadcast, 'id' | 'sentAt' | 'readRate'>) {
  const id = nextId()
  const entry: Broadcast = {
    id,
    ...input,
    sentAt: input.status === 'sent' ? now() : undefined,
  }
  broadcasts = [entry, ...broadcasts]
  emit()
  return entry
}
