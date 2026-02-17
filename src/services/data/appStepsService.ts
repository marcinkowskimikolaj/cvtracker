import { SHEET_NAMES } from '../../utils/constants'
import type { AppStepRecord, SheetRecord } from '../../types'
import { appendRow, deleteRow, readSheet, updateRow } from '../google/sheets'
import type { ServiceContext } from './context'
import { resolveSpreadsheetId } from './context'

interface RawAppStepRecord {
  step_id: string
  app_id: string
  step_type: string
  step_name: string
  step_date: string
  step_time: string
  step_notes: string
  google_calendar_event_id: string
  created_at: string
}

function toRecord(row: RawAppStepRecord): AppStepRecord {
  return {
    step_id: row.step_id || '',
    app_id: row.app_id || '',
    step_type: (row.step_type || 'other') as AppStepRecord['step_type'],
    step_name: row.step_name || '',
    step_date: row.step_date || '',
    step_time: row.step_time || '',
    step_notes: row.step_notes || '',
    google_calendar_event_id: row.google_calendar_event_id || '',
    created_at: row.created_at || '',
  }
}

function toSheetRow(record: AppStepRecord): Record<string, string> {
  return {
    step_id: record.step_id,
    app_id: record.app_id,
    step_type: record.step_type,
    step_name: record.step_name,
    step_date: record.step_date,
    step_time: record.step_time,
    step_notes: record.step_notes,
    google_calendar_event_id: record.google_calendar_event_id,
    created_at: record.created_at,
  }
}

export async function listAppSteps(context: ServiceContext): Promise<SheetRecord<AppStepRecord>[]> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  const rows = await readSheet<RawAppStepRecord>(context.accessToken, spreadsheetId, SHEET_NAMES.appSteps)
  return rows.map((row) => ({ ...toRecord(row), __rowNumber: row.__rowNumber }))
}

export async function createAppStep(context: ServiceContext, payload: AppStepRecord): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await appendRow(context.accessToken, spreadsheetId, SHEET_NAMES.appSteps, toSheetRow(payload))
}

export async function updateAppStep(
  context: ServiceContext,
  rowNumber: number,
  payload: AppStepRecord,
): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await updateRow(context.accessToken, spreadsheetId, SHEET_NAMES.appSteps, rowNumber, toSheetRow(payload))
}

export async function deleteAppStepRecord(context: ServiceContext, rowNumber: number): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await deleteRow(context.accessToken, spreadsheetId, SHEET_NAMES.appSteps, rowNumber)
}
