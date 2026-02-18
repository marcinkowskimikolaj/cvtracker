import { ExternalLink } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApplications } from '../../hooks/useApplications'
import { useCompanies } from '../../hooks/useCompanies'
import { useRecruiters } from '../../hooks/useRecruiters'
import type { SheetRecord } from '../../types'
import type { CompanyRecord } from '../../types'
import { StatusBadge } from '../common/StatusBadge'
import { CompanyMapSection } from './CompanyMapSection'

interface CompanyCardProps {
  companyId: string
}

function externalLink(label: string, url: string) {
  if (!url) {
    return null
  }

  return (
    <a className="cv-btn cv-btn-secondary" href={url} target="_blank" rel="noreferrer">
      {label} <ExternalLink size={14} />
    </a>
  )
}

export function CompanyCard({ companyId }: CompanyCardProps) {
  const { companies } = useCompanies()
  const { applications } = useApplications()
  const { recruiters } = useRecruiters()

  const company = companies.find((item) => item.company_id === companyId) as SheetRecord<CompanyRecord> | undefined

  const relatedApps = useMemo(
    () => applications.filter((application) => application.company_id === companyId),
    [applications, companyId],
  )

  const relatedRecruiters = useMemo(
    () => recruiters.filter((recruiter) => recruiter.company_id === companyId),
    [companyId, recruiters],
  )

  if (!company) {
    return (
      <section className="cv-card">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Nie znaleziono firmy</h1>
      </section>
    )
  }

  return (
    <section className="cv-card page-enter" style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>{company.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{company.industry || 'Brak branży'}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {externalLink('Strona www', company.website)}
        {externalLink('Kariera', company.careers_url)}
        {externalLink('LinkedIn', company.linkedin_url)}
      </div>

      <div className="cv-card-nested">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>Adres</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{company.address || 'Brak adresu'}</p>
      </div>

      <CompanyMapSection company={company} />

      <div className="cv-card-nested">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Aplikacje do tej firmy</h3>
        {relatedApps.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Brak aplikacji.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {relatedApps.map((application) => (
              <Link
                key={application.app_id}
                to={`/aplikacje/${application.app_id}`}
                className="cv-card-nested"
                style={{ textDecoration: 'none' }}
              >
                <p style={{ fontWeight: 500 }}>{application.position_title}</p>
                <StatusBadge status={application.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="cv-card-nested">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Powiązani rekruterzy</h3>
        {relatedRecruiters.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Brak rekruterów.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {relatedRecruiters.map((recruiter) => (
              <div key={recruiter.recruiter_id} className="cv-card-nested">
                <p style={{ fontWeight: 500 }}>
                  {recruiter.first_name} {recruiter.last_name}
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>{recruiter.email || 'Brak emaila'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cv-card-nested">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Notatki</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{company.notes || 'Brak notatek'}</p>
      </div>
    </section>
  )
}
