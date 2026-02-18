import { MapPin, Navigation2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { MapEmbed } from '../common/MapEmbed'
import type { CompanyRecord, SheetRecord } from '../../types'

interface CompanyMapSectionProps {
  company: SheetRecord<CompanyRecord>
  mapHeight?: number
}

export function CompanyMapSection({ company, mapHeight = 240 }: CompanyMapSectionProps) {
  const { config } = useAuth()
  const normalizedAddress = company.address.trim()
  const mapsApiKey = config.GOOGLE_MAPS_API_KEY || ''
  const directionUrl = normalizedAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(normalizedAddress)}`
    : ''
  const searchUrl = normalizedAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizedAddress)}`
    : ''

  return (
    <section className="cv-card-nested" style={{ display: 'grid', gap: 12 }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Lokalizacja firmy</h3>
      <MapEmbed
        address={normalizedAddress}
        mapsApiKey={mapsApiKey}
        title={`Mapa firmy ${company.name}`}
        height={mapHeight}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a
          className="cv-btn cv-btn-primary"
          href={directionUrl || undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!normalizedAddress}
          style={!normalizedAddress ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          onClick={(event) => {
            if (!normalizedAddress) {
              event.preventDefault()
            }
          }}
        >
          <Navigation2 size={16} />
          Prowadź do firmy
        </a>
        <a
          className="cv-btn cv-btn-ghost"
          href={searchUrl || undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!normalizedAddress}
          style={!normalizedAddress ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          onClick={(event) => {
            if (!normalizedAddress) {
              event.preventDefault()
            }
          }}
        >
          <MapPin size={16} />
          Zobacz na mapie
        </a>
      </div>
    </section>
  )
}
