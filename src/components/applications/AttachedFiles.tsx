import { useState } from 'react'
import { useApplications } from '../../hooks/useApplications'
import { useFiles } from '../../hooks/useFiles'
import { useToastStore } from '../../store/toastStore'
import type { ApplicationRecord, SheetRecord } from '../../types'
import { nowIsoDateTime } from '../../utils/dates'

interface AttachedFilesProps {
  app: SheetRecord<ApplicationRecord>
}

export function AttachedFiles({ app }: AttachedFilesProps) {
  const { files } = useFiles()
  const { appFiles, createAppFile, deleteAppFile } = useApplications()
  const pushToast = useToastStore((state) => state.push)

  const [selectedFileId, setSelectedFileId] = useState('')

  const linked = appFiles
    .filter((link) => link.app_id === app.app_id)
    .map((link) => ({
      link,
      file: files.find((item) => item.file_id === link.file_id),
    }))

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
      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Wysłane pliki</h3>
      {linked.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Brak podpiętych plików.</p> : null}

      {linked.map(({ link, file }) => (
        <article key={link.__rowNumber} className="cv-card-nested" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <p style={{ fontWeight: 500 }}>{file?.file_name || 'Nieznany plik'}</p>
            <p style={{ color: 'var(--text-secondary)' }}>{file?.version_label || '-'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {file ? (
              <a className="cv-btn cv-btn-secondary" href={file.drive_url} target="_blank" rel="noreferrer">
                Podgląd
              </a>
            ) : null}
            <button className="cv-btn cv-btn-danger" type="button" onClick={() => void deleteAppFile(link.__rowNumber)}>
              Odepnij
            </button>
          </div>
        </article>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <select className="cv-input cv-select" value={selectedFileId} onChange={(event) => setSelectedFileId(event.target.value)}>
          <option value="">Wybierz plik do podpięcia</option>
          {files
            .filter((file) => !linked.some((item) => item.file?.file_id === file.file_id))
            .map((file) => (
              <option key={file.file_id} value={file.file_id}>
                {file.file_name} ({file.version_label})
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
