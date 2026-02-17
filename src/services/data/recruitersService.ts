import { SHEET_NAMES } from '../../utils/constants'
import type { RecruiterRecord, SheetRecord } from '../../types'
import { appendRow, deleteRow, readSheet, updateRow } from '../google/sheets'
import type { ServiceContext } from './context'
import { resolveSpreadsheetId } from './context'

interface RawRecruiterRecord {
  recruiter_id: string
  profile_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  linkedin_url: string
  company_id: string
  notes: string
  created_at: string
}

function toRecruiterRecord(row: RawRecruiterRecord): RecruiterRecord {
  return {
    recruiter_id: row.recruiter_id || '',
    profile_id: (row.profile_id || 'mikolaj') as RecruiterRecord['profile_id'],
    first_name: row.first_name || '',
    last_name: row.last_name || '',
    email: row.email || '',
    phone: row.phone || '',
    linkedin_url: row.linkedin_url || '',
    company_id: row.company_id || '',
    notes: row.notes || '',
    created_at: row.created_at || '',
  }
}

function toSheetRow(record: RecruiterRecord): Record<string, string> {
  return {
    recruiter_id: record.recruiter_id,
    profile_id: record.profile_id,
    first_name: record.first_name,
    last_name: record.last_name,
    email: record.email,
    phone: record.phone,
    linkedin_url: record.linkedin_url,
    company_id: record.company_id,
    notes: record.notes,
    created_at: record.created_at,
  }
}

export async function listRecruiters(context: ServiceContext): Promise<SheetRecord<RecruiterRecord>[]> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  const rows = await readSheet<RawRecruiterRecord>(context.accessToken, spreadsheetId, SHEET_NAMES.recruiters)

  return rows
    .map((row) => ({ ...toRecruiterRecord(row), __rowNumber: row.__rowNumber }))
    .filter((record) => record.profile_id === context.profileId)
}

export async function createRecruiter(context: ServiceContext, payload: RecruiterRecord): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await appendRow(context.accessToken, spreadsheetId, SHEET_NAMES.recruiters, toSheetRow(payload))
}

export async function updateRecruiter(
  context: ServiceContext,
  rowNumber: number,
  payload: RecruiterRecord,
): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await updateRow(context.accessToken, spreadsheetId, SHEET_NAMES.recruiters, rowNumber, toSheetRow(payload))
}

export async function deleteRecruiterRecord(context: ServiceContext, rowNumber: number): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await deleteRow(context.accessToken, spreadsheetId, SHEET_NAMES.recruiters, rowNumber)
}
