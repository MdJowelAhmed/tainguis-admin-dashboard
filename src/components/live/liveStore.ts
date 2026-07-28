import { useSyncExternalStore } from 'react'
import { initialStreams, type LiveStream, type LiveStatus } from './liveData'

let streams: LiveStream[] = initialStreams
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
  return streams
}

function now() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

export function useStreams(): LiveStream[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useStream(id: string | undefined): LiveStream | undefined {
  const all = useStreams()
  return id ? all.find((s) => s.id === id) : undefined
}

function patch(id: string, updater: (s: LiveStream) => LiveStream) {
  streams = streams.map((s) => (s.id === id ? updater(s) : s))
  emit()
}

export function setStreamStatus(id: string, status: LiveStatus) {
  patch(id, (s) => ({
    ...s,
    status,
    endedAt: status === 'ended' ? now() : s.endedAt,
  }))
}

export function endStream(id: string) {
  setStreamStatus(id, 'ended')
}

export function cancelStream(id: string) {
  setStreamStatus(id, 'cancelled')
}

export function pinMessage(streamId: string, messageId: string) {
  patch(streamId, (s) => ({
    ...s,
    messages: s.messages.map((m) =>
      m.id === messageId ? { ...m, pinned: !m.pinned } : m,
    ),
  }))
}

export function hideMessage(streamId: string, messageId: string) {
  patch(streamId, (s) => ({
    ...s,
    messages: s.messages.map((m) =>
      m.id === messageId ? { ...m, hidden: !m.hidden } : m,
    ),
  }))
}
