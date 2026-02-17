interface AvgResponseTimeProps {
  avgDays: number
}

export function AvgResponseTime({ avgDays }: AvgResponseTimeProps) {
  return (
    <section className="cv-card-sm">
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 8 }}>Średni czas odpowiedzi</h3>
      <p className="cv-stat-number">{avgDays}</p>
      <p className="cv-stat-label">dni</p>
    </section>
  )
}
