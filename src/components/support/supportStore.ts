import { useSyncExternalStore } from 'react'
import {
  initialTickets,
  supportAgents,
  type Ticket,
  type TicketMessage,
  type TicketPriority,
  type TicketStatus,
} from './supportData'

let tickets: Ticket[] = initialTickets
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
  return tickets
}

function now() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

export function useTickets(): Ticket[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useTicket(id: string | undefined): Ticket | undefined {
  const all = useTickets()
  return id ? all.find((t) => t.id === id) : undefined
}

function patch(id: string, updater: (t: Ticket) => Ticket) {
  tickets = tickets.map((t) => (t.id === id ? updater(t) : t))
  emit()
}

export function updateTicketStatus(id: string, status: TicketStatus) {
  patch(id, (t) => ({ ...t, status, updatedAt: now() }))
}

export function updateTicketPriority(id: string, priority: TicketPriority) {
  patch(id, (t) => ({ ...t, priority, updatedAt: now() }))
}

export function assignTicket(id: string, agentId: string | null) {
  const agent = agentId ? supportAgents.find((a) => a.id === agentId) : null
  patch(id, (t) => ({
    ...t,
    assigneeId: agent?.id,
    assigneeName: agent?.name,
    updatedAt: now(),
  }))
}

export function addTicketReply(
  id: string,
  body: string,
  options: { internal?: boolean; authorName?: string } = {},
) {
  const message: TicketMessage = {
    id: `m_${Date.now()}`,
    authorType: 'admin',
    authorName: options.authorName ?? 'Admin',
    body,
    createdAt: now(),
    internal: options.internal,
  }
  patch(id, (t) => {
    const nextStatus: TicketStatus =
      options.internal || t.status === 'closed' || t.status === 'resolved'
        ? t.status
        : 'waiting_customer'
    return {
      ...t,
      messages: [...t.messages, message],
      status: nextStatus,
      updatedAt: now(),
    }
  })
}
