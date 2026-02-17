interface AvgResponseTimeProps {
  avgDays: number
}

export function AvgResponseTime({ avgDays }: AvgResponseTimeProps) {
  const qualityLabel = avgDays <= 5 ? 'Bardzo szybko' : avgDays <= 10 ? 'Dobry wynik' : 'Warto poprawić follow-up'

  return (
    <section className="cv-card-sm" style={{ display: 'grid', gap: 10 }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Średni czas odpowiedzi</h3>
        <p className="cv-premium-caption">Średni czas od wysłania do odpowiedzi</p>
      </div>

      <p className="cv-stat-number" style={{ fontSize: '2.5rem' }}>
        {avgDays}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="cv-badge cv-badge-accent">dni</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{qualityLabel}</span>
      </div>
    </section>
  )
}
