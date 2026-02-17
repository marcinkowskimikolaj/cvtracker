import { Link } from 'react-router-dom'
import type { ApplicationRecord, CompanyRecord, SheetRecord } from '../../types'
import { formatDate } from '../../utils/dates'
import { StatusBadge } from '../common/StatusBadge'

interface ApplicationTimelineProps {
  applications: Array<SheetRecord<ApplicationRecord>>
  companies: Array<SheetRecord<CompanyRecord>>
}

export function ApplicationTimeline({ applications, companies }: ApplicationTimelineProps) {
  const sorted = [...applications].sort((left, right) => right.applied_date.localeCompare(left.applied_date))

  return (
    <div className="cv-timeline">
      {sorted.map((application) => {
        const company = companies.find((item) => item.company_id === application.company_id)

        return (
          <div className="cv-timeline-item" key={application.app_id}>
            <div className="cv-timeline-dot cv-timeline-dot-completed" />
            <div className="cv-card-nested" style={{ marginLeft: 8 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{formatDate(application.applied_date)}</p>
              <Link to={`/aplikacje/${application.app_id}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {application.position_title}
              </Link>
              <p style={{ color: 'var(--text-secondary)' }}>{company?.name || '-'}</p>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={application.status} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
