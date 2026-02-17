import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ApplicationsOverTimeChartProps {
  data: Array<{ week: string; count: number }>
}

export function ApplicationsOverTimeChart({ data }: ApplicationsOverTimeChartProps) {
  return (
    <section className="cv-card-sm" style={{ height: 320 }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 10 }}>Aplikacje w czasie</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="week" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
