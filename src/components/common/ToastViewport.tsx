import { X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

function accentColor(variant: 'info' | 'error' | 'success'): string {
  if (variant === 'error') {
    return '#C93B3B'
  }

  if (variant === 'success') {
    return '#1D8A56'
  }

  return 'var(--accent)'
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const remove = useToastStore((state) => state.remove)

  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 100, display: 'grid', gap: 10 }}>
      {toasts.map((toast) => (
        <div key={toast.id} className="cv-toast" role="status" aria-live="polite">
          <span
            aria-hidden="true"
            style={{ width: 8, height: 8, borderRadius: 9999, background: accentColor(toast.variant) }}
          />
          <span style={{ flex: 1 }}>{toast.title}</span>
          <button className="cv-btn cv-btn-ghost cv-btn-icon" type="button" onClick={() => remove(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
