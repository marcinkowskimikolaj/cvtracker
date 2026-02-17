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
    <section className="cv-card-sm" style={{ height: 360 }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 10 }}>Skuteczność CV</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="fileName" width={140} />
          <Tooltip />
          <Bar dataKey="successRate" name="Skuteczność %" fill="var(--accent)" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
