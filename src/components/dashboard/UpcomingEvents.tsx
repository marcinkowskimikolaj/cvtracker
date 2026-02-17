import { Link } from 'react-router-dom'
import type { CalendarEventRecord, SheetRecord } from '../../types'

interface UpcomingEventsProps {
  events: Array<SheetRecord<CalendarEventRecord>>
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <section className="cv-card-sm" style={{ display: 'grid', gap: 8 }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Nadchodzące wydarzenia</h3>

      {events.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Brak nadchodzących wydarzeń.</p> : null}

      {events.map((event) => (
        <Link key={event.event_id} to="/kalendarz" className="cv-card-nested" style={{ textDecoration: 'none' }}>
          <p style={{ fontWeight: 500 }}>{event.title}</p>
          <p style={{ color: 'var(--text-secondary)' }}>
            {event.event_date} {event.event_time}
          </p>
        </Link>
      ))}
    </section>
  )
}
