import { useEffect } from 'react'

interface SearchPaletteProps {
  open: boolean
  onClose: () => void
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
      }

      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!open) {
    return null
  }

  return (
    <div className="cv-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="cv-command-palette" onClick={(event) => event.stopPropagation()}>
        <input className="cv-command-input" placeholder="Szukaj firmy, stanowiska, rekrutera, pliku..." autoFocus />
        <div className="cv-divider" style={{ margin: 0 }} />
        <p style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
          Wyszukiwarka globalna zostanie aktywowana w Fazie 4.
        </p>
      </div>
    </div>
  )
}
