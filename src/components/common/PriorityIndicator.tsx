import type { Priority } from '../../types'
import { PRIORITY_LABELS } from '../../utils/constants'

interface PriorityIndicatorProps {
  priority: Priority
}

export function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  if (priority === 'normal') {
    return <span style={{ color: 'var(--text-secondary)' }}>{PRIORITY_LABELS[priority]}</span>
  }

  const badgeClass = priority === 'high' ? 'cv-badge-high' : 'cv-badge-promising'
  const dotClass = priority === 'high' ? 'cv-priority-dot-high' : 'cv-priority-dot-promising'

  return (
    <span className={`cv-badge ${badgeClass}`}>
      <span className={`cv-priority-dot ${dotClass}`} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
