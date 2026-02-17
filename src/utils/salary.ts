export function calculateHourlyRate(monthlySalary: number | null): number | null {
  if (monthlySalary === null || Number.isNaN(monthlySalary)) {
    return null
  }

  if (monthlySalary <= 0) {
    return 0
  }

  return Number((monthlySalary / 160).toFixed(2))
}
