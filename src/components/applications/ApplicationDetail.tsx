import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApplications } from '../../hooks/useApplications'
import { useCompanies } from '../../hooks/useCompanies'
import { useToastStore, type ToastVariant } from '../../store/toastStore'
import type {
  AppStepRecord,
  ApplicationRecord,
  ApplicationStatus,
  CompanyRecord,
  Priority,
  SheetRecord,
} from '../../types'
import { nowIsoDateTime } from '../../utils/dates'
import { calculateHourlyRate } from '../../utils/salary'
import { AttachedFiles } from './AttachedFiles'
import { AttachedRecruiters } from './AttachedRecruiters'
import { SalaryCalculator } from './SalaryCalculator'
import { StepForm } from './StepForm'
import { StepTimeline } from './StepTimeline'
import { CompanyMapSection } from '../companies/CompanyMapSection'

interface ApplicationDetailProps {
  appId: string
}

interface ApplicationDetailContentProps {
  app: SheetRecord<ApplicationRecord>
  company: SheetRecord<CompanyRecord> | undefined
  appSteps: Array<SheetRecord<AppStepRecord>>
  updateApplication: (record: SheetRecord<ApplicationRecord>) => Promise<void>
  deleteAppStep: (rowNumber: number) => Promise<void>
  pushToast: (toast: { title: string; variant: ToastVariant }) => void
}

function ApplicationDetailContent({
  app,
  company,
  appSteps,
  updateApplication,
  deleteAppStep,
  pushToast,
}: ApplicationDetailContentProps) {
  const [roleDescription, setRoleDescription] = useState(app.role_description)
  const [notes, setNotes] = useState(app.notes)

  const appRef = useRef(app)

  useEffect(() => {
    appRef.current = app
  }, [app])

  useEffect(() => {
    if (roleDescription === app.role_description) {
      return
    }

    const timer = window.setTimeout(() => {
      const currentApp = appRef.current
      void updateApplication({
        ...currentApp,
        role_description: roleDescription,
        updated_at: nowIsoDateTime(),
      })
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [app.role_description, roleDescription, updateApplication])

  useEffect(() => {
    if (notes === app.notes) {
      return
    }

    const timer = window.setTimeout(() => {
      const currentApp = appRef.current
      void updateApplication({
        ...currentApp,
        notes,
        updated_at: nowIsoDateTime(),
      })
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [app.notes, notes, updateApplication])

  const steps = appSteps.filter((step) => step.app_id === app.app_id)

  async function updateStatus(status: ApplicationStatus): Promise<void> {
    await updateApplication({ ...appRef.current, status, updated_at: nowIsoDateTime() })
  }

  async function updatePriority(priority: Priority): Promise<void> {
    await updateApplication({ ...appRef.current, priority, updated_at: nowIsoDateTime() })
  }

  async function updateSalary(monthlySalary: number | null): Promise<void> {
    await updateApplication({
      ...appRef.current,
      monthly_salary: monthlySalary,
      hourly_rate: calculateHourlyRate(monthlySalary),
      updated_at: nowIsoDateTime(),
    })
  }

  async function handleDeleteStep(rowNumber: number): Promise<void> {
    try {
      await deleteAppStep(rowNumber)
      pushToast({ title: 'Usunięto krok rekrutacji.', variant: 'success' })
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się usunąć kroku.', variant: 'error' })
    }
  }

  return (
    <section className="cv-card page-enter" style={{ display: 'grid', gap: 16 }}>
      <header className="cv-card-nested" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>{app.position_title}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {company ? <Link to={`/firmy/${company.company_id}`}>{company.name}</Link> : 'Brak firmy'}
            </p>
          </div>
          {app.position_url ? (
            <a className="cv-btn cv-btn-secondary" href={app.position_url} target="_blank" rel="noreferrer">
              Otwórz ogłoszenie
            </a>
          ) : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <select className="cv-input cv-select" value={app.status} onChange={(event) => void updateStatus(event.target.value as ApplicationStatus)}>
            <option value="sent">Wysłano</option>
            <option value="interview">Rozmowa</option>
            <option value="waiting">Oczekuję</option>
            <option value="offer">Oferta</option>
            <option value="rejected">Odrzucone</option>
          </select>
          <select className="cv-input cv-select" value={app.priority} onChange={(event) => void updatePriority(event.target.value as Priority)}>
            <option value="normal">Normalny</option>
            <option value="high">Wysoki</option>
            <option value="promising">Rokujący</option>
          </select>
        </div>
      </header>

      <section className="cv-card-nested" style={{ display: 'grid', gap: 8 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>O roli</h3>
        <textarea
          className="cv-input cv-textarea"
          value={roleDescription}
          onChange={(event) => setRoleDescription(event.target.value)}
          placeholder="Opis stanowiska i wymagania"
        />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Autozapis po 2 sekundach.</p>
      </section>

      <SalaryCalculator monthlySalary={app.monthly_salary} onMonthlySalaryChange={(value) => void updateSalary(value)} />

      {company ? <CompanyMapSection company={company} mapHeight={160} /> : null}

      <AttachedFiles app={app} />
      <AttachedRecruiters app={app} />

      <section className="cv-card-nested" style={{ display: 'grid', gap: 12 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Kroki rekrutacji</h3>
        <StepTimeline steps={steps} onDelete={(rowNumber) => void handleDeleteStep(rowNumber)} />
        <StepForm app={app} companyName={company?.name || 'Firma'} />
      </section>

      <section className="cv-card-nested" style={{ display: 'grid', gap: 8 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Notatki</h3>
        <textarea
          className="cv-input cv-textarea"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notatki do aplikacji"
        />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Autozapis po 2 sekundach.</p>
      </section>
    </section>
  )
}

export function ApplicationDetail({ appId }: ApplicationDetailProps) {
  const { applications, updateApplication, appSteps, deleteAppStep } = useApplications()
  const { companies } = useCompanies()
  const pushToast = useToastStore((state) => state.push)

  const app = applications.find((item) => item.app_id === appId)

  const company = useMemo(
    () => companies.find((item) => item.company_id === app?.company_id),
    [app?.company_id, companies],
  )

  if (!app) {
    return (
      <section className="cv-card page-enter">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Nie znaleziono aplikacji</h1>
      </section>
    )
  }

  return (
    <ApplicationDetailContent
      key={app.app_id}
      app={app}
      company={company}
      appSteps={appSteps}
      updateApplication={updateApplication}
      deleteAppStep={deleteAppStep}
      pushToast={pushToast}
    />
  )
}
