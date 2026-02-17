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
    <section className="cv-card cv-premium-chart-card">
      <div className="cv-premium-chart-header">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Lejek konwersji</h3>
          <p className="cv-premium-caption">Przejście od wysłanych aplikacji do ofert.</p>
        </div>
      </div>

      <div className="cv-premium-funnel">
        <div className="cv-premium-funnel-row">
          <div className="cv-premium-funnel-row-top">
            <span>Wysłano</span>
            <strong>{sent}</strong>
          </div>
          <div className="cv-premium-funnel-track">
            <span style={{ width: '100%' }} />
          </div>
        </div>

        <div className="cv-premium-funnel-row">
          <div className="cv-premium-funnel-row-top">
            <span>Rozmowy</span>
            <strong>
              {interview} ({interviewPct}%)
            </strong>
          </div>
          <div className="cv-premium-funnel-track">
            <span style={{ width: `${Math.max(interviewPct, 2)}%` }} />
          </div>
        </div>

        <div className="cv-premium-funnel-row">
          <div className="cv-premium-funnel-row-top">
            <span>Oferty</span>
            <strong>
              {offer} ({offerPct}%)
            </strong>
          </div>
          <div className="cv-premium-funnel-track">
            <span style={{ width: `${Math.max(offerPct, 2)}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
