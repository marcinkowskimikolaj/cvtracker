import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

export function formatDate(dateIso: string): string {
  if (!dateIso) {
    return '-'
  }

  return format(parseISO(dateIso), 'dd.MM.yyyy', { locale: pl })
}

export function formatDateTime(dateIso: string): string {
  if (!dateIso) {
    return '-'
  }

  return format(parseISO(dateIso), 'dd.MM.yyyy HH:mm', { locale: pl })
}

export function nowIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function nowIsoDateTime(): string {
  return new Date().toISOString()
}

export function nowTimestamp(): number {
  return Date.now()
}

export function daysBetween(startIso: string, endIso: string): number {
  const start = parseISO(startIso).getTime()
  const end = parseISO(endIso).getTime()
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)))
}
