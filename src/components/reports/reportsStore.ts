import { useSyncExternalStore } from 'react'
import {
  initialReports,
  type Report,
  type ReportAction,
  type ReportStatus,
} from './reportsData'

let reports: Report[] = initialReports
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
  return reports
}

export function useReports(): Report[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useReport(id: string | undefined): Report | undefined {
  const all = useReports()
  return id ? all.find((r) => r.id === id) : undefined
}

export function useReportsAgainst(userId: string | undefined): Report[] {
  const all = useReports()
  return userId ? all.filter((r) => r.reportedUserId === userId) : []
}

export function pendingReportsCount(): number {
  return reports.filter((r) => r.status === 'pending').length
}

export function resolveReport(
  id: string,
  status: Exclude<ReportStatus, 'pending'>,
  action: ReportAction,
  note: string,
  resolvedBy = 'Admin',
) {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  reports = reports.map((r) =>
    r.id === id
      ? {
          ...r,
          status,
          action,
          adminNote: note,
          resolvedAt: now,
          resolvedBy,
        }
      : r,
  )
  emit()
}

export function reopenReport(id: string) {
  reports = reports.map((r) =>
    r.id === id
      ? {
          ...r,
          status: 'pending',
          action: undefined,
          adminNote: undefined,
          resolvedAt: undefined,
          resolvedBy: undefined,
        }
      : r,
  )
  emit()
}
