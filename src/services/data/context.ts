import { APP_CONFIG } from '../../config'
import type { ConfigValues, ProfileId } from '../../types'

export interface ServiceContext {
  accessToken: string
  profileId: ProfileId
  config: ConfigValues
}

export function resolveSpreadsheetId(config: ConfigValues): string {
  return config.SPREADSHEET_ID || APP_CONFIG.configSpreadsheetId
}

export function parseNumber(value: string): number | null {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function stringifyNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return ''
  }

  return String(value)
}
