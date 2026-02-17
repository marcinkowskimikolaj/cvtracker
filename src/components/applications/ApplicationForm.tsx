import { useEffect, useState } from 'react'
import { useApplications } from '../../hooks/useApplications'
import { useCompanies } from '../../hooks/useCompanies'
import { useProfile } from '../../hooks/useProfile'
import { useToastStore } from '../../store/toastStore'
import type { ApplicationRecord, ApplicationStatus, Priority, SheetRecord } from '../../types'
import { nowIsoDate, nowIsoDateTime } from '../../utils/dates'
import { calculateHourlyRate } from '../../utils/salary'
import { generateId } from '../../utils/uuid'

interface ApplicationFormProps {
  open: boolean
  editingApplication: SheetRecord<ApplicationRecord> | null
  onClose: () => void
}

export function ApplicationForm({ open, editingApplication, onClose }: ApplicationFormProps) {
  const { activeProfile } = useProfile()
  const { companies } = useCompanies()
  const { createApplication, updateApplication } = useApplications()
  const pushToast = useToastStore((state) => state.push)

  const [companyId, setCompanyId] = useState('')
  const [positionTitle, setPositionTitle] = useState('')
  const [positionUrl, setPositionUrl] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('sent')
  const [priority, setPriority] = useState<Priority>('normal')
  const [appliedDate, setAppliedDate] = useState(nowIsoDate())
  const [monthlySalary, setMonthlySalary] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!editingApplication) {
      setCompanyId('')
      setPositionTitle('')
      setPositionUrl('')
      setStatus('sent')
      setPriority('normal')
      setAppliedDate(nowIsoDate())
      setMonthlySalary(null)
      setNotes('')
      return
    }

    setCompanyId(editingApplication.company_id)
    setPositionTitle(editingApplication.position_title)
    setPositionUrl(editingApplication.position_url)
    setStatus(editingApplication.status)
    setPriority(editingApplication.priority)
    setAppliedDate(editingApplication.applied_date)
    setMonthlySalary(editingApplication.monthly_salary)
    setNotes(editingApplication.notes)
  }, [editingApplication])

  if (!open) {
    return null
  }

  async function handleSave(): Promise<void> {
    if (!companyId || !positionTitle.trim()) {
      pushToast({ title: 'Firma i stanowisko są wymagane.', variant: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      const hourlyRate = calculateHourlyRate(monthlySalary)

      if (editingApplication) {
        await updateApplication({
          ...editingApplication,
          company_id: companyId,
          position_title: positionTitle.trim(),
          position_url: positionUrl.trim(),
          status,
          priority,
          applied_date: appliedDate,
          monthly_salary: monthlySalary,
          hourly_rate: hourlyRate,
          notes: notes.trim(),
          updated_at: nowIsoDateTime(),
        })
      } else {
        await createApplication({
          app_id: generateId(),
          profile_id: activeProfile,
          company_id: companyId,
          position_title: positionTitle.trim(),
          position_url: positionUrl.trim(),
          status,
          priority,
          monthly_salary: monthlySalary,
          hourly_rate: hourlyRate,
          applied_date: appliedDate,
          response_date: '',
          role_description: '',
          notes: notes.trim(),
          created_at: nowIsoDateTime(),
          updated_at: nowIsoDateTime(),
        })
      }

      pushToast({ title: editingApplication ? 'Zaktualizowano aplikację.' : 'Dodano aplikację.', variant: 'success' })
      onClose()
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się zapisać aplikacji.',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="cv-overlay" onClick={onClose}>
      <div className="cv-modal" style={{ maxWidth: 720 }} onClick={(event) => event.stopPropagation()}>
        <div className="cv-modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {editingApplication ? 'Edytuj aplikację' : 'Nowa aplikacja'}
          </h3>
        </div>

        <div className="cv-modal-body" style={{ display: 'grid', gap: 12 }}>
          <select className="cv-input cv-select" value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
            <option value="">Wybierz firmę</option>
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.name}
              </option>
            ))}
          </select>

          <input className="cv-input" placeholder="Stanowisko" value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} />
          <input className="cv-input" placeholder="Link do ogłoszenia" value={positionUrl} onChange={(event) => setPositionUrl(event.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select className="cv-input cv-select" value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus)}>
              <option value="sent">Wysłano</option>
              <option value="interview">Rozmowa</option>
              <option value="waiting">Oczekuję</option>
              <option value="offer">Oferta</option>
              <option value="rejected">Odrzucone</option>
            </select>
            <select className="cv-input cv-select" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              <option value="normal">Normalny</option>
              <option value="high">Wysoki</option>
              <option value="promising">Rokujący</option>
            </select>
          </div>

          <input className="cv-input" type="date" value={appliedDate} onChange={(event) => setAppliedDate(event.target.value)} />

          <input
            className="cv-input"
            type="number"
            min={0}
            placeholder="Oczekiwania miesięczne (PLN brutto)"
            value={monthlySalary ?? ''}
            onChange={(event) => {
              const value = event.target.value.trim()
              setMonthlySalary(value ? Number(value) : null)
            }}
          />

          <textarea className="cv-input cv-textarea" placeholder="Notatki" value={notes} onChange={(event) => setNotes(event.target.value)} />
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
