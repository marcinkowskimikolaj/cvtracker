import { useMemo, useState } from 'react'
import { FilePreview } from '../common/FilePreview'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { FileCard } from './FileCard'
import { FileTypeFilter } from './FileTypeFilter'
import { FileUploadModal } from './FileUploadModal'
import { FileUsageModal } from './FileUsageModal'
import type { FileRecord, FileType, SheetRecord } from '../../types'
import { useFiles } from '../../hooks/useFiles'
import { useApplications } from '../../hooks/useApplications'
import { useCompanies } from '../../hooks/useCompanies'
import { useToastStore } from '../../store/toastStore'

export function FileList() {
  const { files, deleteFile } = useFiles()
  const { appFiles, applications } = useApplications()
  const { companies } = useCompanies()
  const pushToast = useToastStore((state) => state.push)

  const [activeType, setActiveType] = useState<FileType | 'all'>('all')
  const [previewFile, setPreviewFile] = useState<SheetRecord<FileRecord> | null>(null)
  const [usageFile, setUsageFile] = useState<SheetRecord<FileRecord> | null>(null)
  const [editFile, setEditFile] = useState<SheetRecord<FileRecord> | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteRowNumber, setDeleteRowNumber] = useState<number | null>(null)

  const filteredFiles = useMemo(
    () => files.filter((file) => activeType === 'all' || file.file_type === activeType),
    [activeType, files],
  )

  const usageMap = useMemo(() => {
    const map = new Map<string, number>()

    appFiles.forEach((link) => {
      const current = map.get(link.file_id) || 0
      map.set(link.file_id, current + 1)
    })

    return map
  }, [appFiles])

  async function handleDelete(): Promise<void> {
    if (deleteRowNumber === null) {
      return
    }

    try {
      await deleteFile(deleteRowNumber)
      pushToast({ title: 'Plik został usunięty.', variant: 'success' })
      setDeleteRowNumber(null)
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się usunąć pliku.',
        variant: 'error',
      })
    }
  }

  return (
    <section className="cv-card page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Pliki</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Twoje CV, listy motywacyjne i rekomendacje.</p>
        </div>
        <button
          className="cv-btn cv-btn-primary"
          type="button"
          onClick={() => {
            setEditFile(null)
            setShowModal(true)
          }}
        >
          Dodaj plik
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <FileTypeFilter activeType={activeType} onChange={setActiveType} />
      </div>

      <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
        {filteredFiles.length === 0 ? (
          <EmptyState
            title="Brak plików"
            description="Dodaj pierwszy plik, aby rozpocząć budowanie biblioteki dokumentów."
            actionLabel="Dodaj plik"
            onAction={() => setShowModal(true)}
          />
        ) : (
          filteredFiles.map((file) => (
            <FileCard
              key={file.file_id}
              file={file}
              usageCount={usageMap.get(file.file_id) || 0}
              onPreview={() => setPreviewFile(file)}
              onShowUsage={() => setUsageFile(file)}
              onEdit={() => {
                setEditFile(file)
                setShowModal(true)
              }}
              onDelete={() => setDeleteRowNumber(file.__rowNumber)}
            />
          ))
        )}
      </div>

      <FileUploadModal
        open={showModal}
        editingFile={editFile}
        onClose={() => {
          setShowModal(false)
          setEditFile(null)
        }}
      />

      <FilePreview
        open={Boolean(previewFile)}
        title={previewFile?.file_name || 'Podgląd pliku'}
        driveFileId={previewFile?.drive_file_id || ''}
        driveUrl={previewFile?.drive_url || ''}
        onClose={() => setPreviewFile(null)}
      />

      <FileUsageModal
        open={Boolean(usageFile)}
        file={usageFile}
        appFiles={appFiles}
        applications={applications}
        companies={companies}
        onClose={() => setUsageFile(null)}
      />

      <ConfirmDialog
        open={deleteRowNumber !== null}
        title="Usunąć plik?"
        description="Ta operacja usunie rekord pliku z arkusza."
        confirmLabel="Usuń"
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteRowNumber(null)}
      />
    </section>
  )
}
