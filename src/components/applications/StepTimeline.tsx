import { useEffect, useMemo, useState } from 'react'
import type { AppStepRecord, SheetRecord } from '../../types'
import { STEP_TYPE_LABELS } from '../../utils/constants'
import { nowTimestamp } from '../../utils/dates'

interface StepTimelineProps {
  steps: Array<SheetRecord<AppStepRecord>>
  onEdit: (step: SheetRecord<AppStepRecord>) => void
  onDelete: (rowNumber: number) => void
  onRequestAdd: () => void
}

function toStepTimestamp(step: SheetRecord<AppStepRecord>): number {
  const raw = `${step.step_date}T${step.step_time || '00:00'}:00`
  const timestamp = new Date(raw).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function StepTimeline({ steps, onEdit, onDelete, onRequestAdd }: StepTimelineProps) {
  const sorted = useMemo(() => [...steps].sort((a, b) => toStepTimestamp(a) - toStepTimestamp(b)), [steps])
  const [selectedStepId, setSelectedStepId] = useState<string>(sorted[0]?.step_id ?? '')
  const currentTimestamp = nowTimestamp()
  const currentIndex = sorted.findIndex((step) => toStepTimestamp(step) >= currentTimestamp)

  useEffect(() => {
    if (!sorted.length) {
      setSelectedStepId('')
      return
    }

    setSelectedStepId((previous) => {
      if (sorted.some((step) => step.step_id === previous)) {
        return previous
      }

      return sorted[0].step_id
    })
  }, [sorted])

  const selectedStep = sorted.find((step) => step.step_id === selectedStepId) ?? sorted[0] ?? null

  if (sorted.length === 0) {
    return (
      <div className="cv-card-nested" style={{ display: 'grid', gap: 12, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Brak kroków rekrutacji. Dodaj pierwszy krok.</p>
        <div>
          <button className="cv-btn cv-btn-primary" type="button" onClick={onRequestAdd}>
            Dodaj krok
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
        {sorted.map((step, index) => {
          const isCompleted = currentIndex === -1 ? true : index < currentIndex
          const isCurrent = currentIndex !== -1 && index === currentIndex
          const isSelected = selectedStepId === step.step_id

          return (
            <div key={step.step_id} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setSelectedStepId(step.step_id)}
                style={{
                  minWidth: 132,
                  display: 'grid',
                  gap: 8,
                  justifyItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'center',
                  color: 'inherit',
                }}
              >
                <span
                  className={isCurrent ? 'animate-pulse' : undefined}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 9999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${
                      isCompleted || isCurrent ? 'var(--accent)' : 'var(--border-default)'
                    }`,
                    background: isCompleted || isCurrent ? 'var(--accent)' : 'transparent',
                    color: '#fff',
                  }}
                >
                  {isCompleted ? '✓' : ''}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: isSelected ? 600 : 500 }}>{step.step_name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {step.step_date || 'Brak daty'}
                </span>
              </button>
              {index < sorted.length - 1 ? (
                <span
                  style={{
                    width: 56,
                    height: 2,
                    borderTop: `2px ${isCompleted ? 'solid' : 'dashed'} ${
                      isCompleted ? 'var(--accent)' : 'var(--border-default)'
                    }`,
                    marginTop: 8,
                  }}
                />
              ) : null}
            </div>
          )
        })}

        <button
          type="button"
          className="cv-btn cv-btn-secondary cv-btn-icon"
          style={{ marginLeft: 10 }}
          onClick={onRequestAdd}
          title="Dodaj krok"
        >
          +
        </button>
      </div>

      {selectedStep ? (
        <div className="cv-card-nested" style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <p style={{ fontWeight: 600 }}>{selectedStep.step_name}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {STEP_TYPE_LABELS[selectedStep.step_type]} • {selectedStep.step_date} {selectedStep.step_time}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="cv-btn cv-btn-secondary" type="button" onClick={() => onEdit(selectedStep)}>
                Edytuj
              </button>
              <button className="cv-btn cv-btn-danger" type="button" onClick={() => onDelete(selectedStep.__rowNumber)}>
                Usuń
              </button>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{selectedStep.step_notes || 'Brak notatek do kroku.'}</p>
        </div>
      ) : null}
    </div>
  )
}
