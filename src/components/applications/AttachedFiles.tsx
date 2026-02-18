import { ExternalLink, Paperclip, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApplications } from '../../hooks/useApplications'
import { useFiles } from '../../hooks/useFiles'
import { useToastStore } from '../../store/toastStore'
import type { ApplicationRecord, FileType, SheetRecord } from '../../types'
import { nowIsoDateTime } from '../../utils/dates'
import { FILE_TYPE_LABELS } from '../../utils/constants'

interface AttachedFilesProps {
  app: SheetRecord<ApplicationRecord>
}

function fileIconClass(fileType: FileType): string {
  switch (fileType) {
    case 'cv':
      return 'cv-file-icon cv-file-icon-cv'
    case 'cover_letter':
      return 'cv-file-icon cv-file-icon-cover-letter'
    case 'recommendation':
      return 'cv-file-icon cv-file-icon-recommendation'
    case 'reference_letter':
      return 'cv-file-icon cv-file-icon-reference'
    case 'other':
      return 'cv-file-icon cv-file-icon-other'
    default:
      return 'cv-file-icon cv-file-icon-other'
  }
}

export function AttachedFiles({ app }: AttachedFilesProps) {
  const { files } = useFiles()
  const { appFiles, createAppFile, deleteAppFile } = useApplications()
  const pushToast = useToastStore((state) => state.push)

  const [selectedFileId, setSelectedFileId] = useState('')

  const linked = useMemo(
    () =>
      appFiles
        .filter((link) => link.app_id === app.app_id)
        .map((link) => ({
          link,
          file: files.find((item) => item.file_id === link.file_id),
        }))
        .filter((item): item is { link: (typeof appFiles)[number]; file: (typeof files)[number] } =>
          Boolean(item.file),
        ),
    [app.app_id, appFiles, files],
  )
  const linkedFileIds = useMemo(() => new Set(linked.map((item) => item.file.file_id)), [linked])
  const availableFiles = useMemo(
    () => files.filter((file) => !linkedFileIds.has(file.file_id)),
    [files, linkedFileIds],
  )

  async function attach(): Promise<void> {
    if (!selectedFileId) {
      return
    }

    try {
      await createAppFile({
        app_id: app.app_id,
        file_id: selectedFileId,
        attached_at: nowIsoDateTime(),
      })
      pushToast({ title: 'Podpięto plik.', variant: 'success' })
      setSelectedFileId('')
    } catch (error) {
      pushToast({ title: error instanceof Error ? error.message : 'Nie udało się podpiąć pliku.', variant: 'error' })
    }
  }

  return (
    <section className="cv-card-nested" style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Pliki</h3>
        <span className="cv-badge cv-badge-count">{linked.length}</span>
      </div>

      {linked.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Brak podpiętych plików.</p> : null}

      {linked.map(({ link, file }) => (
        <article
          key={link.__rowNumber}
          className="cv-card-nested"
          style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 10 }}
        >
          <div className={fileIconClass(file.file_type)} aria-hidden="true">
            <Paperclip size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600 }}>{file.file_name || 'Nieznany plik'}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {FILE_TYPE_LABELS[file.file_type]} • {file.version_label || 'Brak wersji'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <a className="cv-btn cv-btn-ghost cv-btn-icon" href={file.drive_url} target="_blank" rel="noreferrer" title="Podgląd">
              <ExternalLink size={14} />
            </a>
            <button
              className="cv-btn cv-btn-ghost cv-btn-icon"
              type="button"
              title="Odepnij"
              onClick={() => void deleteAppFile(link.__rowNumber)}
            >
              <X size={14} />
            </button>
          </div>
        </article>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <select className="cv-input cv-select" value={selectedFileId} onChange={(event) => setSelectedFileId(event.target.value)}>
          <option value="">Wybierz plik do podpięcia</option>
          {availableFiles.map((file) => (
            <option key={file.file_id} value={file.file_id}>
              {file.file_name} ({file.version_label || FILE_TYPE_LABELS[file.file_type]})
            </option>
          ))}
        </select>
        <button className="cv-btn cv-btn-primary" type="button" onClick={() => void attach()}>
          Podepnij plik
        </button>
      </div>
    </section>
  )
}
