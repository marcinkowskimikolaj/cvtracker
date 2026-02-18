import Fuse from 'fuse.js'
import { Paperclip } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useApplications } from '../../hooks/useApplications'
import { useCompanies } from '../../hooks/useCompanies'
import { useFiles } from '../../hooks/useFiles'
import { useProfile } from '../../hooks/useProfile'
import { resolveUploadFolderId, uploadFile } from '../../services/google/drive'
import { useToastStore } from '../../store/toastStore'
import type { ApplicationRecord, SheetRecord } from '../../types'
import { nowIsoDate, nowIsoDateTime } from '../../utils/dates'
import { calculateHourlyRate } from '../../utils/salary'
import { generateId } from '../../utils/uuid'

interface ApplicationFormProps {
  open: boolean
  editingApplication: SheetRecord<ApplicationRecord> | null
  onClose: () => void
}

export function ApplicationForm({ open, editingApplication, onClose }: ApplicationFormProps) {
  const { accessToken, config } = useAuth()
  const { activeProfile } = useProfile()
  const { companies, createCompany } = useCompanies()
  const { createApplication, createAppFile, updateApplication } = useApplications()
  const { createFile } = useFiles()
  const pushToast = useToastStore((state) => state.push)
  const offerInputRef = useRef<HTMLInputElement | null>(null)

  const [companyName, setCompanyName] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [positionTitle, setPositionTitle] = useState('')
  const [positionUrl, setPositionUrl] = useState('')
  const [appliedDate, setAppliedDate] = useState(nowIsoDate())
  const [monthlySalary, setMonthlySalary] = useState<number | null>(null)
  const [offerFile, setOfferFile] = useState<File | null>(null)
  const [showCompanyResults, setShowCompanyResults] = useState(false)
  const [isDraggingOffer, setIsDraggingOffer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const companyFuse = useMemo(
    () =>
      new Fuse(companies, {
        keys: ['name'],
        threshold: 0.34,
      }),
    [companies],
  )

  const companyResults = useMemo(() => {
    const query = companyName.trim()

    if (!query) {
      return companies.slice(0, 6)
    }

    return companyFuse
      .search(query)
      .map((result) => result.item)
      .slice(0, 6)
  }, [companies, companyFuse, companyName])

  useEffect(() => {
    if (!editingApplication) {
      setCompanyName('')
      setSelectedCompanyId('')
      setPositionTitle('')
      setPositionUrl('')
      setAppliedDate(nowIsoDate())
      setMonthlySalary(null)
      setOfferFile(null)
      return
    }

    const company = companies.find((item) => item.company_id === editingApplication.company_id)
    setCompanyName(company?.name || '')
    setSelectedCompanyId(editingApplication.company_id)
    setPositionTitle(editingApplication.position_title)
    setPositionUrl(editingApplication.position_url)
    setAppliedDate(editingApplication.applied_date)
    setMonthlySalary(editingApplication.monthly_salary)
    setOfferFile(null)
  }, [companies, editingApplication])

  if (!open) {
    return null
  }

  async function resolveCompanyId(): Promise<string> {
    const normalizedName = companyName.trim()

    if (selectedCompanyId) {
      return selectedCompanyId
    }

    const existing = companies.find((company) => company.name.trim().toLowerCase() === normalizedName.toLowerCase())
    if (existing) {
      return existing.company_id
    }

    const newCompanyId = generateId()
    await createCompany({
      company_id: newCompanyId,
      profile_id: activeProfile,
      name: normalizedName,
      industry: '',
      website: '',
      careers_url: '',
      linkedin_url: '',
      address: '',
      lat: null,
      lng: null,
      distance_km: null,
      travel_time_min: null,
      notes: '',
      created_at: nowIsoDateTime(),
    })

    return newCompanyId
  }

  async function uploadOfferFile(): Promise<{ offerFileId: string } | null> {
    if (!offerFile) {
      return null
    }

    if (offerFile.type !== 'application/pdf') {
      throw new Error('Oferta musi być plikiem PDF.')
    }

    if (!accessToken) {
      throw new Error('Brak aktywnej sesji Google.')
    }

    if (!config.GOOGLE_DRIVE_FOLDER_ID) {
      throw new Error('Brak GOOGLE_DRIVE_FOLDER_ID w _Config.')
    }

    const targetFolderId = await resolveUploadFolderId(
      accessToken,
      config.GOOGLE_DRIVE_FOLDER_ID,
      activeProfile,
      'other',
    )

    const normalizedCompanyName = companyName.trim()
    const normalizedPosition = positionTitle.trim()
    const driveFileName =
      offerFile.name.trim() || `${normalizedCompanyName || 'firma'}-${normalizedPosition || 'stanowisko'}-oferta.pdf`

    const uploaded = await uploadFile({
      accessToken,
      file: offerFile,
      fileName: driveFileName,
      parentFolderId: targetFolderId,
    })

    const offerFileId = generateId()
    await createFile({
      file_id: offerFileId,
      profile_id: activeProfile,
      file_name: `Oferta — ${normalizedCompanyName} — ${normalizedPosition}`,
      file_type: 'other',
      drive_file_id: uploaded.driveFileId,
      drive_url: uploaded.driveUrl,
      description: 'Plik PDF z treścią ogłoszenia o pracę.',
      version_label: 'Oferta',
      created_at: nowIsoDateTime(),
    })

    return { offerFileId }
  }

  async function handleSave(): Promise<void> {
    if (!companyName.trim() || !positionTitle.trim()) {
      pushToast({ title: 'Nazwa firmy i stanowisko są wymagane.', variant: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      const appId = editingApplication?.app_id ?? generateId()
      const companyId = await resolveCompanyId()
      const hourlyRate = calculateHourlyRate(monthlySalary)
      const uploadedOffer = await uploadOfferFile()
      const uploadedOfferFileId = uploadedOffer?.offerFileId ?? ''
      const offerFileId = uploadedOfferFileId || editingApplication?.job_offer_file_id || ''

      if (editingApplication) {
        await updateApplication({
          ...editingApplication,
          company_id: companyId,
          position_title: positionTitle.trim(),
          position_url: positionUrl.trim(),
          applied_date: appliedDate,
          monthly_salary: monthlySalary,
          hourly_rate: hourlyRate,
          job_offer_file_id: offerFileId,
          updated_at: nowIsoDateTime(),
        })
      } else {
        await createApplication({
          app_id: appId,
          profile_id: activeProfile,
          company_id: companyId,
          position_title: positionTitle.trim(),
          position_url: positionUrl.trim(),
          status: 'sent',
          priority: 'normal',
          excitement_rating: 3,
          monthly_salary: monthlySalary,
          hourly_rate: hourlyRate,
          job_offer_file_id: offerFileId,
          applied_date: appliedDate,
          response_date: '',
          role_description: '',
          notes: '',
          created_at: nowIsoDateTime(),
          updated_at: nowIsoDateTime(),
        })
      }

      if (uploadedOfferFileId) {
        await createAppFile({
          app_id: appId,
          file_id: uploadedOfferFileId,
          attached_at: nowIsoDateTime(),
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
          <div style={{ position: 'relative' }}>
            <input
              className="cv-input"
              placeholder="Nazwa firmy"
              value={companyName}
              onFocus={() => setShowCompanyResults(true)}
              onBlur={() => setTimeout(() => setShowCompanyResults(false), 120)}
              onChange={(event) => {
                setCompanyName(event.target.value)
                setSelectedCompanyId('')
                setShowCompanyResults(true)
              }}
            />

            {showCompanyResults && companyResults.length > 0 ? (
              <div
                className="cv-card-nested"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 'calc(100% + 6px)',
                  zIndex: 20,
                  maxHeight: 220,
                  overflowY: 'auto',
                  display: 'grid',
                  gap: 6,
                }}
              >
                {companyResults.map((company) => (
                  <button
                    key={company.company_id}
                    type="button"
                    className="cv-btn cv-btn-ghost"
                    style={{ justifyContent: 'flex-start' }}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setCompanyName(company.name)
                      setSelectedCompanyId(company.company_id)
                      setShowCompanyResults(false)
                    }}
                  >
                    {company.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <input className="cv-input" placeholder="Stanowisko" value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} />
          <input className="cv-input" placeholder="Link do ogłoszenia (opcjonalnie)" value={positionUrl} onChange={(event) => setPositionUrl(event.target.value)} />

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

          <div
            className="cv-card-nested"
            style={{
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: isDraggingOffer ? 'var(--accent)' : 'var(--border-primary)',
              padding: 16,
              display: 'grid',
              gap: 10,
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDraggingOffer(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setIsDraggingOffer(false)
            }}
            onDrop={(event) => {
              event.preventDefault()
              setIsDraggingOffer(false)
              const file = event.dataTransfer.files?.[0]
              if (!file) {
                return
              }
              if (file.type !== 'application/pdf') {
                pushToast({ title: 'Możesz dodać tylko plik PDF.', variant: 'error' })
                return
              }
              setOfferFile(file)
            }}
          >
            <p style={{ fontWeight: 600 }}>Plik z ofertą (PDF, opcjonalnie)</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Przeciągnij i upuść plik PDF lub wybierz go ręcznie.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="cv-btn cv-btn-secondary"
                type="button"
                onClick={() => offerInputRef.current?.click()}
              >
                <Paperclip size={16} />
                Prześlij PDF
              </button>
              {offerFile ? (
                <span className="cv-badge cv-badge-default">{offerFile.name}</span>
              ) : (
                <span className="cv-badge cv-badge-default">Brak pliku</span>
              )}
            </div>
            <input
              ref={offerInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                if (file && file.type !== 'application/pdf') {
                  pushToast({ title: 'Możesz dodać tylko plik PDF.', variant: 'error' })
                  return
                }
                setOfferFile(file)
              }}
            />
          </div>
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
