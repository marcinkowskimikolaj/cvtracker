import type { AppStepRecord, SheetRecord } from '../../types'
import { STEP_TYPE_LABELS } from '../../utils/constants'

interface StepTimelineProps {
  steps: Array<SheetRecord<AppStepRecord>>
  onDelete: (rowNumber: number) => void
}

export function StepTimeline({ steps, onDelete }: StepTimelineProps) {
  const sorted = [...steps].sort((a, b) => `${a.step_date} ${a.step_time}`.localeCompare(`${b.step_date} ${b.step_time}`))

  return (
    <div className="cv-timeline">
      {sorted.map((step) => {
        const isFuture = new Date(`${step.step_date}T${step.step_time || '00:00'}:00`).getTime() > Date.now()

        return (
          <div key={step.step_id} className="cv-timeline-item">
            <div className={`cv-timeline-dot ${isFuture ? 'cv-timeline-dot-upcoming' : 'cv-timeline-dot-completed'}`}>
              {isFuture ? '🔲' : '✓'}
            </div>
            <div className="cv-card-nested" style={{ marginLeft: 8 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {step.step_date} {step.step_time}
              </p>
              <p style={{ fontWeight: 600 }}>{step.step_name}</p>
              <p style={{ color: 'var(--text-secondary)' }}>{STEP_TYPE_LABELS[step.step_type]}</p>
              <p style={{ color: 'var(--text-secondary)' }}>{step.step_notes || 'Brak notatek'}</p>
              <button className="cv-btn cv-btn-danger" type="button" onClick={() => onDelete(step.__rowNumber)}>
                Usuń krok
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
