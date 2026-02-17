import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ApplicationsOverTimeChartProps {
  data: Array<{ week: string; count: number }>
}

export function ApplicationsOverTimeChart({ data }: ApplicationsOverTimeChartProps) {
  const total = data.reduce((acc, point) => acc + point.count, 0)

  return (
    <section className="cv-card cv-premium-chart-card" style={{ minHeight: 380 }}>
      <div className="cv-premium-chart-header">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Aplikacje w czasie</h3>
          <p className="cv-premium-caption">Łącznie wysłano {total} aplikacji w wybranym okresie.</p>
        </div>
        <span className="cv-badge cv-badge-accent">Tygodniowo</span>
      </div>

      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 4, right: 10, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-subtle)" />
            <XAxis dataKey="week" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(59, 111, 212, 0.07)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-dropdown)',
                background: 'rgba(255,255,255,0.95)',
              }}
            />
            <Bar dataKey="count" fill="var(--accent)" radius={[10, 10, 4, 4]} maxBarSize={38} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
