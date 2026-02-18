import { dateFnsLocalizer, type EventProps, type View } from 'react-big-calendar'
import { format, getDay, parse, startOfWeek } from 'date-fns'
import { pl } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { Calendar as BigCalendar } from 'react-big-calendar'
import { useNavigate } from 'react-router-dom'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useApplications } from '../../hooks/useApplications'
import { useCalendar } from '../../hooks/useCalendar'
import { useCompanies } from '../../hooks/useCompanies'
import type { CalendarEventRecord, EventType, SheetRecord } from '../../types'
import { formatDate, nowIsoDate, nowTimestamp } from '../../utils/dates'
import { EventForm } from './EventForm'
import { EventModal } from './EventModal'
import { SuggestedEvents } from './SuggestedEvents'

const locales = {
  pl,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
})

interface CalendarEventUi {
  id: string
  title: string
  start: Date
  end: Date
  type: EventType
  source: 'calendar' | 'step' | 'application'
  applicationId?: string
  original?: SheetRecord<CalendarEventRecord>
}

function typeToClass(type: EventType): string {
  switch (type) {
    case 'interview':
      return 'event-interview'
    case 'preparation':
      return 'event-preparation'
    case 'follow_up':
      return 'event-followup'
    case 'deadline':
      return 'event-deadline'
    default:
      return 'event-other'
  }
}

function eventTypeFromStep(stepType: string): EventType {
  if (stepType === 'task') {
    return 'preparation'
  }

  if (stepType === 'offer') {
    return 'deadline'
  }

  if (stepType === 'other') {
    return 'other'
  }

  return 'interview'
}

export function CalendarView() {
  const { calendarEvents, appSteps } = useCalendar()
  const { applications } = useApplications()
  const { companies } = useCompanies()
  const navigate = useNavigate()

  const [activeView, setActiveView] = useState<View>('month')
  const [selectedEvent, setSelectedEvent] = useState<SheetRecord<CalendarEventRecord> | null>(null)
  const [editingEvent, setEditingEvent] = useState<SheetRecord<CalendarEventRecord> | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)
  const todayDate = nowIsoDate()

  const applicationsByDay = useMemo(() => {
    const map = new Map<string, number>()

    for (const application of applications) {
      const key = application.applied_date
      if (!key) {
        continue
      }
      map.set(key, (map.get(key) || 0) + 1)
    }

    return [...map.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((left, right) => right.date.localeCompare(left.date))
  }, [applications])

  const todayApplicationsCount = applicationsByDay.find((entry) => entry.date === todayDate)?.count || 0

  const events = useMemo<CalendarEventUi[]>(() => {
    const currentTimestamp = nowTimestamp()

    const calendarMapped = calendarEvents.map((event) => {
      const start = new Date(`${event.event_date}T${event.event_time || '00:00'}:00`)
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + event.duration_minutes)

      return {
        id: event.event_id,
        title: event.title,
        start,
        end,
        type: event.event_type,
        source: 'calendar' as const,
        original: event,
      }
    })

    const futureSteps = appSteps
      .filter((step) => new Date(`${step.step_date}T${step.step_time || '00:00'}:00`).getTime() > currentTimestamp)
      .map((step) => {
        const application = applications.find((item) => item.app_id === step.app_id)
        const start = new Date(`${step.step_date}T${step.step_time || '00:00'}:00`)
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + 60)

        return {
          id: `step-${step.step_id}`,
          title: `${step.step_name} — ${application?.position_title || 'Aplikacja'}`,
          start,
          end,
          type: eventTypeFromStep(step.step_type),
          source: 'step' as const,
        }
      })

    const appliedEvents = applications
      .filter((application) => Boolean(application.applied_date))
      .map((application) => {
        const companyName = companies.find((item) => item.company_id === application.company_id)?.name || 'Firma'
        const start = new Date(`${application.applied_date}T09:00:00`)
        const end = new Date(`${application.applied_date}T09:30:00`)

        return {
          id: `application-${application.app_id}`,
          title: `Aplikacja wysłana — ${companyName} — ${application.position_title}`,
          start,
          end,
          type: 'other' as const,
          source: 'application' as const,
          applicationId: application.app_id,
        }
      })

    return [...calendarMapped, ...futureSteps, ...appliedEvents]
  }, [appSteps, applications, calendarEvents, companies])

  return (
    <section className="cv-card page-enter" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Kalendarz</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Wydarzenia rekrutacyjne i terminy follow-up.</p>
        </div>
        <button
          className="cv-btn cv-btn-primary"
          type="button"
          onClick={() => {
            setEditingEvent(null)
            setDefaultDate(undefined)
            setShowForm(true)
          }}
        >
          Dodaj wydarzenie
        </button>
      </div>

      <SuggestedEvents />

      <section className="cv-card-nested" style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Aplikacje wysłane dziennie</h2>
          <span className="cv-badge cv-badge-default">
            Dzisiaj: {todayApplicationsCount}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {applicationsByDay.length ? (
            applicationsByDay.slice(0, 12).map((entry) => (
              <span key={entry.date} className="cv-badge cv-badge-default">
                {formatDate(entry.date)}: {entry.count}
              </span>
            ))
          ) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Brak wysłanych aplikacji do pokazania.
            </span>
          )}
        </div>
      </section>

      <div className="cv-card-nested" style={{ padding: 16 }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={activeView}
          onView={(nextView: View) => setActiveView(nextView)}
          views={['month', 'week', 'day']}
          style={{ height: 700 }}
          eventPropGetter={(event: CalendarEventUi) => ({ className: typeToClass(event.type) })}
          onSelectEvent={(event: CalendarEventUi) => {
            if (event.source === 'calendar' && event.original) {
              setSelectedEvent(event.original)
              return
            }

            if (event.source === 'application' && event.applicationId) {
              navigate(`/aplikacje/${event.applicationId}`)
            }
          }}
          onSelectSlot={(slot: { start: Date }) => {
            const isoDate = slot.start.toISOString().slice(0, 10)
            setEditingEvent(null)
            setDefaultDate(isoDate)
            setShowForm(true)
          }}
          selectable
          components={{
            event: ({ event }: EventProps<CalendarEventUi>) => <span>{event.title}</span>,
          }}
          messages={{
            date: 'Data',
            time: 'Godzina',
            event: 'Wydarzenie',
            allDay: 'Cały dzień',
            week: 'Tydzień',
            work_week: 'Tydzień roboczy',
            day: 'Dzień',
            month: 'Miesiąc',
            previous: 'Wstecz',
            next: 'Dalej',
            yesterday: 'Wczoraj',
            tomorrow: 'Jutro',
            today: 'Dzisiaj',
            agenda: 'Agenda',
            noEventsInRange: 'Brak wydarzeń w tym zakresie.',
            showMore: (total: number) => `+${total} więcej`,
          }}
        />
      </div>

      <EventModal
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={(event) => {
          setSelectedEvent(null)
          setEditingEvent(event)
          setShowForm(true)
        }}
      />

      <EventForm
        open={showForm}
        editingEvent={editingEvent}
        defaultDate={defaultDate}
        onClose={() => {
          setShowForm(false)
          setEditingEvent(null)
          setDefaultDate(undefined)
        }}
      />
    </section>
  )
}
