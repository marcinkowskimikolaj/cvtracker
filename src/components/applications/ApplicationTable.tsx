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
  | 'applied_date'
  | 'monthly_salary'
  | 'hourly_rate'
  | 'waiting_days'

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
            <button className="cv-btn cv-btn-ghost" type="button" onClick={() => toggleSort('applied_date')}>
              Data aplikacji
            </button>
          </th>
          <th>Oczekiwania</th>
          <th>Stawka godz.</th>
          <th>Czas oczekiwania</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((application) => {
          const company = companies.find((item) => item.company_id === application.company_id)
          const waitingDays = daysBetween(application.applied_date, new Date().toISOString())

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
              <td>{formatDate(application.applied_date)}</td>
              <td>{application.monthly_salary ? `${application.monthly_salary} PLN` : '-'}</td>
              <td>{application.hourly_rate ? `${application.hourly_rate} PLN` : '-'}</td>
              <td>{waitingDays} dni</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
