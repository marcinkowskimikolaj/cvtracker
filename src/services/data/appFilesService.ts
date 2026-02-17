import { SHEET_NAMES } from '../../utils/constants'
import type { AppFileRecord, SheetRecord } from '../../types'
import { appendRow, deleteRow, readSheet } from '../google/sheets'
import type { ServiceContext } from './context'
import { resolveSpreadsheetId } from './context'

interface RawAppFileRecord {
  app_id: string
  file_id: string
  attached_at: string
}

function toRecord(row: RawAppFileRecord): AppFileRecord {
  return {
    app_id: row.app_id || '',
    file_id: row.file_id || '',
    attached_at: row.attached_at || '',
  }
}

function toSheetRow(record: AppFileRecord): Record<string, string> {
  return {
    app_id: record.app_id,
    file_id: record.file_id,
    attached_at: record.attached_at,
  }
}

export async function listAppFiles(context: ServiceContext): Promise<SheetRecord<AppFileRecord>[]> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  const rows = await readSheet<RawAppFileRecord>(context.accessToken, spreadsheetId, SHEET_NAMES.appFiles)
  return rows.map((row) => ({ ...toRecord(row), __rowNumber: row.__rowNumber }))
}

export async function createAppFile(context: ServiceContext, payload: AppFileRecord): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await appendRow(context.accessToken, spreadsheetId, SHEET_NAMES.appFiles, toSheetRow(payload))
}

export async function deleteAppFileRecord(context: ServiceContext, rowNumber: number): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await deleteRow(context.accessToken, spreadsheetId, SHEET_NAMES.appFiles, rowNumber)
}
