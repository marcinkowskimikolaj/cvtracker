import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section className="cv-card" style={{ width: 'min(520px, 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="cv-file-icon cv-file-icon-cv">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>CV Tracker</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Zaloguj się kontem Google, aby kontynuować.</p>
          </div>
        </div>

        <button type="button" className="cv-btn cv-btn-primary" onClick={() => void login()} disabled={isLoading}>
          {isLoading ? 'Logowanie...' : 'Zaloguj przez Google'}
        </button>

        {error ? (
          <div className="cv-toast" style={{ marginTop: 16 }}>
            <div style={{ flex: 1 }}>
              <p>{error}</p>
            </div>
            <button type="button" className="cv-btn cv-btn-ghost cv-btn-icon" onClick={clearError}>
              OK
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
