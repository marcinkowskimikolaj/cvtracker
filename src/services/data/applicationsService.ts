import { SHEET_NAMES } from '../../utils/constants'
import type { ApplicationRecord, SheetRecord } from '../../types'
import { appendRow, deleteRow, readSheet, updateRow } from '../google/sheets'
import type { ServiceContext } from './context'
import { parseNumber, resolveSpreadsheetId, stringifyNumber } from './context'

interface RawApplicationRecord {
  app_id: string
  profile_id: string
  company_id: string
  position_title: string
  position_url: string
  status: string
  priority: string
  excitement_rating: string
  monthly_salary: string
  hourly_rate: string
  job_offer_file_id: string
  applied_date: string
  response_date: string
  role_description: string
  notes: string
  created_at: string
  updated_at: string
}

function toApplicationRecord(row: RawApplicationRecord): ApplicationRecord {
  return {
    app_id: row.app_id || '',
    profile_id: (row.profile_id || 'mikolaj') as ApplicationRecord['profile_id'],
    company_id: row.company_id || '',
    position_title: row.position_title || '',
    position_url: row.position_url || '',
    status: (row.status || 'sent') as ApplicationRecord['status'],
    priority: (row.priority || 'normal') as ApplicationRecord['priority'],
    excitement_rating: parseNumber(row.excitement_rating),
    monthly_salary: parseNumber(row.monthly_salary),
    hourly_rate: parseNumber(row.hourly_rate),
    job_offer_file_id: row.job_offer_file_id || '',
    applied_date: row.applied_date || '',
    response_date: row.response_date || '',
    role_description: row.role_description || '',
    notes: row.notes || '',
    created_at: row.created_at || '',
    updated_at: row.updated_at || '',
  }
}

function toSheetRow(record: ApplicationRecord): Record<string, string> {
  return {
    app_id: record.app_id,
    profile_id: record.profile_id,
    company_id: record.company_id,
    position_title: record.position_title,
    position_url: record.position_url,
    status: record.status,
    priority: record.priority,
    excitement_rating: stringifyNumber(record.excitement_rating),
    monthly_salary: stringifyNumber(record.monthly_salary),
    hourly_rate: stringifyNumber(record.hourly_rate),
    job_offer_file_id: record.job_offer_file_id,
    applied_date: record.applied_date,
    response_date: record.response_date,
    role_description: record.role_description,
    notes: record.notes,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

export async function listApplications(context: ServiceContext): Promise<SheetRecord<ApplicationRecord>[]> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  const rows = await readSheet<RawApplicationRecord>(
    context.accessToken,
    spreadsheetId,
    SHEET_NAMES.applications,
  )

  return rows
    .map((row) => ({ ...toApplicationRecord(row), __rowNumber: row.__rowNumber }))
    .filter((record) => record.profile_id === context.profileId)
}

export async function createApplication(context: ServiceContext, payload: ApplicationRecord): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await appendRow(context.accessToken, spreadsheetId, SHEET_NAMES.applications, toSheetRow(payload))
}

export async function updateApplication(
  context: ServiceContext,
  rowNumber: number,
  payload: ApplicationRecord,
): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await updateRow(context.accessToken, spreadsheetId, SHEET_NAMES.applications, rowNumber, toSheetRow(payload))
}

export async function deleteApplicationRecord(context: ServiceContext, rowNumber: number): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await deleteRow(context.accessToken, spreadsheetId, SHEET_NAMES.applications, rowNumber)
}
