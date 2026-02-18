import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Download,
  ExternalLink,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Navigation2,
  Pencil,
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
  SeniorityLevel,
  SheetRecord,
  StepType,
  WorkMode,
} from '../../types'
import {
  SENIORITY_LABELS,
  STATUS_LABELS,
  STEP_TYPE_LABELS,
  WORK_MODE_LABELS,
} from '../../utils/constants'
import { nowIsoDate, nowIsoDateTime } from '../../utils/dates'
import { calculateHourlyRate } from '../../utils/salary'
import { generateId } from '../../utils/uuid'
import { MapEmbed } from '../common/MapEmbed'
import { AttachedFiles } from './AttachedFiles'
import { AttachedRecruiters } from './AttachedRecruiters'
import { StepForm } from './StepForm'
import { StepTimeline } from './StepTimeline'

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

function statusDotColor(status: ApplicationStatus): string {
  switch (status) {
    case 'sent':
      return '#6B7280'
    case 'interview':
      return '#3B6FD4'
    case 'waiting':
      return '#D4900A'
    case 'offer':
      return '#1D8A56'
    case 'rejected':
      return '#C93B3B'
    default:
      return '#6B7280'
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

const SCORE_FIELDS = [
  { key: 'offer_interest_rating', label: 'Ocena oferty' },
  { key: 'location_rating', label: 'Ocena lokalizacji' },
  { key: 'company_rating', label: 'Ocena firmy' },
  { key: 'fit_rating', label: 'Dopasowanie do oferty' },
] as const

type ScoreField = (typeof SCORE_FIELDS)[number]['key']

function computeAverageRating(
  ratings: Array<number | null>,
): number | null {
  const normalized = ratings.filter((value): value is number => value !== null)
  if (!normalized.length) {
    return null
  }

  const average = normalized.reduce((sum, value) => sum + value, 0) / normalized.length
  return Number(average.toFixed(2))
}

function externalIconLink(icon: JSX.Element, url: string, title: string) {
  const isDisabled = !url

  return (
    <a
      className="cv-btn cv-btn-ghost cv-btn-icon"
      href={isDisabled ? undefined : url}
      target="_blank"
      rel="noreferrer"
      title={title}
      aria-disabled={isDisabled}
      style={{
        width: 36,
        height: 36,
        borderRadius: 9999,
        border: '1px solid var(--border-default)',
        opacity: isDisabled ? 0.35 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
      }}
    >
      {icon}
    </a>
  )
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
  const [scoreHover, setScoreHover] = useState<Partial<Record<ScoreField, number>>>({})
  const [isNarrowLayout, setIsNarrowLayout] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1100 : false,
  )

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

  const offerLinks = useMemo(() => {
    if (!app?.job_offer_file_id) {
      return []
    }

    return appFiles.filter((link) => link.app_id === appId && link.file_id === app.job_offer_file_id)
  }, [app?.job_offer_file_id, appFiles, appId])

  const companyAddress = company?.address?.trim() ?? ''
  const mapsApiKey = config.GOOGLE_MAPS_API_KEY || ''

  useEffect(() => {
    const onResize = () => setIsNarrowLayout(window.innerWidth < 1100)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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

  async function handleSetScore(field: ScoreField, value: number): Promise<void> {
    const current = appRef.current
    if (!current) {
      return
    }

    const nextRatings = {
      offer_interest_rating: current.offer_interest_rating,
      location_rating: current.location_rating,
      company_rating: current.company_rating,
      fit_rating: current.fit_rating,
      [field]: value,
    }

    const average = computeAverageRating([
      nextRatings.offer_interest_rating,
      nextRatings.location_rating,
      nextRatings.company_rating,
      nextRatings.fit_rating,
    ])

    try {
      await patchApplication({
        [field]: value,
        excitement_rating: average === null ? null : Math.round(average),
      } as Partial<ApplicationRecord>)
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

    const confirmed = window.confirm('Na pewno chcesz usunąć ofertę z tej aplikacji?')
    if (!confirmed) {
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

  const scoreAverage = computeAverageRating([
    currentApp.offer_interest_rating,
    currentApp.location_rating,
    currentApp.company_rating,
    currentApp.fit_rating,
  ])
  const scoreCount = [
    currentApp.offer_interest_rating,
    currentApp.location_rating,
    currentApp.company_rating,
    currentApp.fit_rating,
  ].filter((value) => value !== null).length
  const currentRating = scoreAverage === null ? currentApp.excitement_rating ?? 0 : Math.round(scoreAverage)
  const companyDirectionUrl = companyAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(companyAddress)}`
    : ''
  const companySearchUrl = companyAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddress)}`
    : ''

  return (
    <section className="page-enter" style={{ display: 'grid', gap: 16 }}>
      <header className="cv-card" style={{ display: 'grid', gap: 18, padding: 32 }}>
        <Link to="/aplikacje" className="cv-btn cv-btn-ghost" style={{ justifySelf: 'start', paddingInline: 0 }}>
          <ArrowLeft size={16} />
          Aplikacje
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            {company ? (
              <Link to={`/firmy/${company.company_id}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                {company.name}
              </Link>
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Brak firmy</span>
            )}
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.2 }}>{currentApp.position_title}</h1>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map((value) => {
                const active = currentRating >= value
                return (
                  <Star
                    key={value}
                    size={20}
                    fill={active ? 'var(--accent)' : 'transparent'}
                    color={active ? 'var(--accent)' : '#D1D5DB'}
                  />
                )
              })}
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: 6 }}>
                {scoreAverage === null ? 'Brak średniej ocen' : `Średnia ocen: ${scoreAverage.toFixed(2)}/5`}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                <CalendarDays size={14} />
                {currentApp.applied_date || '-'}
              </span>
              <span className="cv-badge cv-badge-default">{SENIORITY_LABELS[currentApp.seniority]}</span>
              <span className="cv-badge cv-badge-default">{WORK_MODE_LABELS[currentApp.work_mode]}</span>
              {currentApp.position_url ? (
                <a
                  href={currentApp.position_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}
                >
                  Zobacz ogłoszenie
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8, alignContent: 'start', minWidth: 250 }}>
            <span className={statusBadgeClass(currentApp.status)} style={{ justifySelf: 'start' }}>
              {STATUS_LABELS[currentApp.status]}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                aria-hidden="true"
                style={{ width: 10, height: 10, borderRadius: 9999, background: statusDotColor(currentApp.status) }}
              />
              <select
                className="cv-input cv-select"
                value={currentApp.status}
                onChange={(event) => void patchApplication({ status: event.target.value as ApplicationStatus })}
                style={{ maxWidth: 220 }}
              >
                <option value="sent">Wysłano</option>
                <option value="interview">Rozmowa</option>
                <option value="waiting">Oczekuję</option>
                <option value="offer">Oferta</option>
                <option value="rejected">Odrzucone</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <section
        style={{
          display: 'flex',
          gap: 10,
          margin: '12px 0 4px 0',
          overflowX: 'auto',
          paddingBottom: 2,
          whiteSpace: 'nowrap',
        }}
      >
        <button className="cv-btn cv-btn-secondary" style={{ flex: '0 0 auto', padding: '8px 16px', borderRadius: 10 }} type="button" onClick={() => setIsQuickInterviewOpen(true)}>
          <Phone size={16} />
          Dodaj rozmowę
        </button>
        <button
          className="cv-btn cv-btn-ghost"
          style={{ flex: '0 0 auto', padding: '8px 16px', borderRadius: 10, color: '#C93B3B' }}
          type="button"
          onClick={() => void handleRejectAction()}
        >
          <XCircle size={16} />
          Oznacz odrzucone
        </button>
        <button className="cv-btn cv-btn-secondary" style={{ flex: '0 0 auto', padding: '8px 16px', borderRadius: 10 }} type="button" onClick={() => void handleCreateFollowUp()}>
          <Mail size={16} />
          Follow-up
        </button>
        <button className="cv-btn cv-btn-ghost" style={{ flex: '0 0 auto', padding: '8px 16px', borderRadius: 10 }} type="button" onClick={() => void handleExportNearestStep()}>
          <CalendarDays size={16} />
          Eksport
        </button>
      </section>

      <section className="cv-card" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Przebieg rekrutacji</h2>
          <button className="cv-btn cv-btn-ghost" type="button" onClick={() => setShowStepForm((value) => !value)}>
            + Dodaj
          </button>
        </div>

        <StepTimeline
          steps={steps}
          onDelete={(rowNumber) => void handleStepDelete(rowNumber)}
          onEdit={(step) => setEditingStep(step)}
          onRequestAdd={() => setShowStepForm(true)}
        />

        {showStepForm ? <StepForm app={currentApp} companyName={company?.name || 'Firma'} /> : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.63fr_1fr] items-start">
        <div style={{ display: 'grid', gap: 20, minWidth: 0 }}>
          <article className="cv-card" style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>📄 Oferta pracy</h3>
              {offerFile ? (
                <button className="cv-btn cv-btn-ghost cv-btn-icon" type="button" onClick={() => void handleOfferRemove()} title="Usuń ofertę" style={{ color: '#C93B3B' }}>
                  <XCircle size={16} />
                </button>
              ) : null}
            </div>

            {!offerFile ? (
              <div
                className="cv-card-nested"
                style={{
                  minHeight: 220,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: isOfferDragActive ? 'var(--accent)' : '#D1D5DB',
                  background: isOfferDragActive ? 'var(--accent-light)' : '#F8F9FB',
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  gap: 8,
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
                <p style={{ fontWeight: 600 }}>Przeciągnij plik PDF z ofertą pracy</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>lub kliknij aby wybrać plik</p>
                <label className="cv-btn cv-btn-primary" style={{ cursor: isUploadingOffer ? 'wait' : 'pointer' }}>
                  {isUploadingOffer ? 'Wysyłanie...' : 'Prześlij PDF'}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
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
                  style={{ width: '100%', minHeight: 620, border: 'none', borderRadius: 12 }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a className="cv-btn cv-btn-ghost" href={offerFile.drive_url} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} />
                    Otwórz w Drive
                  </a>
                  <a
                    className="cv-btn cv-btn-ghost"
                    href={`https://drive.google.com/uc?export=download&id=${offerFile.drive_file_id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={16} />
                    Pobierz
                  </a>
                </div>
              </>
            )}
          </article>

          <article className="cv-card" style={{ display: 'grid', gap: 8, padding: 28 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>📝 Opis roli</h3>
            <textarea
              className="cv-input cv-textarea"
              style={{ minHeight: 180, fontSize: 15, lineHeight: 1.7 }}
              value={roleDescription}
              onChange={(event) => setRoleDescription(event.target.value)}
              placeholder="Wklej opis stanowiska, wymagania, zakres obowiązków..."
            />
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Autozapis po 2 sekundach.</p>
          </article>

          <article className="cv-card" style={{ display: 'grid', gap: 8, padding: 28 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>📋 Notatki</h3>
            <textarea
              className="cv-input cv-textarea"
              style={{ minHeight: 150, fontSize: 15, lineHeight: 1.7 }}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Twoje notatki, wrażenia, pytania do zadania..."
            />
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Autozapis po 2 sekundach.</p>
          </article>
        </div>

        <aside
          style={{
            display: 'grid',
            gap: 16,
            alignSelf: 'start',
            position: isNarrowLayout ? 'static' : 'sticky',
            top: isNarrowLayout ? undefined : 'calc(var(--topbar-height) + 20px)',
          }}
        >
          <article className="cv-card" style={{ display: 'grid', gap: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>🏢 Firma</h3>
              {company ? (
                <Link to={`/firmy/${company.company_id}`} className="cv-btn cv-btn-ghost cv-btn-icon" title="Edytuj firmę">
                  <Pencil size={15} />
                </Link>
              ) : null}
            </div>

            {company ? (
              <>
                <Link to={`/firmy/${company.company_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>{company.name}</p>
                </Link>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{company.industry || 'Brak branży'}</p>

                <div style={{ display: 'flex', gap: 8 }}>
                  {externalIconLink(<Globe size={16} />, company.website, 'Strona WWW')}
                  {externalIconLink(<Building2 size={16} />, company.careers_url, 'Kariera')}
                  {externalIconLink(<Linkedin size={16} />, company.linkedin_url, 'LinkedIn')}
                </div>

                <MapEmbed
                  address={companyAddress}
                  mapsApiKey={mapsApiKey}
                  title={`Mapa firmy ${company.name}`}
                  height={320}
                />

                <a
                  className="cv-btn cv-btn-primary"
                  href={companyDirectionUrl || undefined}
                  target="_blank"
                  rel="noreferrer"
                  style={{ width: '100%', justifyContent: 'center', opacity: companyAddress ? 1 : 0.45, pointerEvents: companyAddress ? 'auto' : 'none' }}
                >
                  <Navigation2 size={16} />
                  Prowadź do firmy
                </a>
                <a
                  className="cv-btn cv-btn-ghost"
                  href={companySearchUrl || undefined}
                  target="_blank"
                  rel="noreferrer"
                  style={{ width: '100%', justifyContent: 'center', opacity: companyAddress ? 1 : 0.45, pointerEvents: companyAddress ? 'auto' : 'none' }}
                >
                  <MapPin size={16} />
                  Zobacz na mapie
                </a>
              </>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Brak danych firmy.</p>
            )}
          </article>

          <article className="cv-card" style={{ display: 'grid', gap: 12, padding: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>⭐ Scoring oferty</h3>

            {SCORE_FIELDS.map((item) => {
              const currentValue = currentApp[item.key]
              const activeValue = scoreHover[item.key] ?? currentValue ?? 0

              return (
                <div key={item.key} style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((value) => {
                      const isActive = activeValue >= value
                      return (
                        <button
                          key={`${item.key}-${value}`}
                          type="button"
                          className="cv-btn cv-btn-ghost cv-btn-icon"
                          style={{ padding: 2 }}
                          onMouseEnter={() =>
                            setScoreHover((current) => ({ ...current, [item.key]: value }))
                          }
                          onMouseLeave={() =>
                            setScoreHover((current) => ({ ...current, [item.key]: undefined }))
                          }
                          onClick={() => void handleSetScore(item.key, value)}
                          title={`${item.label}: ${value}/5`}
                        >
                          <Star
                            size={18}
                            fill={isActive ? 'var(--accent)' : 'transparent'}
                            color={isActive ? 'var(--accent)' : '#D1D5DB'}
                          />
                        </button>
                      )
                    })}
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', alignSelf: 'center', marginLeft: 4 }}>
                      {currentValue ?? '-'}
                    </span>
                  </div>
                </div>
              )
            })}

            <div style={{ height: 1, background: 'var(--border-default)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Średnia ({scoreCount}/4)</span>
              <strong style={{ fontSize: '1.1rem' }}>
                {scoreAverage === null ? 'Brak' : `${scoreAverage.toFixed(2)}/5`}
              </strong>
            </div>
          </article>

          <article className="cv-card" style={{ display: 'grid', gap: 10, padding: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>🧩 Parametry oferty</h3>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Seniority</span>
              <select
                className="cv-input cv-select"
                value={currentApp.seniority}
                onChange={(event) =>
                  void patchApplication({ seniority: event.target.value as SeniorityLevel })
                }
              >
                {Object.entries(SENIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tryb pracy</span>
              <select
                className="cv-input cv-select"
                value={currentApp.work_mode}
                onChange={(event) =>
                  void patchApplication({ work_mode: event.target.value as WorkMode })
                }
              >
                {Object.entries(WORK_MODE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </article>

          <article className="cv-card" style={{ display: 'grid', gap: 10, padding: 20, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, textAlign: 'left' }}>💰 Finanse</h3>

            {!editingSalary ? (
              <>
                <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatMonthlySalary(currentApp.monthly_salary)}</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>/ miesiąc</p>
                <div style={{ height: 1, background: 'var(--border-default)', margin: '6px 0' }} />
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{formatHourlySalary(currentApp.hourly_rate)}</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>/ godzina</p>
                <button className="cv-btn cv-btn-ghost" type="button" style={{ width: '100%' }} onClick={() => setEditingSalary(true)}>
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
                  placeholder="Kwota miesięczna PLN"
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="cv-btn cv-btn-primary" type="button" style={{ width: '100%' }} onClick={() => void handleSalarySave()}>
                    Zapisz
                  </button>
                  <button className="cv-btn cv-btn-ghost" type="button" style={{ width: '100%' }} onClick={() => setEditingSalary(false)}>
                    Anuluj
                  </button>
                </div>
              </div>
            )}
          </article>

          <AttachedRecruiters app={currentApp} />
          <AttachedFiles app={currentApp} />
        </aside>
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
