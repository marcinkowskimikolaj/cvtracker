interface MapEmbedProps {
  address: string
  mapsApiKey: string
  title: string
  height?: number
}

export function MapEmbed({ address, mapsApiKey, title, height = 240 }: MapEmbedProps) {
  if (!address.trim()) {
    return (
      <div className="cv-map-container" style={{ height, display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Dodaj adres firmy, aby wyświetlić mapę.</p>
      </div>
    )
  }

  if (!mapsApiKey.trim()) {
    return (
      <div className="cv-map-container" style={{ height, display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Brak GOOGLE_MAPS_API_KEY w _Config.</p>
      </div>
    )
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsApiKey)}&q=${encodeURIComponent(address)}`

  return (
    <div className="cv-map-container" style={{ height }}>
      <iframe title={title} src={src} />
    </div>
  )
}
