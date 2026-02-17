import { useParams } from 'react-router-dom'
import { ApplicationDetail } from '../components/applications/ApplicationDetail'

export function ApplicationDetailPage() {
  const { appId } = useParams<{ appId: string }>()

  if (!appId) {
    return (
      <section className="cv-card">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Brak ID aplikacji</h1>
      </section>
    )
  }

  return <ApplicationDetail appId={appId} />
}
