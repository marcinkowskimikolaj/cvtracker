import { MapPin } from 'lucide-react'

interface DistanceBadgeProps {
  distanceKm: number | null
  travelTimeMin: number | null
}

export function DistanceBadge({ distanceKm, travelTimeMin }: DistanceBadgeProps) {
  if (distanceKm === null || travelTimeMin === null) {
    return <span style={{ color: 'var(--text-tertiary)' }}>Brak danych dojazdu</span>
  }

  return (
    <span className="cv-badge cv-badge-accent">
      <MapPin size={14} /> ~{distanceKm} km, ~{travelTimeMin} min samochodem
    </span>
  )
}
