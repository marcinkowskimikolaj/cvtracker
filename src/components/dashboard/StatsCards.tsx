import { Briefcase, CircleX, MessageCircleMore, Target, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DashboardMetrics } from '../../types'

interface StatsCardsProps {
  metrics: DashboardMetrics
}

interface StatCard {
  label: string
  value: string
  icon: LucideIcon
  tone: 'neutral' | 'success' | 'danger' | 'accent'
}

function barsForValue(rawValue: string): number[] {
  const numeric = Number(String(rawValue).replace('%', '').replace(',', '.')) || 0
  return Array.from({ length: 9 }, (_, index) => 8 + ((Math.round(numeric) + index * 7) % 24))
}

export function StatsCards({ metrics }: StatsCardsProps) {
  const cards: StatCard[] = [
    { label: 'Łączna liczba aplikacji', value: String(metrics.totalApplications), icon: Briefcase, tone: 'neutral' },
    { label: 'Rozmowy', value: String(metrics.totalInterviews), icon: MessageCircleMore, tone: 'accent' },
    { label: 'Oferty', value: String(metrics.totalOffers), icon: Trophy, tone: 'success' },
    { label: 'Odrzucone', value: String(metrics.totalRejected), icon: CircleX, tone: 'danger' },
    { label: 'Współczynnik odpowiedzi', value: `${metrics.responseRate}%`, icon: Target, tone: 'accent' },
  ]

  return (
    <div className="cv-premium-stat-grid">
      {cards.map((card) => {
        const Icon = card.icon
        const color =
          card.tone === 'success'
            ? '#1D8A56'
            : card.tone === 'danger'
              ? '#C93B3B'
              : card.tone === 'accent'
                ? 'var(--accent)'
                : 'var(--text-secondary)'

        return (
          <article key={card.label} className="cv-stat-card cv-premium-stat-card">
            <div className="cv-premium-stat-top">
              <p className="cv-stat-label" style={{ color: 'var(--text-secondary)' }}>
                {card.label}
              </p>
              <span className="cv-premium-stat-icon" style={{ color }}>
                <Icon size={16} />
              </span>
            </div>

            <p className="cv-stat-number" style={{ fontSize: '2.25rem' }}>
              {card.value}
            </p>

            <div className="cv-premium-mini-bars" aria-hidden="true">
              {barsForValue(card.value).map((height, index) => (
                <span key={`${card.label}-${index}`} data-active={index >= 3 ? 'true' : 'false'} style={{ height }} />
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
