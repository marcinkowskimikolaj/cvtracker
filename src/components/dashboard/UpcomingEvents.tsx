import { Link } from 'react-router-dom'
import type { CalendarEventRecord, SheetRecord } from '../../types'

interface UpcomingEventsProps {
  events: Array<SheetRecord<CalendarEventRecord>>
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <section className="cv-card-sm" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Nadchodzące wydarzenia</h3>
        <Link to="/kalendarz" className="cv-badge cv-badge-accent" style={{ textDecoration: 'none' }}>
          Kalendarz
        </Link>
      </div>

      {events.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Brak nadchodzących wydarzeń.</p> : null}

      {events.length > 0 ? (
        <div className="cv-premium-events-list">
          {events.map((event) => (
            <Link key={event.event_id} to="/kalendarz" className="cv-card-nested cv-premium-event-item">
              <div className="cv-premium-event-time">
                <div>{event.event_date.slice(5)}</div>
                <div>{event.event_time || '--:--'}</div>
              </div>
              <div className="cv-premium-event-meta">
                <p style={{ fontWeight: 600 }}>{event.title}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{event.notes || 'Bez dodatkowych notatek.'}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  )
}
