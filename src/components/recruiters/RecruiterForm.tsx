import { useEffect, useState } from 'react'
import { useCompanies } from '../../hooks/useCompanies'
import { useProfile } from '../../hooks/useProfile'
import { useRecruiters } from '../../hooks/useRecruiters'
import { useToastStore } from '../../store/toastStore'
import type { RecruiterRecord, SheetRecord } from '../../types'
import { nowIsoDateTime } from '../../utils/dates'
import { generateId } from '../../utils/uuid'

interface RecruiterFormProps {
  open: boolean
  editingRecruiter: SheetRecord<RecruiterRecord> | null
  onClose: () => void
}

export function RecruiterForm({ open, editingRecruiter, onClose }: RecruiterFormProps) {
  const { activeProfile } = useProfile()
  const { companies } = useCompanies()
  const { createRecruiter, updateRecruiter } = useRecruiters()
  const pushToast = useToastStore((state) => state.push)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!editingRecruiter) {
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setLinkedinUrl('')
      setCompanyId('')
      setNotes('')
      return
    }

    setFirstName(editingRecruiter.first_name)
    setLastName(editingRecruiter.last_name)
    setEmail(editingRecruiter.email)
    setPhone(editingRecruiter.phone)
    setLinkedinUrl(editingRecruiter.linkedin_url)
    setCompanyId(editingRecruiter.company_id)
    setNotes(editingRecruiter.notes)
  }, [editingRecruiter])

  if (!open) {
    return null
  }

  async function handleSave(): Promise<void> {
    if (!firstName.trim() || !lastName.trim()) {
      pushToast({ title: 'Imię i nazwisko są wymagane.', variant: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      if (editingRecruiter) {
        await updateRecruiter({
          ...editingRecruiter,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          linkedin_url: linkedinUrl.trim(),
          company_id: companyId,
          notes: notes.trim(),
        })
      } else {
        await createRecruiter({
          recruiter_id: generateId(),
          profile_id: activeProfile,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          linkedin_url: linkedinUrl.trim(),
          company_id: companyId,
          notes: notes.trim(),
          created_at: nowIsoDateTime(),
        })
      }

      pushToast({ title: editingRecruiter ? 'Zaktualizowano rekrutera.' : 'Dodano rekrutera.', variant: 'success' })
      onClose()
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się zapisać rekrutera.',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="cv-overlay" onClick={onClose}>
      <div className="cv-modal" style={{ maxWidth: 680 }} onClick={(event) => event.stopPropagation()}>
        <div className="cv-modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {editingRecruiter ? 'Edytuj rekrutera' : 'Dodaj rekrutera'}
          </h3>
        </div>
        <div className="cv-modal-body" style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input className="cv-input" placeholder="Imię" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            <input className="cv-input" placeholder="Nazwisko" value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </div>
          <input className="cv-input" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className="cv-input" placeholder="Telefon" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <input className="cv-input" placeholder="LinkedIn" value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} />
          <select className="cv-input cv-select" value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
            <option value="">Wybierz firmę (opcjonalnie)</option>
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.name}
              </option>
            ))}
          </select>
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
