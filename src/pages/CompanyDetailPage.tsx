import { useParams } from 'react-router-dom'
import { CompanyCard } from '../components/companies/CompanyCard'

export function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>()

  if (!companyId) {
    return (
      <section className="cv-card">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Brak ID firmy</h1>
      </section>
    )
  }

  return <CompanyCard companyId={companyId} />
}
