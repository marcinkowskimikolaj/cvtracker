import { useState } from 'react'
import { useApplications } from '../../hooks/useApplications'
import { useRecruiters } from '../../hooks/useRecruiters'
import { useToastStore } from '../../store/toastStore'
import type { ApplicationRecord, SheetRecord } from '../../types'

interface AttachedRecruitersProps {
  app: SheetRecord<ApplicationRecord>
}

export function AttachedRecruiters({ app }: AttachedRecruitersProps) {
  const { recruiters } = useRecruiters()
  const { appRecruiters, createAppRecruiter, deleteAppRecruiter } = useApplications()
  const pushToast = useToastStore((state) => state.push)

  const [selectedRecruiterId, setSelectedRecruiterId] = useState('')

  const linked = appRecruiters
    .filter((link) => link.app_id === app.app_id)
    .map((link) => ({
      link,
      recruiter: recruiters.find((item) => item.recruiter_id === link.recruiter_id),
    }))

  async function attach(): Promise<void> {
    if (!selectedRecruiterId) {
      return
    }

    try {
      await createAppRecruiter({
        app_id: app.app_id,
        recruiter_id: selectedRecruiterId,
      })
      pushToast({ title: 'Dodano rekrutera do aplikacji.', variant: 'success' })
      setSelectedRecruiterId('')
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się przypisać rekrutera.',
        variant: 'error',
      })
    }
  }

  return (
    <section className="cv-card-nested" style={{ display: 'grid', gap: 10 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Rekruterzy</h3>
      {linked.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Brak powiązanych rekruterów.</p> : null}

      {linked.map(({ link, recruiter }) => (
        <article key={link.__rowNumber} className="cv-card-nested" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 500 }}>
              {recruiter?.first_name} {recruiter?.last_name}
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>{recruiter?.email || '-'}</p>
          </div>
          <button className="cv-btn cv-btn-danger" type="button" onClick={() => void deleteAppRecruiter(link.__rowNumber)}>
            Usuń
          </button>
        </article>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <select
          className="cv-input cv-select"
          value={selectedRecruiterId}
          onChange={(event) => setSelectedRecruiterId(event.target.value)}
        >
          <option value="">Wybierz rekrutera</option>
          {recruiters
            .filter((recruiter) => !linked.some((item) => item.recruiter?.recruiter_id === recruiter.recruiter_id))
            .map((recruiter) => (
              <option key={recruiter.recruiter_id} value={recruiter.recruiter_id}>
                {recruiter.first_name} {recruiter.last_name}
              </option>
            ))}
        </select>
        <button className="cv-btn cv-btn-primary" type="button" onClick={() => void attach()}>
          Dodaj rekrutera
        </button>
      </div>
    </section>
  )
}
