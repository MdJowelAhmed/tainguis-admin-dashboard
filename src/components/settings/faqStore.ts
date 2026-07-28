import { useSyncExternalStore } from 'react'

export type FaqItem = {
  id: string
  question: string
  answer: string
}

const initial: FaqItem[] = [
  {
    id: 'faq_1',
    question: 'How do I reset a customer password?',
    answer:
      'Open the user detail page, click Edit, then use the "Reset password" option. The customer receives an email with a secure reset link.',
  },
  {
    id: 'faq_2',
    question: 'How are orders refunded?',
    answer:
      'In the Orders detail page click Refund. The order status moves to Refunded and the payment is marked refunded. Add an internal note for the finance team.',
  },
  {
    id: 'faq_3',
    question: 'What happens when I ban a user?',
    answer:
      'Banned users lose access to sign in and cannot place new orders. Their existing orders remain visible in the dashboard for record keeping.',
  },
  {
    id: 'faq_4',
    question: 'Who can resolve support tickets?',
    answer:
      'Any admin assigned to the ticket can resolve it. Use the assignee selector to route tickets to specific agents.',
  },
  {
    id: 'faq_5',
    question: 'How do scheduled broadcasts work?',
    answer:
      'When you toggle "Schedule for later" and pick a date and time, the broadcast goes out automatically at the scheduled moment. You can see scheduled items in the Broadcast History table.',
  },
]

let faqs: FaqItem[] = initial
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
  return faqs
}

function nextId() {
  const used = faqs
    .map((f) => parseInt(f.id.replace('faq_', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = used.length ? Math.max(...used) : 0
  return `faq_${max + 1}`
}

export function useFaqs(): FaqItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function addFaq(question: string, answer: string) {
  const entry: FaqItem = { id: nextId(), question, answer }
  faqs = [...faqs, entry]
  emit()
  return entry
}

export function updateFaq(id: string, patch: Partial<Omit<FaqItem, 'id'>>) {
  faqs = faqs.map((f) => (f.id === id ? { ...f, ...patch } : f))
  emit()
}

export function deleteFaq(id: string) {
  faqs = faqs.filter((f) => f.id !== id)
  emit()
}
