import {
  ArrowLeft,
  Building2,
  Calendar as CalendarIcon,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Star,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApplications } from '../../hooks/useApplications'
import { useAuth } from '../../hooks/useAuth'
import { useCalendar } from '../../hooks/useCalendar'
import { useCompanies } from '../../hooks/useCompanies'
import { useFiles } from '../../hooks/useFiles'
import { useProfile } from '../../hooks/useProfile'
import { insertEvent } from '../../services/google/calendar'
import { resolveUploadFolderId, uploadFile } from '../../services/google/drive'
import { useToastStore } from '../../store/toastStore'
import type {
  AppStepRecord,
  ApplicationRecord,
  ApplicationStatus,
  SheetRecord,
  StepType,
} from '../../types'
import { STATUS_LABELS, STEP_TYPE_LABELS } from '../../utils/constants'
import { nowIsoDate, nowIsoDateTime } from '../../utils/dates'
import { calculateHourlyRate } from '../../utils/salary'
import { generateId } from '../../utils/uuid'
import { AttachedFiles } from './AttachedFiles'
import { AttachedRecruiters } from './AttachedRecruiters'
import { StepForm } from './StepForm'
import { StepTimeline } from './StepTimeline'
import { CompanyMapSection } from '../companies/CompanyMapSection'

interface ApplicationDetailProps {
  appId: string
}

function statusBadgeClass(status: ApplicationStatus): string {
  switch (status) {
    case 'sent':
      return 'cv-badge cv-badge-sent'
    case 'interview':
      return 'cv-badge cv-badge-interview'
    case 'waiting':
      return 'cv-badge cv-badge-waiting'
    case 'offer':
      return 'cv-badge cv-badge-offer'
    case 'rejected':
      return 'cv-badge cv-badge-rejected'
    default:
      return 'cv-badge cv-badge-sent'
  }
}

function toStepTimestamp(step: SheetRecord<AppStepRecord>): number {
  const timestamp = new Date(`${step.step_date}T${step.step_time || '00:00'}:00`).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function addDaysIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatMonthlySalary(value: number | null): string {
  if (value === null) {
    return 'Brak danych'
  }

  return `${new Intl.NumberFormat('pl-PL').format(value)} PLN`
}

function formatHourlySalary(value: number | null): string {
  if (value === null) {
    return 'Brak danych'
  }

  return `${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} PLN`
}

export function ApplicationDetail({ appId }: ApplicationDetailProps) {
  const { accessToken, config } = useAuth()
  const { activeProfile } = useProfile()
  const { companies } = useCompanies()
  const { files, createFile } = useFiles()
  const { createCalendarEvent } = useCalendar()
  const {
    applications,
    appSteps,
    appFiles,
    createAppFile,
    deleteAppFile,
    createAppStep,
    updateAppStep,
    deleteAppStep,
    updateApplication,
  } = useApplications()
  const pushToast = useToastStore((state) => state.push)
  const app = applications.find((item) => item.app_id === appId)
  const appRef = useRef<SheetRecord<ApplicationRecord> | null>(app ?? null)

  const [roleDescription, setRoleDescription] = useState(app?.role_description ?? '')
  const [notes, setNotes] = useState(app?.notes ?? '')
  const [showStepForm, setShowStepForm] = useState(false)
  const [editingSalary, setEditingSalary] = useState(false)
  const [salaryDraft, setSalaryDraft] = useState('')
  const [editingStep, setEditingStep] = useState<SheetRecord<AppStepRecord> | null>(null)
  const [isQuickInterviewOpen, setIsQuickInterviewOpen] = useState(false)
  const [quickInterviewType, setQuickInterviewType] = useState<StepType>('phone_interview')
  const [quickInterviewDate, setQuickInterviewDate] = useState(nowIsoDate())
  const [quickInterviewTime, setQuickInterviewTime] = useState('10:00')
  const [quickInterviewNotes, setQuickInterviewNotes] = useState('')
  const [quickInterviewSubmitting, setQuickInterviewSubmitting] = useState(false)
  const [isUploadingOffer, setIsUploadingOffer] = useState(false)
  const [isOfferDragActive, setIsOfferDragActive] = useState(false)

  const company = useMemo(
    () => companies.find((item) => item.company_id === app?.company_id),
    [app?.company_id, companies],
  )

  const steps = useMemo(
    () => appSteps.filter((step) => step.app_id === appId).sort((a, b) => toStepTimestamp(a) - toStepTimestamp(b)),
    [appId, appSteps],
  )

  const nearestFutureStep = useMemo(
    () => steps.find((step) => toStepTimestamp(step) >= Date.now()),
    [steps],
  )

  const offerFile = useMemo(() => {
    if (!app?.job_offer_file_id) {
      return null
    }
    return files.find((file) => file.file_id === app.job_offer_file_id) ?? null
  }, [app?.job_offer_file_id, files])

  const offerLinks = useMemo(
    () => {
      if (!app?.job_offer_file_id) {
        return []
      }

      return appFiles.filter((link) => link.app_id === appId && link.file_id === app.job_offer_file_id)
    },
    [app?.job_offer_file_id, appFiles, appId],
  )

  useEffect(() => {
    appRef.current = app ?? null
    if (app) {
      setRoleDescription(app.role_description)
      setNotes(app.notes)
      setSalaryDraft(app.monthly_salary !== null ? String(app.monthly_salary) : '')
    }
  }, [app])

  useEffect(() => {
    if (!appRef.current || roleDescription === appRef.current.role_description) {
      return
    }

    const timeout = window.setTimeout(() => {
      const current = appRef.current
      if (!current) {
        return
      }
      void updateApplication({
        ...current,
        role_description: roleDescription,
        updated_at: nowIsoDateTime(),
      })
    }, 2000)

    return () => window.clearTimeout(timeout)
  }, [roleDescription, updateApplication])

  useEffect(() => {
    if (!appRef.current || notes === appRef.current.notes) {
      return
    }

    const timeout = window.setTimeout(() => {
      const current = appRef.current
      if (!current) {
        return
      }
      void updateApplication({
        ...current,
        notes,
        updated_at: nowIsoDateTime(),
      })
    }, 2000)

    return () => window.clearTimeout(timeout)
  }, [notes, updateApplication])

  if (!app) {
    return (
      <section className="cv-card page-enter">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Nie znaleziono aplikacji</h1>
      </section>
    )
  }

  const currentApp = app

  async function patchApplication(patch: Partial<ApplicationRecord>): Promise<void> {
    const current = appRef.current
    if (!current) {
      return
    }
    await updateApplication({
      ...current,
      ...patch,
      updated_at: nowIsoDateTime(),
    })
  }

  async function handleSetRating(value: number): Promise<void> {
    try {
      await patchApplication({ excitement_rating: value })
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się zaktualizować oceny.', variant: 'error' })
    }
  }

  async function handleRejectAction(): Promise<void> {
    try {
      await patchApplication({
        status: 'rejected',
        response_date: currentApp.response_date || nowIsoDate(),
      })
      pushToast({ title: 'Aplikacja oznaczona jako odrzucona.', variant: 'success' })
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się zmienić statusu.', variant: 'error' })
    }
  }

  async function handleCreateFollowUp(): Promise<void> {
    try {
      await createCalendarEvent({
        event_id: generateId(),
        profile_id: activeProfile,
        app_id: currentApp.app_id,
        title: `Follow-up: ${company?.name || 'Firma'} — ${currentApp.position_title}`,
        event_date: addDaysIso(3),
        event_time: '10:00',
        duration_minutes: 30,
        event_type: 'follow_up',
        google_calendar_event_id: '',
        notes: 'Automatycznie dodany follow-up z karty aplikacji.',
        created_at: nowIsoDateTime(),
      })
      pushToast({ title: 'Dodano wydarzenie follow-up za 3 dni.', variant: 'success' })
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się utworzyć follow-up.', variant: 'error' })
    }
  }

  async function handleExportNearestStep(): Promise<void> {
    if (!nearestFutureStep) {
      pushToast({ title: 'Brak przyszłego kroku do eksportu.', variant: 'info' })
      return
    }

    if (!accessToken) {
      pushToast({ title: 'Brak aktywnej sesji Google.', variant: 'error' })
      return
    }

    try {
      const startDateTime = `${nearestFutureStep.step_date}T${nearestFutureStep.step_time || '10:00'}:00`
      const end = new Date(startDateTime)
      end.setMinutes(end.getMinutes() + 60)

      await insertEvent({
        accessToken,
        event: {
          title: `${nearestFutureStep.step_name} — ${company?.name || 'Firma'} — ${currentApp.position_title}`,
          description: nearestFutureStep.step_notes,
          startDateTime,
          endDateTime: end.toISOString(),
          location: company?.address || undefined,
        },
      })

      pushToast({ title: 'Wyeksportowano najbliższy krok do Google Calendar.', variant: 'success' })
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się wyeksportować kroku.', variant: 'error' })
    }
  }

  async function handleQuickInterviewCreate(): Promise<void> {
    setQuickInterviewSubmitting(true)
    try {
      await createAppStep({
        step_id: generateId(),
        app_id: currentApp.app_id,
        step_type: quickInterviewType,
        step_name: quickInterviewType === 'phone_interview' ? 'Rozmowa telefoniczna' : 'Rozmowa',
        step_date: quickInterviewDate,
        step_time: quickInterviewTime,
        step_notes: quickInterviewNotes.trim(),
        google_calendar_event_id: '',
        created_at: nowIsoDateTime(),
      })

      pushToast({ title: 'Dodano rozmowę do osi rekrutacji.', variant: 'success' })
      setIsQuickInterviewOpen(false)
      setQuickInterviewNotes('')
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się dodać rozmowy.', variant: 'error' })
    } finally {
      setQuickInterviewSubmitting(false)
    }
  }

  async function handleStepEditSave(): Promise<void> {
    if (!editingStep) {
      return
    }

    try {
      await updateAppStep({
        ...editingStep,
        created_at: editingStep.created_at || nowIsoDateTime(),
      })
      pushToast({ title: 'Zaktualizowano krok rekrutacji.', variant: 'success' })
      setEditingStep(null)
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się zaktualizować kroku.', variant: 'error' })
    }
  }

  async function handleStepDelete(rowNumber: number): Promise<void> {
    try {
      await deleteAppStep(rowNumber)
      pushToast({ title: 'Usunięto krok rekrutacji.', variant: 'success' })
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się usunąć kroku.', variant: 'error' })
    }
  }

  async function handleOfferUpload(file: File): Promise<void> {
    if (file.type !== 'application/pdf') {
      pushToast({ title: 'Możesz dodać tylko plik PDF.', variant: 'error' })
      return
    }

    if (!accessToken) {
      pushToast({ title: 'Brak aktywnej sesji Google.', variant: 'error' })
      return
    }

    if (!config.GOOGLE_DRIVE_FOLDER_ID) {
      pushToast({ title: 'Brak GOOGLE_DRIVE_FOLDER_ID w _Config.', variant: 'error' })
      return
    }

    setIsUploadingOffer(true)

    try {
      const folderId = await resolveUploadFolderId(accessToken, config.GOOGLE_DRIVE_FOLDER_ID, activeProfile, 'other')
      const uploaded = await uploadFile({
        accessToken,
        file,
        fileName: file.name,
        parentFolderId: folderId,
      })
      const newOfferFileId = generateId()
      await createFile({
        file_id: newOfferFileId,
        profile_id: activeProfile,
        file_name: `Oferta — ${company?.name || 'Firma'} — ${currentApp.position_title}`,
        file_type: 'other',
        drive_file_id: uploaded.driveFileId,
        drive_url: uploaded.driveUrl,
        description: 'Plik PDF oferty pracy z karty aplikacji.',
        version_label: 'Oferta',
        created_at: nowIsoDateTime(),
      })
      await createAppFile({
        app_id: currentApp.app_id,
        file_id: newOfferFileId,
        attached_at: nowIsoDateTime(),
      })
      await patchApplication({ job_offer_file_id: newOfferFileId })
      pushToast({ title: 'Dodano plik oferty pracy.', variant: 'success' })
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się dodać pliku oferty.', variant: 'error' })
    } finally {
      setIsUploadingOffer(false)
    }
  }

  async function handleOfferRemove(): Promise<void> {
    if (!currentApp.job_offer_file_id) {
      return
    }

    try {
      for (const link of offerLinks) {
        await deleteAppFile(link.__rowNumber)
      }
      await patchApplication({ job_offer_file_id: '' })
      pushToast({ title: 'Usunięto powiązanie pliku oferty z aplikacją.', variant: 'success' })
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się usunąć pliku oferty.', variant: 'error' })
    }
  }

  async function handleSalarySave(): Promise<void> {
    const trimmed = salaryDraft.trim()
    const monthlySalary = trimmed ? Number(trimmed) : null

    if (trimmed && Number.isNaN(monthlySalary)) {
      pushToast({ title: 'Niepoprawna wartość stawki miesięcznej.', variant: 'error' })
      return
    }

    try {
      await patchApplication({
        monthly_salary: monthlySalary,
        hourly_rate: calculateHourlyRate(monthlySalary),
      })
      setEditingSalary(false)
      pushToast({ title: 'Zaktualizowano oczekiwania finansowe.', variant: 'success' })
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się zaktualizować finansów.', variant: 'error' })
    }
  }

  return (
    <section className="page-enter" style={{ display: 'grid', gap: 16 }}>
      <header className="cv-card" style={{ display: 'grid', gap: 16 }}>
        <Link to="/aplikacje" className="cv-btn cv-btn-ghost" style={{ justifySelf: 'start' }}>
          <ArrowLeft size={16} />
          Aplikacje
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="cv-file-icon cv-file-icon-other">
                <Building2 size={18} />
              </span>
              {company ? (
                <Link to={`/firmy/${company.company_id}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {company.name}
                </Link>
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>Brak firmy</span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }}>{app.position_title}</h1>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((value) => {
                const active = (app.excitement_rating ?? 3) >= value
                return (
                  <button
                    key={value}
                    type="button"
                    className="cv-btn cv-btn-ghost cv-btn-icon"
                    style={{ padding: 4 }}
                    onClick={() => void handleSetRating(value)}
                    title={`Ocena ${value}/5`}
                  >
                    <Star size={18} fill={active ? 'var(--accent)' : 'transparent'} color={active ? 'var(--accent)' : 'var(--text-tertiary)'} />
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10, alignContent: 'start', minWidth: 240 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span className={statusBadgeClass(app.status)}>{STATUS_LABELS[app.status]}</span>
              <select
                className="cv-input cv-select"
                style={{ maxWidth: 200 }}
                value={app.status}
                onChange={(event) => void patchApplication({ status: event.target.value as ApplicationStatus })}
              >
                <option value="sent">Wysłano</option>
                <option value="interview">Rozmowa</option>
                <option value="waiting">Oczekuję</option>
                <option value="offer">Oferta</option>
                <option value="rejected">Odrzucone</option>
              </select>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Data aplikacji: {app.applied_date || '-'}</span>
            {app.position_url ? (
              <a className="cv-btn cv-btn-secondary" href={app.position_url} target="_blank" rel="noreferrer">
                <ExternalLink size={14} />
                Link do ogłoszenia
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="cv-card" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button className="cv-btn cv-btn-secondary" type="button" onClick={() => setIsQuickInterviewOpen(true)}>
          <Phone size={16} />
          Dodaj rozmowę
        </button>
        <button className="cv-btn cv-btn-danger" type="button" onClick={() => void handleRejectAction()}>
          <XCircle size={16} />
          Oznacz jako odrzucone
        </button>
        <button className="cv-btn cv-btn-secondary" type="button" onClick={() => void handleCreateFollowUp()}>
          <Mail size={16} />
          Wyślij follow-up
        </button>
        <button className="cv-btn cv-btn-ghost" type="button" onClick={() => void handleExportNearestStep()}>
          <CalendarIcon size={16} />
          Eksport do kalendarza
        </button>
      </section>

      <section className="cv-card" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Przebieg rekrutacji</h2>
          <button className="cv-btn cv-btn-ghost" type="button" onClick={() => setShowStepForm((value) => !value)}>
            {showStepForm ? 'Ukryj formularz kroku' : 'Dodaj krok'}
          </button>
        </div>

        <StepTimeline
          steps={steps}
          onDelete={(rowNumber) => void handleStepDelete(rowNumber)}
          onEdit={(step) => setEditingStep(step)}
          onRequestAdd={() => setShowStepForm(true)}
        />

        {showStepForm ? <StepForm app={app} companyName={company?.name || 'Firma'} /> : null}
      </section>

      <section
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          alignItems: 'start',
        }}
      >
        <article className="cv-card" style={{ gridRow: 'span 2', display: 'grid', gap: 12 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Oferta pracy</h3>
          {!offerFile ? (
            <div
              className="cv-card-nested"
              style={{
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: isOfferDragActive ? 'var(--accent)' : 'var(--border-default)',
                minHeight: 260,
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
                gap: 10,
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setIsOfferDragActive(true)
              }}
              onDragLeave={(event) => {
                event.preventDefault()
                setIsOfferDragActive(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setIsOfferDragActive(false)
                const file = event.dataTransfer.files?.[0]
                if (file) {
                  void handleOfferUpload(file)
                }
              }}
            >
              <p style={{ fontWeight: 600 }}>Przeciągnij PDF z ofertą</p>
              <p style={{ color: 'var(--text-secondary)' }}>lub wybierz plik z dysku</p>
              <label className="cv-btn cv-btn-primary" style={{ cursor: isUploadingOffer ? 'wait' : 'pointer' }}>
                {isUploadingOffer ? 'Wysyłanie...' : 'Prześlij PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  disabled={isUploadingOffer}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      void handleOfferUpload(file)
                    }
                  }}
                />
              </label>
            </div>
          ) : (
            <>
              <iframe
                title={`Podgląd oferty ${offerFile.file_name}`}
                src={`https://drive.google.com/file/d/${offerFile.drive_file_id}/preview`}
                style={{ width: '100%', minHeight: 420, border: '1px solid var(--border-default)', borderRadius: 12 }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a className="cv-btn cv-btn-secondary" href={offerFile.drive_url} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} />
                  Otwórz w Drive
                </a>
                <a
                  className="cv-btn cv-btn-ghost"
                  href={`https://drive.google.com/uc?export=download&id=${offerFile.drive_file_id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={14} />
                  Pobierz
                </a>
                <button className="cv-btn cv-btn-danger" type="button" onClick={() => void handleOfferRemove()}>
                  Usuń
                </button>
              </div>
            </>
          )}
        </article>

        <article className="cv-card" style={{ display: 'grid', gap: 12 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Firma</h3>
          {company ? (
            <>
              <Link to={`/firmy/${company.company_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{company.name}</p>
              </Link>
              <p style={{ color: 'var(--text-secondary)' }}>{company.industry || 'Brak branży'}</p>
              <CompanyMapSection company={company} mapHeight={160} />
            </>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Brak danych firmy.</p>
          )}
        </article>

        <article className="cv-card" style={{ display: 'grid', gap: 10 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Finanse</h3>
          {!editingSalary ? (
            <>
              <p style={{ fontSize: '1.9rem', fontWeight: 700 }}>{formatMonthlySalary(app.monthly_salary)}</p>
              <p style={{ color: 'var(--text-secondary)' }}>/ miesiąc</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>{formatHourlySalary(app.hourly_rate)}</p>
              <p style={{ color: 'var(--text-secondary)' }}>/ godzina</p>
              <button className="cv-btn cv-btn-secondary" type="button" onClick={() => setEditingSalary(true)}>
                Edytuj
              </button>
            </>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              <input
                className="cv-input"
                type="number"
                min={0}
                value={salaryDraft}
                onChange={(event) => setSalaryDraft(event.target.value)}
                placeholder="Stawka miesięczna PLN"
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="cv-btn cv-btn-primary" type="button" onClick={() => void handleSalarySave()}>
                  Zapisz
                </button>
                <button className="cv-btn cv-btn-ghost" type="button" onClick={() => setEditingSalary(false)}>
                  Anuluj
                </button>
              </div>
            </div>
          )}
        </article>

        <AttachedRecruiters app={app} />
        <AttachedFiles app={app} />

        <article className="cv-card" style={{ gridColumn: 'span 2', display: 'grid', gap: 8 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Opis roli</h3>
          <textarea
            className="cv-input cv-textarea"
            style={{ minHeight: 140 }}
            value={roleDescription}
            onChange={(event) => setRoleDescription(event.target.value)}
            placeholder="Wklej opis stanowiska, wymagania, zakres obowiązków..."
          />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Autozapis po 2 sekundach.</p>
        </article>

        <article className="cv-card" style={{ display: 'grid', gap: 8 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Notatki</h3>
          <textarea
            className="cv-input cv-textarea"
            style={{ minHeight: 140 }}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Twoje notatki, wrażenia i pytania do zadania..."
          />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Autozapis po 2 sekundach.</p>
        </article>
      </section>

      {isQuickInterviewOpen ? (
        <div className="cv-overlay" onClick={() => setIsQuickInterviewOpen(false)}>
          <div className="cv-modal" style={{ maxWidth: 540 }} onClick={(event) => event.stopPropagation()}>
            <div className="cv-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Dodaj rozmowę</h3>
            </div>
            <div className="cv-modal-body" style={{ display: 'grid', gap: 10 }}>
              <select
                className="cv-input cv-select"
                value={quickInterviewType}
                onChange={(event) => setQuickInterviewType(event.target.value as StepType)}
              >
                <option value="phone_interview">Rozmowa telefoniczna</option>
                <option value="technical">Rozmowa techniczna</option>
                <option value="hr_interview">Rozmowa HR</option>
                <option value="onsite">Spotkanie onsite</option>
              </select>
              <input className="cv-input" type="date" value={quickInterviewDate} onChange={(event) => setQuickInterviewDate(event.target.value)} />
              <input className="cv-input" type="time" value={quickInterviewTime} onChange={(event) => setQuickInterviewTime(event.target.value)} />
              <textarea
                className="cv-input cv-textarea"
                placeholder="Notatki do rozmowy"
                value={quickInterviewNotes}
                onChange={(event) => setQuickInterviewNotes(event.target.value)}
              />
            </div>
            <div className="cv-modal-footer">
              <button className="cv-btn cv-btn-ghost" type="button" onClick={() => setIsQuickInterviewOpen(false)}>
                Anuluj
              </button>
              <button
                className="cv-btn cv-btn-primary"
                type="button"
                disabled={quickInterviewSubmitting}
                onClick={() => void handleQuickInterviewCreate()}
              >
                {quickInterviewSubmitting ? 'Zapisywanie...' : 'Dodaj'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingStep ? (
        <div className="cv-overlay" onClick={() => setEditingStep(null)}>
          <div className="cv-modal" style={{ maxWidth: 560 }} onClick={(event) => event.stopPropagation()}>
            <div className="cv-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edytuj krok rekrutacji</h3>
            </div>
            <div className="cv-modal-body" style={{ display: 'grid', gap: 10 }}>
              <select
                className="cv-input cv-select"
                value={editingStep.step_type}
                onChange={(event) =>
                  setEditingStep((current) =>
                    current ? { ...current, step_type: event.target.value as StepType } : current,
                  )
                }
              >
                {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map((type) => (
                  <option key={type} value={type}>
                    {STEP_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <input
                className="cv-input"
                value={editingStep.step_name}
                onChange={(event) =>
                  setEditingStep((current) => (current ? { ...current, step_name: event.target.value } : current))
                }
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  className="cv-input"
                  type="date"
                  value={editingStep.step_date}
                  onChange={(event) =>
                    setEditingStep((current) => (current ? { ...current, step_date: event.target.value } : current))
                  }
                />
                <input
                  className="cv-input"
                  type="time"
                  value={editingStep.step_time}
                  onChange={(event) =>
                    setEditingStep((current) => (current ? { ...current, step_time: event.target.value } : current))
                  }
                />
              </div>
              <textarea
                className="cv-input cv-textarea"
                value={editingStep.step_notes}
                onChange={(event) =>
                  setEditingStep((current) => (current ? { ...current, step_notes: event.target.value } : current))
                }
              />
            </div>
            <div className="cv-modal-footer">
              <button className="cv-btn cv-btn-ghost" type="button" onClick={() => setEditingStep(null)}>
                Anuluj
              </button>
              <button className="cv-btn cv-btn-primary" type="button" onClick={() => void handleStepEditSave()}>
                Zapisz
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
