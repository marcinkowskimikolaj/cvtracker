import { useParams } from 'react-router-dom'
import { RecruiterCard } from '../components/recruiters/RecruiterCard'

export function RecruiterDetailPage() {
  const { recruiterId } = useParams<{ recruiterId: string }>()

  if (!recruiterId) {
    return (
      <section className="cv-card">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Brak ID rekrutera</h1>
      </section>
    )
  }

  return <RecruiterCard recruiterId={recruiterId} />
}
