import { useMemo } from 'react'
import { useApplications } from '../../hooks/useApplications'
import { useCalendar } from '../../hooks/useCalendar'
import { useProfile } from '../../hooks/useProfile'
import { useToastStore } from '../../store/toastStore'
import { daysBetween, nowIsoDate, nowIsoDateTime } from '../../utils/dates'
import { generateId } from '../../utils/uuid'

export function SuggestedEvents() {
  const { applications } = useApplications()
  const { createCalendarEvent } = useCalendar()
  const { activeProfile } = useProfile()
  const pushToast = useToastStore((state) => state.push)

  const suggestions = useMemo(() => {
    return applications.filter(
      (application) => application.status === 'waiting' && daysBetween(application.applied_date, nowIsoDateTime()) > 7,
    )
  }, [applications])

  if (suggestions.length === 0) {
    return null
  }

  async function addFollowUp(appId: string, title: string): Promise<void> {
    try {
      await createCalendarEvent({
        event_id: generateId(),
        profile_id: activeProfile,
        app_id: appId,
        title,
        event_date: nowIsoDate(),
        event_time: '10:00',
        duration_minutes: 30,
        event_type: 'follow_up',
        google_calendar_event_id: '',
        notes: 'Sugestia follow-up po 7+ dniach oczekiwania.',
        created_at: nowIsoDateTime(),
      })
      pushToast({ title: 'Dodano sugerowany follow-up.', variant: 'success' })
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się dodać follow-up.',
        variant: 'error',
      })
    }
  }

  return (
    <section className="cv-card-nested" style={{ display: 'grid', gap: 8 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Sugestie follow-up</h3>
      {suggestions.map((application) => {
        const title = `Follow-up: ${application.position_title}`

        return (
          <div
            key={application.app_id}
            className="cv-card-nested"
            style={{ border: '2px dashed var(--border-default)', background: 'var(--bg-card-hover)' }}
          >
            <p style={{ fontWeight: 500 }}>{title}</p>
            <button className="cv-btn cv-btn-primary" type="button" onClick={() => void addFollowUp(application.app_id, title)}>
              Dodaj do kalendarza
            </button>
          </div>
        )
      })}
    </section>
  )
}
