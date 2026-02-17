import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useFiles } from '../../hooks/useFiles'
import { useProfile } from '../../hooks/useProfile'
import { resolveUploadFolderId, uploadFile } from '../../services/google/drive'
import { useToastStore } from '../../store/toastStore'
import type { FileRecord, FileType, SheetRecord } from '../../types'
import { FILE_TYPE_LABELS } from '../../utils/constants'
import { nowIsoDateTime } from '../../utils/dates'
import { generateId } from '../../utils/uuid'

interface FileUploadModalProps {
  open: boolean
  editingFile?: SheetRecord<FileRecord> | null
  onClose: () => void
}

export function FileUploadModal({ open, editingFile, onClose }: FileUploadModalProps) {
  const { accessToken, config } = useAuth()
  const { activeProfile } = useProfile()
  const { createFile, updateFile } = useFiles()
  const pushToast = useToastStore((state) => state.push)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<FileType>('cv')
  const [versionLabel, setVersionLabel] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = useMemo(() => Boolean(editingFile), [editingFile])

  useEffect(() => {
    if (!editingFile) {
      setFileName('')
      setFileType('cv')
      setVersionLabel('')
      setDescription('')
      setSelectedFile(null)
      return
    }

    setFileName(editingFile.file_name)
    setFileType(editingFile.file_type)
    setVersionLabel(editingFile.version_label)
    setDescription(editingFile.description)
  }, [editingFile])

  if (!open) {
    return null
  }

  async function handleSubmit(): Promise<void> {
    if (!fileName.trim()) {
      pushToast({ title: 'Podaj nazwę pliku.', variant: 'error' })
      return
    }

    if (!isEditMode && !selectedFile) {
      pushToast({ title: 'Wybierz plik do uploadu.', variant: 'error' })
      return
    }

    if (!accessToken) {
      pushToast({ title: 'Brak aktywnej sesji Google.', variant: 'error' })
      return
    }

    if (!config.GOOGLE_DRIVE_FOLDER_ID) {
      pushToast({ title: 'Brak GOOGLE_DRIVE_FOLDER_ID w _Config.', variant: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode && editingFile) {
        await updateFile({
          ...editingFile,
          file_name: fileName.trim(),
          file_type: fileType,
          version_label: versionLabel.trim(),
          description: description.trim(),
        })
      } else if (selectedFile) {
        const targetFolderId = await resolveUploadFolderId(
          accessToken,
          config.GOOGLE_DRIVE_FOLDER_ID,
          activeProfile,
          fileType,
        )

        const uploaded = await uploadFile({
          accessToken,
          file: selectedFile,
          fileName: fileName.trim(),
          parentFolderId: targetFolderId,
        })

        await createFile({
          file_id: generateId(),
          profile_id: activeProfile,
          file_name: fileName.trim(),
          file_type: fileType,
          drive_file_id: uploaded.driveFileId,
          drive_url: uploaded.driveUrl,
          description: description.trim(),
          version_label: versionLabel.trim(),
          created_at: nowIsoDateTime(),
        })
      }

      pushToast({ title: isEditMode ? 'Zaktualizowano metadane pliku.' : 'Plik został dodany.', variant: 'success' })
      onClose()
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się zapisać pliku.',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="cv-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="cv-modal" style={{ maxWidth: 640 }} onClick={(event) => event.stopPropagation()}>
        <div className="cv-modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {isEditMode ? 'Edytuj metadane pliku' : 'Dodaj plik'}
          </h3>
        </div>

        <div className="cv-modal-body" style={{ display: 'grid', gap: 12 }}>
          {!isEditMode ? (
            <div>
              <label htmlFor="upload-file">Plik</label>
              <input
                id="upload-file"
                className="cv-input"
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="file-name">Nazwa pliku</label>
            <input
              id="file-name"
              className="cv-input"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="np. CV Senior Frontend"
            />
          </div>

          <div>
            <label htmlFor="file-type">Typ pliku</label>
            <select
              id="file-type"
              className="cv-input cv-select"
              value={fileType}
              onChange={(event) => setFileType(event.target.value as FileType)}
            >
              {(Object.keys(FILE_TYPE_LABELS) as FileType[]).map((type) => (
                <option key={type} value={type}>
                  {FILE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="version">Wersja</label>
            <input
              id="version"
              className="cv-input"
              value={versionLabel}
              onChange={(event) => setVersionLabel(event.target.value)}
              placeholder="np. CV v3 — tech focus"
            />
          </div>

          <div>
            <label htmlFor="description">Opis</label>
            <textarea
              id="description"
              className="cv-input cv-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Notatki o tym pliku"
            />
          </div>
        </div>

        <div className="cv-modal-footer">
          <button className="cv-btn cv-btn-secondary" type="button" onClick={onClose}>
            Anuluj
          </button>
          <button className="cv-btn cv-btn-primary" type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : isEditMode ? 'Zapisz zmiany' : 'Dodaj plik'}
          </button>
        </div>
      </div>
    </div>
  )
}
