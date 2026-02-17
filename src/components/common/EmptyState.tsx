import { FileSearch } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="cv-empty-state">
      <FileSearch className="cv-empty-state-icon" />
      <h3 style={{ fontSize: '1.125rem', fontWeight: 500 }}>{title}</h3>
      <p style={{ color: 'var(--text-tertiary)' }}>{description}</p>
      {actionLabel && onAction ? (
        <button className="cv-btn cv-btn-primary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
