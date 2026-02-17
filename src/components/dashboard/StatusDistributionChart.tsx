import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface StatusDistributionChartProps {
  data: Array<{ name: string; value: number; color: string }>
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  return (
    <section className="cv-card-sm" style={{ height: 320 }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 10 }}>Rozkład statusów</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </section>
  )
}
