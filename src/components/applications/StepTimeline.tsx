import { Check } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  )
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const currentTimestamp = nowTimestamp()
  const currentIndex = sorted.findIndex((step) => toStepTimestamp(step) >= currentTimestamp)

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!openPopoverId) {
      return
    }

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      if (target.closest('[data-step-anchor="true"]')) {
        return
      }

      setOpenPopoverId(null)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [openPopoverId])

  useEffect(() => {
    if (!openPopoverId) {
      return
    }

    if (!sorted.some((step) => step.step_id === openPopoverId)) {
      setOpenPopoverId(null)
    }
  }, [openPopoverId, sorted])

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

  function stepState(index: number): 'completed' | 'current' | 'future' {
    if (currentIndex === -1) {
      return 'completed'
    }

    if (index < currentIndex) {
      return 'completed'
    }

    if (index === currentIndex) {
      return 'current'
    }

    return 'future'
  }

  if (isMobile) {
    return (
      <div style={{ position: 'relative', display: 'grid', gap: 10, paddingLeft: 26 }}>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            bottom: 8,
            width: 2,
            background: 'var(--border-default)',
            borderRadius: 9999,
          }}
        />
        {sorted.map((step, index) => {
          const state = stepState(index)
          const isCurrent = state === 'current'
          const isCompleted = state === 'completed'
          const isOpen = openPopoverId === step.step_id

          return (
            <div key={step.step_id} data-step-anchor="true" style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setOpenPopoverId((current) => (current === step.step_id ? null : step.step_id))}
                style={{
                  width: '100%',
                  display: 'grid',
                  gap: 4,
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span
                  className={isCurrent ? 'animate-pulse' : undefined}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: -26,
                    top: 2,
                    width: 16,
                    height: 16,
                    borderRadius: 9999,
                    border: `2px solid ${
                      isCompleted || isCurrent ? 'var(--accent)' : 'var(--border-default)'
                    }`,
                    background: isCompleted || isCurrent ? 'var(--accent)' : 'var(--bg-card)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isCompleted ? <Check size={10} /> : null}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{step.step_name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {step.step_date || '—'} {step.step_time || ''}
                </span>
              </button>

              {isOpen ? (
                <div className="cv-card-nested" style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                  <span className="cv-badge cv-badge-accent">{STEP_TYPE_LABELS[step.step_type]}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {step.step_date || '—'} {step.step_time || ''}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>{step.step_notes || 'Brak notatek do kroku.'}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="cv-btn cv-btn-secondary" type="button" onClick={() => onEdit(step)}>
                      Edytuj
                    </button>
                    <button className="cv-btn cv-btn-danger" type="button" onClick={() => onDelete(step.__rowNumber)}>
                      Usuń
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 18 }}>
        {sorted.map((step, index) => {
          const state = stepState(index)
          const isCurrent = state === 'current'
          const isCompleted = state === 'completed'
          const isOpen = openPopoverId === step.step_id

          return (
            <div key={step.step_id} data-step-anchor="true" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <button
                type="button"
                onClick={() => setOpenPopoverId((current) => (current === step.step_id ? null : step.step_id))}
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
                  {isCompleted ? <Check size={10} /> : null}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: isOpen ? 600 : 500 }}>{step.step_name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {step.step_date || '—'}
                </span>
              </button>

              {isOpen ? (
                <div
                  className="cv-card-nested"
                  style={{
                    position: 'absolute',
                    top: 84,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: 260,
                    zIndex: 10,
                    display: 'grid',
                    gap: 8,
                    boxShadow: 'var(--shadow-dropdown)',
                  }}
                >
                  <span className="cv-badge cv-badge-accent">{STEP_TYPE_LABELS[step.step_type]}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {step.step_date || '—'} {step.step_time || ''}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>{step.step_notes || 'Brak notatek do kroku.'}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="cv-btn cv-btn-secondary" type="button" onClick={() => onEdit(step)}>
                      Edytuj
                    </button>
                    <button className="cv-btn cv-btn-danger" type="button" onClick={() => onDelete(step.__rowNumber)}>
                      Usuń
                    </button>
                  </div>
                </div>
              ) : null}

              {index < sorted.length - 1 ? (
                <span
                  style={{
                    width: 56,
                    height: 2,
                    background:
                      state === 'completed'
                        ? 'var(--accent)'
                        : state === 'current'
                          ? `linear-gradient(to right, var(--accent), var(--border-default))`
                          : 'var(--border-default)',
                    marginTop: 8,
                  }}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
