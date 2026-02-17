interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="cv-overlay" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="cv-modal" style={{ maxWidth: 460 }} onClick={(event) => event.stopPropagation()}>
        <div className="cv-modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
        </div>
        <div className="cv-modal-body">
          <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
        </div>
        <div className="cv-modal-footer">
          <button type="button" className="cv-btn cv-btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="cv-btn cv-btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
