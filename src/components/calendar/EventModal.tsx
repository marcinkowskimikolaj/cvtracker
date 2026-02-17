import { Link } from 'react-router-dom'
import { useCalendar } from '../../hooks/useCalendar'
import { useToastStore } from '../../store/toastStore'
import type { CalendarEventRecord, SheetRecord } from '../../types'

interface EventModalProps {
  open: boolean
  event: SheetRecord<CalendarEventRecord> | null
  onClose: () => void
  onEdit: (event: SheetRecord<CalendarEventRecord>) => void
}

export function EventModal({ open, event, onClose, onEdit }: EventModalProps) {
  const { deleteCalendarEvent, updateCalendarEvent, exportEventToGoogleCalendar } = useCalendar()
  const pushToast = useToastStore((state) => state.push)

  if (!open || !event) {
    return null
  }

  const currentEvent = event

  async function handleDelete(): Promise<void> {
    try {
      await deleteCalendarEvent(currentEvent.__rowNumber)
      pushToast({ title: 'Usunięto wydarzenie.', variant: 'success' })
      onClose()
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się usunąć wydarzenia.',
        variant: 'error',
      })
    }
  }

  async function handleExport(): Promise<void> {
    if (currentEvent.google_calendar_event_id) {
      pushToast({ title: 'To wydarzenie jest już w Google Calendar.', variant: 'info' })
      return
    }

    try {
      const googleCalendarEventId = await exportEventToGoogleCalendar(currentEvent)
      await updateCalendarEvent({
        ...currentEvent,
        google_calendar_event_id: googleCalendarEventId,
      })
      pushToast({ title: 'Dodano wydarzenie do Google Calendar.', variant: 'success' })
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się wyeksportować wydarzenia.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="cv-overlay" onClick={onClose}>
      <div className="cv-modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <div className="cv-modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{event.title}</h3>
        </div>

        <div className="cv-modal-body" style={{ display: 'grid', gap: 10 }}>
          <p>
            <strong>Data:</strong> {currentEvent.event_date} {currentEvent.event_time}
          </p>
          <p>
            <strong>Czas trwania:</strong> {currentEvent.duration_minutes} min
          </p>
          <p>
            <strong>Typ:</strong> {currentEvent.event_type}
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>{currentEvent.notes || 'Brak notatek'}</p>
          {currentEvent.app_id ? (
            <Link className="cv-btn cv-btn-secondary" to={`/aplikacje/${currentEvent.app_id}`} onClick={onClose}>
              Otwórz powiązaną aplikację
            </Link>
          ) : null}
        </div>

        <div className="cv-modal-footer">
          <button className="cv-btn cv-btn-secondary" type="button" onClick={() => onEdit(currentEvent)}>
            Edytuj
          </button>
          <button className="cv-btn cv-btn-secondary" type="button" onClick={() => void handleExport()}>
            Dodaj do Google Calendar
          </button>
          <button className="cv-btn cv-btn-danger" type="button" onClick={() => void handleDelete()}>
            Usuń
          </button>
        </div>
      </div>
    </div>
  )
}
