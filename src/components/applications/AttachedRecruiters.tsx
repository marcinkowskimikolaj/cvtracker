import Fuse from 'fuse.js'
import { ChevronDown, ChevronUp, Link as LinkIcon, Mail, Plus, UserPlus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApplications } from '../../hooks/useApplications'
import { useProfile } from '../../hooks/useProfile'
import { useRecruiters } from '../../hooks/useRecruiters'
import { useToastStore } from '../../store/toastStore'
import type { ApplicationRecord, RecruiterRecord, SheetRecord } from '../../types'
import { nowIsoDateTime } from '../../utils/dates'
import { generateId } from '../../utils/uuid'

interface AttachedRecruitersProps {
  app: SheetRecord<ApplicationRecord>
}

export function AttachedRecruiters({ app }: AttachedRecruitersProps) {
  const { activeProfile } = useProfile()
  const { recruiters, createRecruiter } = useRecruiters()
  const { appRecruiters, createAppRecruiter, deleteAppRecruiter } = useApplications()
  const pushToast = useToastStore((state) => state.push)

  const [query, setQuery] = useState('')
  const [expandedRecruiterId, setExpandedRecruiterId] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newLinkedin, setNewLinkedin] = useState('')
  const [isSubmittingNew, setIsSubmittingNew] = useState(false)

  const linked = useMemo(
    () =>
      appRecruiters
        .filter((link) => link.app_id === app.app_id)
        .map((link) => ({
          link,
          recruiter: recruiters.find((item) => item.recruiter_id === link.recruiter_id),
        }))
        .filter((item): item is { link: (typeof appRecruiters)[number]; recruiter: (typeof recruiters)[number] } =>
          Boolean(item.recruiter),
        ),
    [app.app_id, appRecruiters, recruiters],
  )

  const linkedRecruiterIds = useMemo(() => new Set(linked.map((item) => item.recruiter.recruiter_id)), [linked])
  const availableRecruiters = useMemo(
    () => recruiters.filter((recruiter) => !linkedRecruiterIds.has(recruiter.recruiter_id)),
    [linkedRecruiterIds, recruiters],
  )
  const recruiterFuse = useMemo(
    () =>
      new Fuse(availableRecruiters, {
        keys: ['first_name', 'last_name', 'email'],
        threshold: 0.32,
      }),
    [availableRecruiters],
  )
  const searchResults = useMemo(() => {
    const normalized = query.trim()
    if (!normalized) {
      return availableRecruiters.slice(0, 5)
    }
    return recruiterFuse
      .search(normalized)
      .map((result) => result.item)
      .slice(0, 5)
  }, [availableRecruiters, query, recruiterFuse])

  async function attachExistingRecruiter(recruiterId: string): Promise<void> {
    if (!recruiterId) {
      return
    }

    try {
      await createAppRecruiter({
        app_id: app.app_id,
        recruiter_id: recruiterId,
      })
      pushToast({ title: 'Dodano rekrutera do aplikacji.', variant: 'success' })
      setQuery('')
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się przypisać rekrutera.',
        variant: 'error',
      })
    }
  }

  async function createAndAttachRecruiter(): Promise<void> {
    if (!newFirstName.trim() || !newLastName.trim()) {
      pushToast({ title: 'Podaj imię i nazwisko rekrutera.', variant: 'error' })
      return
    }

    setIsSubmittingNew(true)

    try {
      const recruiterId = generateId()
      const recruiter: RecruiterRecord = {
        recruiter_id: recruiterId,
        profile_id: activeProfile,
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        email: newEmail.trim(),
        phone: '',
        linkedin_url: newLinkedin.trim(),
        company_id: app.company_id,
        notes: '',
        created_at: nowIsoDateTime(),
      }

      await createRecruiter(recruiter)
      await createAppRecruiter({ app_id: app.app_id, recruiter_id: recruiterId })

      pushToast({ title: 'Dodano nowego rekrutera i przypisano do aplikacji.', variant: 'success' })
      setShowNewForm(false)
      setNewFirstName('')
      setNewLastName('')
      setNewEmail('')
      setNewLinkedin('')
      setQuery('')
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się dodać rekrutera.',
        variant: 'error',
      })
    } finally {
      setIsSubmittingNew(false)
    }
  }

  return (
    <section className="cv-card-nested" style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Rekruterzy</h3>
        <span className="cv-badge cv-badge-count">{linked.length}</span>
      </div>

      {linked.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Brak powiązanych rekruterów.</p> : null}

      {linked.map(({ link, recruiter }) => {
        const isExpanded = expandedRecruiterId === recruiter.recruiter_id

        return (
          <article key={link.__rowNumber} className="cv-card-nested" style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="cv-btn cv-btn-ghost"
                style={{ justifyContent: 'flex-start', paddingInline: 0, width: '100%' }}
                onClick={() =>
                  setExpandedRecruiterId((current) =>
                    current === recruiter.recruiter_id ? '' : recruiter.recruiter_id,
                  )
                }
              >
                <span style={{ fontWeight: 600 }}>
                  {recruiter.first_name} {recruiter.last_name}
                </span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <div style={{ display: 'flex', gap: 4 }}>
                {recruiter.email ? (
                  <a className="cv-btn cv-btn-ghost cv-btn-icon" href={`mailto:${recruiter.email}`} title="Email">
                    <Mail size={14} />
                  </a>
                ) : null}
                {recruiter.linkedin_url ? (
                  <a
                    className="cv-btn cv-btn-ghost cv-btn-icon"
                    href={recruiter.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    title="LinkedIn"
                  >
                    <LinkIcon size={14} />
                  </a>
                ) : null}
                <button
                  className="cv-btn cv-btn-ghost cv-btn-icon"
                  type="button"
                  title="Usuń powiązanie"
                  onClick={() => void deleteAppRecruiter(link.__rowNumber)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            {isExpanded ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'grid', gap: 4 }}>
                <p>Email: {recruiter.email || 'Brak'}</p>
                <p>Telefon: {recruiter.phone || 'Brak'}</p>
                <p>LinkedIn: {recruiter.linkedin_url || 'Brak'}</p>
              </div>
            ) : null}
          </article>
        )
      })}

      <div style={{ display: 'grid', gap: 8 }}>
        <input
          className="cv-input"
          placeholder="Szukaj istniejącego rekrutera..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {searchResults.length > 0 ? (
          <div style={{ display: 'grid', gap: 6 }}>
            {searchResults.map((recruiter) => (
              <button
                key={recruiter.recruiter_id}
                type="button"
                className="cv-btn cv-btn-secondary"
                style={{ justifyContent: 'space-between' }}
                onClick={() => void attachExistingRecruiter(recruiter.recruiter_id)}
              >
                <span>
                  {recruiter.first_name} {recruiter.last_name}
                </span>
                <Plus size={14} />
              </button>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Brak pasujących rekruterów.</p>
        )}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <button className="cv-btn cv-btn-ghost" type="button" onClick={() => setShowNewForm((value) => !value)}>
          <UserPlus size={16} />
          {showNewForm ? 'Ukryj formularz nowego rekrutera' : 'Nowy rekruter'}
        </button>

        {showNewForm ? (
          <div className="cv-card-nested" style={{ display: 'grid', gap: 8 }}>
            <input
              className="cv-input"
              placeholder="Imię"
              value={newFirstName}
              onChange={(event) => setNewFirstName(event.target.value)}
            />
            <input
              className="cv-input"
              placeholder="Nazwisko"
              value={newLastName}
              onChange={(event) => setNewLastName(event.target.value)}
            />
            <input
              className="cv-input"
              placeholder="Email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
            />
            <input
              className="cv-input"
              placeholder="LinkedIn"
              value={newLinkedin}
              onChange={(event) => setNewLinkedin(event.target.value)}
            />
            <button
              className="cv-btn cv-btn-primary"
              type="button"
              onClick={() => void createAndAttachRecruiter()}
              disabled={isSubmittingNew}
            >
              {isSubmittingNew ? 'Zapisywanie...' : 'Dodaj i podepnij'}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
