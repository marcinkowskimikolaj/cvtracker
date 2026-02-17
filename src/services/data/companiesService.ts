import { SHEET_NAMES } from '../../utils/constants'
import type { CompanyRecord, SheetRecord } from '../../types'
import { appendRow, deleteRow, readSheet, updateRow } from '../google/sheets'
import type { ServiceContext } from './context'
import { parseNumber, resolveSpreadsheetId, stringifyNumber } from './context'

interface RawCompanyRecord {
  company_id: string
  profile_id: string
  name: string
  industry: string
  website: string
  careers_url: string
  linkedin_url: string
  address: string
  lat: string
  lng: string
  distance_km: string
  travel_time_min: string
  notes: string
  created_at: string
}

function toCompanyRecord(row: RawCompanyRecord): CompanyRecord {
  return {
    company_id: row.company_id || '',
    profile_id: (row.profile_id || 'mikolaj') as CompanyRecord['profile_id'],
    name: row.name || '',
    industry: row.industry || '',
    website: row.website || '',
    careers_url: row.careers_url || '',
    linkedin_url: row.linkedin_url || '',
    address: row.address || '',
    lat: parseNumber(row.lat),
    lng: parseNumber(row.lng),
    distance_km: parseNumber(row.distance_km),
    travel_time_min: parseNumber(row.travel_time_min),
    notes: row.notes || '',
    created_at: row.created_at || '',
  }
}

function toSheetRow(record: CompanyRecord): Record<string, string> {
  return {
    company_id: record.company_id,
    profile_id: record.profile_id,
    name: record.name,
    industry: record.industry,
    website: record.website,
    careers_url: record.careers_url,
    linkedin_url: record.linkedin_url,
    address: record.address,
    lat: stringifyNumber(record.lat),
    lng: stringifyNumber(record.lng),
    distance_km: stringifyNumber(record.distance_km),
    travel_time_min: stringifyNumber(record.travel_time_min),
    notes: record.notes,
    created_at: record.created_at,
  }
}

export async function listCompanies(context: ServiceContext): Promise<SheetRecord<CompanyRecord>[]> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  const rows = await readSheet<RawCompanyRecord>(context.accessToken, spreadsheetId, SHEET_NAMES.companies)

  return rows
    .map((row) => ({ ...toCompanyRecord(row), __rowNumber: row.__rowNumber }))
    .filter((record) => record.profile_id === context.profileId)
}

export async function createCompany(context: ServiceContext, payload: CompanyRecord): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await appendRow(context.accessToken, spreadsheetId, SHEET_NAMES.companies, toSheetRow(payload))
}

export async function updateCompany(
  context: ServiceContext,
  rowNumber: number,
  payload: CompanyRecord,
): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await updateRow(context.accessToken, spreadsheetId, SHEET_NAMES.companies, rowNumber, toSheetRow(payload))
}

export async function deleteCompanyRecord(context: ServiceContext, rowNumber: number): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await deleteRow(context.accessToken, spreadsheetId, SHEET_NAMES.companies, rowNumber)
}
