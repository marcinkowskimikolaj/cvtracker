import { calculateHourlyRate } from '../../utils/salary'

interface SalaryCalculatorProps {
  monthlySalary: number | null
  onMonthlySalaryChange: (value: number | null) => void
}

export function SalaryCalculator({ monthlySalary, onMonthlySalaryChange }: SalaryCalculatorProps) {
  const hourlyRate = calculateHourlyRate(monthlySalary)

  return (
    <div className="cv-card-nested" style={{ display: 'grid', gap: 10 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Oczekiwania finansowe</h3>
      <label htmlFor="monthly-salary">Stawka miesięczna (PLN brutto)</label>
      <input
        id="monthly-salary"
        className="cv-input"
        type="number"
        min={0}
        value={monthlySalary ?? ''}
        onChange={(event) => {
          const value = event.target.value.trim()
          onMonthlySalaryChange(value ? Number(value) : null)
        }}
      />
      <p style={{ color: 'var(--text-secondary)' }}>
        Stawka godzinowa: <strong>{hourlyRate !== null ? `${hourlyRate} PLN` : '-'}</strong>
      </p>
    </div>
  )
}
