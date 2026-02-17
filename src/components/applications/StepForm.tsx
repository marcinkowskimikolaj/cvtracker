import { useState } from 'react'
import { useApplications } from '../../hooks/useApplications'
import { useCalendar } from '../../hooks/useCalendar'
import { useProfile } from '../../hooks/useProfile'
import { useToastStore } from '../../store/toastStore'
import type { AppStepRecord, ApplicationRecord, SheetRecord, StepType } from '../../types'
import { STEP_TYPE_LABELS } from '../../utils/constants'
import { nowIsoDate, nowIsoDateTime } from '../../utils/dates'
import { generateId } from '../../utils/uuid'

interface StepFormProps {
  app: SheetRecord<ApplicationRecord>
  companyName: string
}

export function StepForm({ app, companyName }: StepFormProps) {
  const { createAppStep } = useApplications()
  const { createCalendarEvent } = useCalendar()
  const { activeProfile } = useProfile()
  const pushToast = useToastStore((state) => state.push)

  const [stepType, setStepType] = useState<StepType>('other')
  const [stepName, setStepName] = useState('')
  const [stepDate, setStepDate] = useState(nowIsoDate())
  const [stepTime, setStepTime] = useState('10:00')
  const [stepNotes, setStepNotes] = useState('')
  const [addToCalendar, setAddToCalendar] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAdd(): Promise<void> {
    if (!stepName.trim()) {
      pushToast({ title: 'Podaj nazwę kroku.', variant: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      const step: AppStepRecord = {
        step_id: generateId(),
        app_id: app.app_id,
        step_type: stepType,
        step_name: stepName.trim(),
        step_date: stepDate,
        step_time: stepTime,
        step_notes: stepNotes.trim(),
        google_calendar_event_id: '',
        created_at: nowIsoDateTime(),
      }

      await createAppStep(step)

      if (addToCalendar) {
        await createCalendarEvent({
          event_id: generateId(),
          profile_id: activeProfile,
          app_id: app.app_id,
          title: `${STEP_TYPE_LABELS[stepType]} — ${companyName} — ${app.position_title}`,
          event_date: stepDate,
          event_time: stepTime,
          duration_minutes: 60,
          event_type: stepType === 'other' ? 'other' : 'interview',
          google_calendar_event_id: '',
          notes: stepNotes.trim(),
          created_at: nowIsoDateTime(),
        })
      }

      pushToast({ title: 'Dodano krok rekrutacji.', variant: 'success' })
      setStepName('')
      setStepNotes('')
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się dodać kroku.',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="cv-card-nested" style={{ display: 'grid', gap: 10 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Dodaj krok rekrutacji</h3>
      <select className="cv-input cv-select" value={stepType} onChange={(event) => setStepType(event.target.value as StepType)}>
        {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map((type) => (
          <option key={type} value={type}>
            {STEP_TYPE_LABELS[type]}
          </option>
        ))}
      </select>
      <input className="cv-input" placeholder="Nazwa kroku" value={stepName} onChange={(event) => setStepName(event.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input className="cv-input" type="date" value={stepDate} onChange={(event) => setStepDate(event.target.value)} />
        <input className="cv-input" type="time" value={stepTime} onChange={(event) => setStepTime(event.target.value)} />
      </div>
      <textarea className="cv-input cv-textarea" placeholder="Notatki" value={stepNotes} onChange={(event) => setStepNotes(event.target.value)} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={addToCalendar} onChange={(event) => setAddToCalendar(event.target.checked)} />
        Dodaj do wewnętrznego kalendarza
      </label>
      <button className="cv-btn cv-btn-primary" type="button" onClick={() => void handleAdd()} disabled={isSubmitting}>
        {isSubmitting ? 'Dodawanie...' : 'Dodaj krok'}
      </button>
    </div>
  )
}
