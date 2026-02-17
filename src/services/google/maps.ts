import type { DistanceInfo } from '../../types'

export async function geocode(address: string, apiKey: string): Promise<{ lat: number; lng: number }> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Błąd Geocoding API (${response.status}).`)
  }

  const payload = (await response.json()) as {
    status: string
    results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }>
    error_message?: string
  }

  if (payload.status !== 'OK') {
    throw new Error(payload.error_message || `Geocoding API zwróciło status: ${payload.status}`)
  }

  const location = payload.results?.[0]?.geometry?.location
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    throw new Error('Brak współrzędnych w odpowiedzi Geocoding API.')
  }

  return { lat: location.lat, lng: location.lng }
}

export async function distance(
  origin: string,
  destination: string,
  apiKey: string,
): Promise<DistanceInfo> {
  const url =
    'https://maps.googleapis.com/maps/api/distancematrix/json' +
    `?origins=${encodeURIComponent(origin)}` +
    `&destinations=${encodeURIComponent(destination)}` +
    '&mode=driving' +
    `&key=${apiKey}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Błąd Distance Matrix API (${response.status}).`)
  }

  const payload = (await response.json()) as {
    status: string
    rows?: Array<{
      elements?: Array<{
        status?: string
        distance?: { value?: number }
        duration?: { value?: number }
      }>
    }>
    error_message?: string
  }

  if (payload.status !== 'OK') {
    throw new Error(payload.error_message || `Distance Matrix API status: ${payload.status}`)
  }

  const element = payload.rows?.[0]?.elements?.[0]
  if (!element || element.status !== 'OK') {
    throw new Error('Nie udało się obliczyć odległości/czasu dojazdu.')
  }

  const meters = element.distance?.value ?? 0
  const seconds = element.duration?.value ?? 0

  return {
    distanceKm: Number((meters / 1000).toFixed(1)),
    travelTimeMin: Math.round(seconds / 60),
  }
}
