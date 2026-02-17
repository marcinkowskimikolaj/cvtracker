import { useParams } from 'react-router-dom'

export function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>()

  return (
    <section className="cv-card page-enter">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: 8 }}>Karta firmy</h1>
      <p style={{ color: 'var(--text-secondary)' }}>ID firmy: {companyId}</p>
    </section>
  )
}
