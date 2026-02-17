import type { RowMeta } from '../../types'

type PrimitiveValue = string | number | boolean | null | undefined

type SheetRowPayload = Record<string, PrimitiveValue>

const headerCache = new Map<string, string[]>()
const sheetIdCache = new Map<string, Map<string, number>>()

function cacheKey(spreadsheetId: string, sheetName: string): string {
  return `${spreadsheetId}::${sheetName}`
}

function normalizeValue(value: PrimitiveValue): string | number | boolean {
  if (value === null || value === undefined) {
    return ''
  }

  return value
}

async function authorizedRequest(input: RequestInfo | URL, accessToken: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Błąd Sheets API (${response.status}): ${body}`)
  }

  return response
}

async function getSheetHeaders(accessToken: string, spreadsheetId: string, sheetName: string): Promise<string[]> {
  const key = cacheKey(spreadsheetId, sheetName)
  const cached = headerCache.get(key)
  if (cached) {
    return cached
  }

  const range = `${sheetName}!1:1`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`
  const response = await authorizedRequest(url, accessToken, { method: 'GET' })
  const payload = (await response.json()) as { values?: string[][] }
  const headers = payload.values?.[0] ?? []

  headerCache.set(key, headers)
  return headers
}

async function getSheetIdMap(accessToken: string, spreadsheetId: string): Promise<Map<string, number>> {
  const cached = sheetIdCache.get(spreadsheetId)
  if (cached) {
    return cached
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`
  const response = await authorizedRequest(url, accessToken, { method: 'GET' })
  const payload = (await response.json()) as {
    sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>
  }

  const map = new Map<string, number>()
  payload.sheets?.forEach((sheet) => {
    const title = sheet.properties?.title
    const sheetId = sheet.properties?.sheetId

    if (title && typeof sheetId === 'number') {
      map.set(title, sheetId)
    }
  })

  sheetIdCache.set(spreadsheetId, map)
  return map
}

export async function readSheet<T extends object>(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
): Promise<Array<T & RowMeta>> {
  const range = `${sheetName}!A:ZZ`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`

  const response = await authorizedRequest(url, accessToken, { method: 'GET' })
  const payload = (await response.json()) as { values?: string[][] }
  const rows = payload.values ?? []

  if (rows.length === 0) {
    return []
  }

  const headers = rows[0] ?? []
  return rows.slice(1).map((values, index) => {
    const row = headers.reduce<Record<string, unknown>>((acc, header, headerIndex) => {
      acc[header] = values[headerIndex] ?? ''
      return acc
    }, {})

    return {
      ...(row as T),
      __rowNumber: index + 2,
    }
  })
}

export async function appendRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  row: SheetRowPayload,
): Promise<void> {
  const headers = await getSheetHeaders(accessToken, spreadsheetId, sheetName)
  const values = headers.map((header) => normalizeValue(row[header]))

  const range = `${sheetName}!A:ZZ`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  await authorizedRequest(url, accessToken, {
    method: 'POST',
    body: JSON.stringify({ values: [values] }),
  })
}

export async function updateRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rowNumber: number,
  row: SheetRowPayload,
): Promise<void> {
  const headers = await getSheetHeaders(accessToken, spreadsheetId, sheetName)
  const values = headers.map((header) => normalizeValue(row[header]))

  const range = `${sheetName}!A${rowNumber}:ZZ${rowNumber}`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`

  await authorizedRequest(url, accessToken, {
    method: 'PUT',
    body: JSON.stringify({ values: [values] }),
  })
}

export async function deleteRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rowNumber: number,
): Promise<void> {
  const sheetMap = await getSheetIdMap(accessToken, spreadsheetId)
  const sheetId = sheetMap.get(sheetName)

  if (typeof sheetId !== 'number') {
    throw new Error(`Nie znaleziono sheetId dla zakładki ${sheetName}.`)
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`
  const body = {
    requests: [
      {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      },
    ],
  }

  await authorizedRequest(url, accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
