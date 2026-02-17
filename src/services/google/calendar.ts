interface CalendarEventInput {
  title: string
  startDateTime: string
  endDateTime: string
  description?: string
  location?: string
}

export async function insertEvent(params: {
  accessToken: string
  event: CalendarEventInput
}): Promise<{ googleCalendarEventId: string }> {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: params.event.title,
      description: params.event.description,
      location: params.event.location,
      start: {
        dateTime: params.event.startDateTime,
        timeZone: 'Europe/Warsaw',
      },
      end: {
        dateTime: params.event.endDateTime,
        timeZone: 'Europe/Warsaw',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'email', minutes: 60 * 24 },
        ],
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Błąd Calendar API (${response.status}): ${text}`)
  }

  const payload = (await response.json()) as { id?: string }

  if (!payload.id) {
    throw new Error('Google Calendar nie zwrócił ID wydarzenia.')
  }

  return { googleCalendarEventId: payload.id }
}
