import { DistanceBadge } from '../common/DistanceBadge'
import { MapEmbed } from '../common/MapEmbed'
import type { CompanyRecord, SheetRecord } from '../../types'

interface CompanyMapSectionProps {
  company: SheetRecord<CompanyRecord>
}

export function CompanyMapSection({ company }: CompanyMapSectionProps) {
  return (
    <section className="cv-card-nested" style={{ display: 'grid', gap: 12 }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Lokalizacja firmy</h3>
      <MapEmbed lat={company.lat} lng={company.lng} title={`Mapa firmy ${company.name}`} />
      <DistanceBadge distanceKm={company.distance_km} travelTimeMin={company.travel_time_min} />
    </section>
  )
}
