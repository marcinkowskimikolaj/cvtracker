import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface StatusDistributionChartProps {
  data: Array<{ name: string; value: number; color: string }>
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const total = data.reduce((acc, row) => acc + row.value, 0)

  return (
    <section className="cv-card-sm cv-premium-chart-card" style={{ minHeight: 360 }}>
      <div className="cv-premium-chart-header">
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Rozkład statusów</h3>
          <p className="cv-premium-caption">Łącznie: {total} aplikacji</p>
        </div>
      </div>

      <div style={{ height: 210 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-dropdown)',
                background: 'rgba(255,255,255,0.95)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="cv-premium-legend">
        {data.map((row) => (
          <div key={row.name} className="cv-premium-legend-item">
            <span>
              <span className="cv-premium-legend-dot" style={{ background: row.color }} />
              {row.name}
            </span>
            <strong style={{ color: 'var(--text-primary)' }}>{row.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
