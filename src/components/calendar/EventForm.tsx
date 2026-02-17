import { useEffect, useState } from 'react'
import { useApplications } from '../../hooks/useApplications'
import { useCalendar } from '../../hooks/useCalendar'
import { useProfile } from '../../hooks/useProfile'
import { useToastStore } from '../../store/toastStore'
import type { CalendarEventRecord, EventType, SheetRecord } from '../../types'
import { EVENT_TYPE_LABELS } from '../../utils/constants'
import { nowIsoDate, nowIsoDateTime } from '../../utils/dates'
import { generateId } from '../../utils/uuid'

interface EventFormProps {
  open: boolean
  editingEvent: SheetRecord<CalendarEventRecord> | null
  defaultDate?: string
  onClose: () => void
}

export function EventForm({ open, editingEvent, defaultDate, onClose }: EventFormProps) {
  const { activeProfile } = useProfile()
  const { applications } = useApplications()
  const { createCalendarEvent, updateCalendarEvent } = useCalendar()
  const pushToast = useToastStore((state) => state.push)

  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState(defaultDate || nowIsoDate())
  const [eventTime, setEventTime] = useState('10:00')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [eventType, setEventType] = useState<EventType>('other')
  const [linkedAppId, setLinkedAppId] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!editingEvent) {
      setTitle('')
      setEventDate(defaultDate || nowIsoDate())
      setEventTime('10:00')
      setDurationMinutes(60)
      setEventType('other')
      setLinkedAppId('')
      setNotes('')
      return
    }

    setTitle(editingEvent.title)
    setEventDate(editingEvent.event_date)
    setEventTime(editingEvent.event_time)
    setDurationMinutes(editingEvent.duration_minutes)
    setEventType(editingEvent.event_type)
    setLinkedAppId(editingEvent.app_id)
    setNotes(editingEvent.notes)
  }, [defaultDate, editingEvent])

  if (!open) {
    return null
  }

  async function handleSave(): Promise<void> {
    if (!title.trim()) {
      pushToast({ title: 'Tytuł wydarzenia jest wymagany.', variant: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      if (editingEvent) {
        await updateCalendarEvent({
          ...editingEvent,
          title: title.trim(),
          event_date: eventDate,
          event_time: eventTime,
          duration_minutes: durationMinutes,
          event_type: eventType,
          app_id: linkedAppId,
          notes: notes.trim(),
        })
      } else {
        await createCalendarEvent({
          event_id: generateId(),
          profile_id: activeProfile,
          app_id: linkedAppId,
          title: title.trim(),
          event_date: eventDate,
          event_time: eventTime,
          duration_minutes: durationMinutes,
          event_type: eventType,
          google_calendar_event_id: '',
          notes: notes.trim(),
          created_at: nowIsoDateTime(),
        })
      }

      pushToast({ title: editingEvent ? 'Zaktualizowano wydarzenie.' : 'Dodano wydarzenie.', variant: 'success' })
      onClose()
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się zapisać wydarzenia.', variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="cv-overlay" onClick={onClose}>
      <div className="cv-modal" style={{ maxWidth: 680 }} onClick={(event) => event.stopPropagation()}>
        <div className="cv-modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{editingEvent ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}</h3>
        </div>

        <div className="cv-modal-body" style={{ display: 'grid', gap: 12 }}>
          <input className="cv-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tytuł wydarzenia" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <input className="cv-input" type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
            <input className="cv-input" type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} />
            <input
              className="cv-input"
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value) || 60)}
            />
          </div>

          <select className="cv-input cv-select" value={eventType} onChange={(event) => setEventType(event.target.value as EventType)}>
            {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => (
              <option key={type} value={type}>
                {EVENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>

          <select className="cv-input cv-select" value={linkedAppId} onChange={(event) => setLinkedAppId(event.target.value)}>
            <option value="">Bez powiązanej aplikacji</option>
            {applications.map((application) => (
              <option key={application.app_id} value={application.app_id}>
                {application.position_title}
              </option>
            ))}
          </select>

          <textarea className="cv-input cv-textarea" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notatki" />
        </div>

        <div className="cv-modal-footer">
          <button className="cv-btn cv-btn-secondary" type="button" onClick={onClose}>
            Anuluj
          </button>
          <button className="cv-btn cv-btn-primary" type="button" onClick={() => void handleSave()} disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </div>
      </div>
    </div>
  )
}
