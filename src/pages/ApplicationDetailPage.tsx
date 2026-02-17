import { useParams } from 'react-router-dom'

export function ApplicationDetailPage() {
  const { appId } = useParams<{ appId: string }>()

  return (
    <section className="cv-card page-enter">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: 8 }}>Szczegóły aplikacji</h1>
      <p style={{ color: 'var(--text-secondary)' }}>ID aplikacji: {appId}</p>
    </section>
  )
}
