interface ConversionFunnelProps {
  sent: number
  interview: number
  offer: number
}

function percent(part: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return Number(((part / total) * 100).toFixed(1))
}

export function ConversionFunnel({ sent, interview, offer }: ConversionFunnelProps) {
  const interviewPct = percent(interview, sent)
  const offerPct = percent(offer, sent)

  return (
    <section className="cv-card-sm" style={{ display: 'grid', gap: 12 }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Lejek konwersji</h3>

      <div className="cv-card-nested">
        <p>Wysłano: {sent}</p>
        <div className="cv-progress-bars">
          <span className="cv-progress-bar cv-progress-bar-active" style={{ height: 32, width: '100%' }} />
        </div>
      </div>

      <div className="cv-card-nested">
        <p>Rozmowa: {interview} ({interviewPct}%)</p>
        <div className="cv-progress-bars">
          <span className="cv-progress-bar cv-progress-bar-active" style={{ height: 24, width: `${Math.max(interviewPct, 2)}%` }} />
        </div>
      </div>

      <div className="cv-card-nested">
        <p>Oferta: {offer} ({offerPct}%)</p>
        <div className="cv-progress-bars">
          <span className="cv-progress-bar cv-progress-bar-active" style={{ height: 16, width: `${Math.max(offerPct, 2)}%` }} />
        </div>
      </div>
    </section>
  )
}
