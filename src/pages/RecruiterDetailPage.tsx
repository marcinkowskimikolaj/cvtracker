import { useParams } from 'react-router-dom'

export function RecruiterDetailPage() {
  const { recruiterId } = useParams<{ recruiterId: string }>()

  return (
    <section className="cv-card page-enter">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: 8 }}>Karta rekrutera</h1>
      <p style={{ color: 'var(--text-secondary)' }}>ID rekrutera: {recruiterId}</p>
    </section>
  )
}
