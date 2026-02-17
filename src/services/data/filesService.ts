import { SHEET_NAMES } from '../../utils/constants'
import type { FileRecord, SheetRecord } from '../../types'
import { appendRow, deleteRow, readSheet, updateRow } from '../google/sheets'
import type { ServiceContext } from './context'
import { resolveSpreadsheetId } from './context'

interface RawFileRecord {
  file_id: string
  profile_id: string
  file_name: string
  file_type: string
  drive_file_id: string
  drive_url: string
  description: string
  version_label: string
  created_at: string
}

function toFileRecord(row: RawFileRecord): FileRecord {
  return {
    file_id: row.file_id || '',
    profile_id: (row.profile_id || 'mikolaj') as FileRecord['profile_id'],
    file_name: row.file_name || '',
    file_type: (row.file_type || 'other') as FileRecord['file_type'],
    drive_file_id: row.drive_file_id || '',
    drive_url: row.drive_url || '',
    description: row.description || '',
    version_label: row.version_label || '',
    created_at: row.created_at || '',
  }
}

function toSheetRow(record: FileRecord): Record<string, string> {
  return {
    file_id: record.file_id,
    profile_id: record.profile_id,
    file_name: record.file_name,
    file_type: record.file_type,
    drive_file_id: record.drive_file_id,
    drive_url: record.drive_url,
    description: record.description,
    version_label: record.version_label,
    created_at: record.created_at,
  }
}

export async function listFiles(context: ServiceContext): Promise<SheetRecord<FileRecord>[]> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  const rows = await readSheet<RawFileRecord>(context.accessToken, spreadsheetId, SHEET_NAMES.files)

  return rows
    .map((row) => ({ ...toFileRecord(row), __rowNumber: row.__rowNumber }))
    .filter((record) => record.profile_id === context.profileId)
}

export async function createFile(context: ServiceContext, payload: FileRecord): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await appendRow(context.accessToken, spreadsheetId, SHEET_NAMES.files, toSheetRow(payload))
}

export async function updateFile(
  context: ServiceContext,
  rowNumber: number,
  payload: FileRecord,
): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await updateRow(context.accessToken, spreadsheetId, SHEET_NAMES.files, rowNumber, toSheetRow(payload))
}

export async function deleteFileRecord(context: ServiceContext, rowNumber: number): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId(context.config)
  await deleteRow(context.accessToken, spreadsheetId, SHEET_NAMES.files, rowNumber)
}
