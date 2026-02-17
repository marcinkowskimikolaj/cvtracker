import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { AppFileRecord, ApplicationRecord, CompanyRecord, FileRecord, SheetRecord } from '../../types'
import { formatDateTime } from '../../utils/dates'

interface FileUsageModalProps {
  open: boolean
  file: SheetRecord<FileRecord> | null
  appFiles: Array<SheetRecord<AppFileRecord>>
  applications: Array<SheetRecord<ApplicationRecord>>
  companies: Array<SheetRecord<CompanyRecord>>
  onClose: () => void
}

export function FileUsageModal({ open, file, appFiles, applications, companies, onClose }: FileUsageModalProps) {
  const usages = useMemo(() => {
    if (!file) {
      return []
    }

    return appFiles
      .filter((link) => link.file_id === file.file_id)
      .map((link) => {
        const app = applications.find((item) => item.app_id === link.app_id)
        const company = companies.find((item) => item.company_id === app?.company_id)

        return {
          appId: app?.app_id || '',
          position: app?.position_title || 'Nieznane stanowisko',
          companyName: company?.name || 'Nieznana firma',
          attachedAt: link.attached_at,
        }
      })
  }, [appFiles, applications, companies, file])

  if (!open || !file) {
    return null
  }

  return (
    <div className="cv-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="cv-modal" style={{ maxWidth: 700 }} onClick={(event) => event.stopPropagation()}>
        <div className="cv-modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Użycie pliku: {file.file_name}</h3>
        </div>

        <div className="cv-modal-body" style={{ display: 'grid', gap: 12 }}>
          {usages.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Ten plik nie został jeszcze podpięty do żadnej aplikacji.</p>
          ) : (
            usages.map((usage) => (
              <article key={`${usage.appId}-${usage.attachedAt}`} className="cv-card-nested">
                <p style={{ fontWeight: 600 }}>{usage.companyName}</p>
                <p style={{ color: 'var(--text-secondary)' }}>{usage.position}</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: 6 }}>
                  Podpięto: {formatDateTime(usage.attachedAt)}
                </p>
                {usage.appId ? (
                  <Link className="cv-btn cv-btn-ghost" to={`/aplikacje/${usage.appId}`} onClick={onClose}>
                    Otwórz aplikację
                  </Link>
                ) : null}
              </article>
            ))
          )}
        </div>

        <div className="cv-modal-footer">
          <button className="cv-btn cv-btn-secondary" type="button" onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>
    </div>
  )
}
