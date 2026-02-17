import type { DashboardMetrics } from '../../types'

interface StatsCardsProps {
  metrics: DashboardMetrics
}

export function StatsCards({ metrics }: StatsCardsProps) {
  const cards = [
    { label: 'Łączna liczba aplikacji', value: metrics.totalApplications },
    { label: 'Liczba rozmów', value: metrics.totalInterviews },
    { label: 'Liczba ofert', value: metrics.totalOffers },
    { label: 'Liczba odrzuceń', value: metrics.totalRejected },
    { label: 'Współczynnik odpowiedzi', value: `${metrics.responseRate}%` },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}
    >
      {cards.map((card) => (
        <article key={card.label} className="cv-stat-card">
          <div className="cv-stat-number">{card.value}</div>
          <div className="cv-stat-label">{card.label}</div>
        </article>
      ))}
    </div>
  )
}
