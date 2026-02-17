import type { ApplicationStatus } from '../../types'
import { STATUS_LABELS } from '../../utils/constants'

interface StatusBadgeProps {
  status: ApplicationStatus
}

function statusClass(status: ApplicationStatus): string {
  switch (status) {
    case 'sent':
      return 'cv-badge-sent'
    case 'interview':
      return 'cv-badge-interview'
    case 'waiting':
      return 'cv-badge-waiting'
    case 'offer':
      return 'cv-badge-offer'
    case 'rejected':
      return 'cv-badge-rejected'
    default:
      return 'cv-badge-sent'
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`cv-badge ${statusClass(status)}`}>{STATUS_LABELS[status]}</span>
}
