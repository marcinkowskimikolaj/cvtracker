import { Eye, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ApplicationRecord, CompanyRecord, SheetRecord } from '../../types'
import { formatDate } from '../../utils/dates'
import { daysBetween } from '../../utils/dates'
import { PriorityIndicator } from '../common/PriorityIndicator'
import { StatusBadge } from '../common/StatusBadge'

interface ApplicationTableProps {
  applications: Array<SheetRecord<ApplicationRecord>>
  companies: Array<SheetRecord<CompanyRecord>>
}

type SortField =
  | 'company'
  | 'position'
  | 'status'
  | 'priority'
  | 'score'
  | 'applied_date'
  | 'monthly_salary'
  | 'hourly_rate'
  | 'waiting_days'

function calculateScore(application: SheetRecord<ApplicationRecord>): number | null {
  const ratings = [
    application.offer_interest_rating,
    application.location_rating,
    application.company_rating,
    application.fit_rating,
  ].filter((value): value is number => value !== null)

  if (!ratings.length) {
    return application.excitement_rating ?? null
  }

  const score = ratings.reduce((sum, value) => sum + value, 0) / ratings.length
  return Number(score.toFixed(2))
}

export function ApplicationTable({ applications, companies }: ApplicationTableProps) {
  const [sortField, setSortField] = useState<SortField>('applied_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  function toggleSort(field: SortField): void {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDirection('asc')
  }

  const sorted = useMemo(() => {
    const rows = [...applications]
    rows.sort((left, right) => {
      const leftCompany = companies.find((item) => item.company_id === left.company_id)?.name || ''
      const rightCompany = companies.find((item) => item.company_id === right.company_id)?.name || ''

      const multiplier = sortDirection === 'asc' ? 1 : -1

      switch (sortField) {
        case 'company':
          return leftCompany.localeCompare(rightCompany) * multiplier
        case 'position':
          return left.position_title.localeCompare(right.position_title) * multiplier
        case 'status':
          return left.status.localeCompare(right.status) * multiplier
        case 'priority':
          return left.priority.localeCompare(right.priority) * multiplier
        case 'score': {
          const leftScore = calculateScore(left) || 0
          const rightScore = calculateScore(right) || 0
          return (leftScore - rightScore) * multiplier
        }
        case 'applied_date':
          return left.applied_date.localeCompare(right.applied_date) * multiplier
        case 'monthly_salary':
          return ((left.monthly_salary || 0) - (right.monthly_salary || 0)) * multiplier
        case 'hourly_rate':
          return ((left.hourly_rate || 0) - (right.hourly_rate || 0)) * multiplier
        case 'waiting_days': {
          const leftDays = daysBetween(left.applied_date, new Date().toISOString())
          const rightDays = daysBetween(right.applied_date, new Date().toISOString())
          return (leftDays - rightDays) * multiplier
        }
        default:
          return 0
      }
    })

    return rows
  }, [applications, companies, sortDirection, sortField])

  return (
    <table className="cv-table">
      <thead>
        <tr>
          <th>
            <button className="cv-btn cv-btn-ghost" type="button" onClick={() => toggleSort('company')}>
              Firma
            </button>
          </th>
          <th>
            <button className="cv-btn cv-btn-ghost" type="button" onClick={() => toggleSort('position')}>
              Stanowisko
            </button>
          </th>
          <th>Status</th>
          <th>Priorytet</th>
          <th>
            <button className="cv-btn cv-btn-ghost" type="button" onClick={() => toggleSort('score')}>
              Scoring
            </button>
          </th>
          <th>
            <button className="cv-btn cv-btn-ghost" type="button" onClick={() => toggleSort('applied_date')}>
              Data aplikacji
            </button>
          </th>
          <th>Oczekiwania</th>
          <th>Stawka godz.</th>
          <th>Czas oczekiwania</th>
          <th>Podgląd</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((application) => {
          const company = companies.find((item) => item.company_id === application.company_id)
          const waitingDays = daysBetween(application.applied_date, new Date().toISOString())
          const score = calculateScore(application)
          const roundedScore = score !== null ? Math.round(score) : 0

          return (
            <tr key={application.app_id}>
              <td>{company?.name || '-'}</td>
              <td>
                <Link to={`/aplikacje/${application.app_id}`} style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {application.position_title}
                </Link>
              </td>
              <td>
                <StatusBadge status={application.status} />
              </td>
              <td>
                <PriorityIndicator priority={application.priority} />
              </td>
              <td>
                {score !== null ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-flex', gap: 1 }}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={`${application.app_id}-score-${value}`}
                          size={14}
                          fill={roundedScore >= value ? 'var(--accent)' : 'transparent'}
                          color={roundedScore >= value ? 'var(--accent)' : '#D1D5DB'}
                        />
                      ))}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{score.toFixed(2)}</span>
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td>{formatDate(application.applied_date)}</td>
              <td>{application.monthly_salary ? `${application.monthly_salary} PLN` : '-'}</td>
              <td>{application.hourly_rate ? `${application.hourly_rate} PLN` : '-'}</td>
              <td>{waitingDays} dni</td>
              <td>
                <Link
                  to={`/aplikacje/${application.app_id}`}
                  className="cv-btn cv-btn-ghost cv-btn-icon"
                  title="Otwórz szczegóły aplikacji"
                  aria-label={`Otwórz szczegóły aplikacji: ${application.position_title}`}
                >
                  <Eye size={16} />
                </Link>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
