interface FilePreviewProps {
  open: boolean
  title: string
  driveFileId: string
  driveUrl: string
  onClose: () => void
}

export function FilePreview({ open, title, driveFileId, driveUrl, onClose }: FilePreviewProps) {
  if (!open) {
    return null
  }

  return (
    <div className="cv-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="cv-modal" onClick={(event) => event.stopPropagation()}>
        <div className="cv-modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
          <button type="button" className="cv-btn cv-btn-ghost cv-btn-icon" onClick={onClose}>
            Zamknij
          </button>
        </div>
        <div className="cv-modal-body">
          <iframe
            title={title}
            src={`https://drive.google.com/file/d/${driveFileId}/preview`}
            style={{ width: '100%', height: 520, border: 'none', borderRadius: 12 }}
          />
          <div style={{ marginTop: 12 }}>
            <a className="cv-btn cv-btn-secondary" href={driveUrl} target="_blank" rel="noreferrer">
              Otwórz w Drive
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
