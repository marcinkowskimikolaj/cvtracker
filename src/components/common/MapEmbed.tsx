interface MapEmbedProps {
  lat: number | null
  lng: number | null
  title: string
  height?: 'map-sm' | 'map-md'
}

export function MapEmbed({ lat, lng, title, height = 'map-md' }: MapEmbedProps) {
  if (lat === null || lng === null) {
    return (
      <div className="cv-map-container" style={{ height: height === 'map-sm' ? 160 : 200, display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Brak współrzędnych mapy.</p>
      </div>
    )
  }

  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`

  return (
    <div className="cv-map-container" style={{ height: height === 'map-sm' ? 160 : 200 }}>
      <iframe title={title} src={src} />
    </div>
  )
}
