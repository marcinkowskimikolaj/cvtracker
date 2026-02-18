import { APP_CONFIG } from '../../config'
import type { ConfigValues } from '../../types'

const CONFIG_RANGE = '_Config!A:B'
const DEFAULT_PROFILE_EMAILS = {
  PROFILE_EMAIL_mikolaj: 'mikolo321@gmail.com',
  PROFILE_EMAIL_emilka: 'aemilka@gmail.com',
} as const

async function appendConfigRows(accessToken: string, rows: Array<[string, string]>): Promise<void> {
  if (rows.length === 0) {
    return
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${APP_CONFIG.configSpreadsheetId}/values/${encodeURIComponent(CONFIG_RANGE)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: rows }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Nie udało się dopisać brakujących kluczy _Config (${response.status}): ${text}`)
  }
}

export async function fetchConfigValues(accessToken: string): Promise<ConfigValues> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${APP_CONFIG.configSpreadsheetId}/values/${encodeURIComponent(CONFIG_RANGE)}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Nie udało się pobrać _Config (${response.status}): ${text}`)
  }

  const payload = (await response.json()) as { values?: string[][] }
  const rows = payload.values ?? []

  const config: ConfigValues = {}
  for (let index = 1; index < rows.length; index += 1) {
    const [key, value] = rows[index] ?? []
    const normalizedKey = key?.trim()
    const normalizedValue = value?.trim()

    if (normalizedKey && normalizedValue) {
      config[normalizedKey] = normalizedValue
    }
  }

  return config
}

export async function ensureProfileEmails(accessToken: string): Promise<ConfigValues> {
  const config = await fetchConfigValues(accessToken)

  const missingRows: Array<[string, string]> = []

  if (!config.PROFILE_EMAIL_mikolaj) {
    missingRows.push(['PROFILE_EMAIL_mikolaj', DEFAULT_PROFILE_EMAILS.PROFILE_EMAIL_mikolaj])
  }

  if (!config.PROFILE_EMAIL_emilka) {
    missingRows.push(['PROFILE_EMAIL_emilka', DEFAULT_PROFILE_EMAILS.PROFILE_EMAIL_emilka])
  }

  if (missingRows.length === 0) {
    return config
  }

  await appendConfigRows(accessToken, missingRows)

  return {
    ...config,
    ...Object.fromEntries(missingRows),
  }
}
