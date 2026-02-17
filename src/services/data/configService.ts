import { APP_CONFIG } from '../../config'
import type { ConfigValues } from '../../types'

const CONFIG_RANGE = '_Config!A:B'

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
    if (key && value) {
      config[key] = value
    }
  }

  return config
}
