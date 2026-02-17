import { Download, Eye, Pencil, Trash2 } from 'lucide-react'
import type { FileRecord } from '../../types'
import { FILE_TYPE_LABELS } from '../../utils/constants'
import { formatDateTime } from '../../utils/dates'

interface FileCardProps {
  file: FileRecord & { __rowNumber: number }
  usageCount: number
  onPreview: () => void
  onEdit: () => void
  onDelete: () => void
  onShowUsage: () => void
}

function fileIconClass(fileType: FileRecord['file_type']): string {
  switch (fileType) {
    case 'cv':
      return 'cv-file-icon-cv'
    case 'cover_letter':
      return 'cv-file-icon-cover-letter'
    case 'recommendation':
    case 'reference_letter':
      return 'cv-file-icon-recommendation'
    default:
      return 'cv-file-icon-other'
  }
}

export function FileCard({ file, usageCount, onPreview, onEdit, onDelete, onShowUsage }: FileCardProps) {
  return (
    <article className="cv-card-sm cv-card-interactive" style={{ display: 'flex', gap: 16 }}>
      <div className={`cv-file-icon ${fileIconClass(file.file_type)}`}>
        {FILE_TYPE_LABELS[file.file_type].slice(0, 2)}
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{file.file_name}</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{file.version_label}</p>
        <p style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>{file.description || 'Brak opisu'}</p>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className="cv-badge-count" type="button" onClick={onShowUsage}>
            Użyto {usageCount} razy
          </button>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
            Dodano: {formatDateTime(file.created_at)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button className="cv-btn cv-btn-secondary cv-btn-icon" type="button" onClick={onPreview} title="Podgląd">
          <Eye size={16} />
        </button>
        <a className="cv-btn cv-btn-secondary cv-btn-icon" href={file.drive_url} download target="_blank" rel="noreferrer" title="Pobierz">
          <Download size={16} />
        </a>
        <button className="cv-btn cv-btn-secondary cv-btn-icon" type="button" onClick={onEdit} title="Edytuj">
          <Pencil size={16} />
        </button>
        <button className="cv-btn cv-btn-danger cv-btn-icon" type="button" onClick={onDelete} title="Usuń">
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}
