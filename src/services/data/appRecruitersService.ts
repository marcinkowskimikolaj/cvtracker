import { SHEET_NAMES } from '../../utils/constants'
import type { AppRecruiterRecord, SheetRecord } from '../../types'
import { appendRow, deleteRow, readSheet } from '../google/sheets'
import type { ServiceContext } from './context'
import { resolveSpreadsheetId } from './context'

interface RawAppRecruiterRecord {
  app_id: string
  recruiter_id: string
}

function toRecord(row: RawAppRecruiterRecord): AppRecruiterRecord {
  return {
    app_id: row.app_id || '',
    recruiter_id: row.recruiter_id || '',
  }
}

function toSheetRow(record: AppRecruiterRecord): Record<string, string> {
  return {
    app_id: record.app_id,
    recruiter_id: record.recruiter_id,
  }
}

export async function listAppRecruiters(context: ServiceContext): Promise<SheetRecord<AppRecruiterRecord>[]> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  const rows = await readSheet<RawAppRecruiterRecord>(
    context.accessToken,
    spreadsheetId,
    SHEET_NAMES.appRecruiters,
  )
  return rows.map((row) => ({ ...toRecord(row), __rowNumber: row.__rowNumber }))
}

export async function createAppRecruiter(context: ServiceContext, payload: AppRecruiterRecord): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await appendRow(context.accessToken, spreadsheetId, SHEET_NAMES.appRecruiters, toSheetRow(payload))
}

export async function deleteAppRecruiterRecord(context: ServiceContext, rowNumber: number): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await deleteRow(context.accessToken, spreadsheetId, SHEET_NAMES.appRecruiters, rowNumber)
}
