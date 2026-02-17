import { Link } from 'react-router-dom'
import { useApplications } from '../../hooks/useApplications'
import { useCompanies } from '../../hooks/useCompanies'
import { useRecruiters } from '../../hooks/useRecruiters'
import { StatusBadge } from '../common/StatusBadge'

interface RecruiterCardProps {
  recruiterId: string
}

export function RecruiterCard({ recruiterId }: RecruiterCardProps) {
  const { recruiters } = useRecruiters()
  const { companies } = useCompanies()
  const { applications, appRecruiters } = useApplications()

  const recruiter = recruiters.find((item) => item.recruiter_id === recruiterId)

  if (!recruiter) {
    return (
      <section className="cv-card page-enter">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Nie znaleziono rekrutera</h1>
      </section>
    )
  }

  const company = companies.find((item) => item.company_id === recruiter.company_id)
  const linkedAppIds = appRecruiters
    .filter((link) => link.recruiter_id === recruiterId)
    .map((link) => link.app_id)

  const linkedApplications = applications.filter((application) => linkedAppIds.includes(application.app_id))

  return (
    <section className="cv-card page-enter" style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>
          {recruiter.first_name} {recruiter.last_name}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>{company?.name || 'Brak firmy'}</p>
      </div>

      <div className="cv-card-nested" style={{ display: 'grid', gap: 8 }}>
        <a href={`mailto:${recruiter.email}`} style={{ color: 'var(--text-primary)' }}>
          {recruiter.email || 'Brak emaila'}
        </a>
        <p style={{ color: 'var(--text-secondary)' }}>{recruiter.phone || 'Brak telefonu'}</p>
        {recruiter.linkedin_url ? (
          <a href={recruiter.linkedin_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            Profil LinkedIn
          </a>
        ) : null}
      </div>

      <div className="cv-card-nested">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Powiązane aplikacje</h3>
        {linkedApplications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Brak powiązanych aplikacji.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {linkedApplications.map((application) => (
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
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Notatki</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{recruiter.notes || 'Brak notatek'}</p>
      </div>
    </section>
  )
}
