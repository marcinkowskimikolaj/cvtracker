import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface CvEffectivenessPoint {
  fileId: string
  fileName: string
  usageCount: number
  interviewCount: number
  successRate: number
}

interface CvEffectivenessChartProps {
  data: CvEffectivenessPoint[]
}

export function CvEffectivenessChart({ data }: CvEffectivenessChartProps) {
  return (
    <section className="cv-card cv-premium-chart-card" style={{ minHeight: 420 }}>
      <div className="cv-premium-chart-header">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Skuteczność CV</h3>
          <p className="cv-premium-caption">Porównanie skuteczności wysłanych wersji CV.</p>
        </div>
        <span className="cv-badge cv-badge-dark">CV</span>
      </div>

      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="var(--border-subtle)" />
            <XAxis type="number" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="fileName" width={140} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-dropdown)',
                background: 'rgba(255,255,255,0.95)',
              }}
            />
            <Bar dataKey="successRate" name="Skuteczność %" fill="var(--accent)" radius={[0, 10, 10, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
