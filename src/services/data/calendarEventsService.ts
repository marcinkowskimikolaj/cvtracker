import { SHEET_NAMES } from '../../utils/constants'
import type { CalendarEventRecord, SheetRecord } from '../../types'
import { appendRow, deleteRow, readSheet, updateRow } from '../google/sheets'
import type { ServiceContext } from './context'
import { parseNumber, resolveSpreadsheetId, stringifyNumber } from './context'

interface RawCalendarEventRecord {
  event_id: string
  profile_id: string
  app_id: string
  title: string
  event_date: string
  event_time: string
  duration_minutes: string
  event_type: string
  google_calendar_event_id: string
  notes: string
  created_at: string
}

function toRecord(row: RawCalendarEventRecord): CalendarEventRecord {
  return {
    event_id: row.event_id || '',
    profile_id: (row.profile_id || 'mikolaj') as CalendarEventRecord['profile_id'],
    app_id: row.app_id || '',
    title: row.title || '',
    event_date: row.event_date || '',
    event_time: row.event_time || '',
    duration_minutes: parseNumber(row.duration_minutes) ?? 60,
    event_type: (row.event_type || 'other') as CalendarEventRecord['event_type'],
    google_calendar_event_id: row.google_calendar_event_id || '',
    notes: row.notes || '',
    created_at: row.created_at || '',
  }
}

function toSheetRow(record: CalendarEventRecord): Record<string, string> {
  return {
    event_id: record.event_id,
    profile_id: record.profile_id,
    app_id: record.app_id,
    title: record.title,
    event_date: record.event_date,
    event_time: record.event_time,
    duration_minutes: stringifyNumber(record.duration_minutes),
    event_type: record.event_type,
    google_calendar_event_id: record.google_calendar_event_id,
    notes: record.notes,
    created_at: record.created_at,
  }
}

export async function listCalendarEvents(context: ServiceContext): Promise<SheetRecord<CalendarEventRecord>[]> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  const rows = await readSheet<RawCalendarEventRecord>(
    context.accessToken,
    spreadsheetId,
    SHEET_NAMES.calendarEvents,
  )

  return rows
    .map((row) => ({ ...toRecord(row), __rowNumber: row.__rowNumber }))
    .filter((record) => record.profile_id === context.profileId)
}

export async function createCalendarEvent(
  context: ServiceContext,
  payload: CalendarEventRecord,
): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await appendRow(context.accessToken, spreadsheetId, SHEET_NAMES.calendarEvents, toSheetRow(payload))
}

export async function updateCalendarEvent(
  context: ServiceContext,
  rowNumber: number,
  payload: CalendarEventRecord,
): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await updateRow(context.accessToken, spreadsheetId, SHEET_NAMES.calendarEvents, rowNumber, toSheetRow(payload))
}

export async function deleteCalendarEventRecord(
  context: ServiceContext,
  rowNumber: number,
): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await deleteRow(context.accessToken, spreadsheetId, SHEET_NAMES.calendarEvents, rowNumber)
}
