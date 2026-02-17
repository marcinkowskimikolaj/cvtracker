import type {
  ApplicationRecord,
  CalendarEventRecord,
  DashboardMetrics,
  FileRecord,
  SheetRecord,
} from '../../types'
import { daysBetween } from '../../utils/dates'

export function computeDashboardMetrics(applications: Array<SheetRecord<ApplicationRecord>>): DashboardMetrics {
  const totalApplications = applications.length
  const totalInterviews = applications.filter((item) => item.status === 'interview').length
  const totalOffers = applications.filter((item) => item.status === 'offer').length
  const totalRejected = applications.filter((item) => item.status === 'rejected').length

  const withResponse = applications.filter((item) => Boolean(item.response_date))
  const responseRate = totalApplications === 0 ? 0 : (withResponse.length / totalApplications) * 100

  const responseDays = withResponse
    .filter((item) => item.applied_date && item.response_date)
    .map((item) => daysBetween(item.applied_date, item.response_date))

  const avgResponseDays =
    responseDays.length === 0
      ? 0
      : Number((responseDays.reduce((acc, value) => acc + value, 0) / responseDays.length).toFixed(1))

  return {
    totalApplications,
    totalInterviews,
    totalOffers,
    totalRejected,
    responseRate: Number(responseRate.toFixed(1)),
    avgResponseDays,
  }
}

export function computeCvEffectiveness(
  files: Array<SheetRecord<FileRecord>>,
  applications: Array<SheetRecord<ApplicationRecord>>,
  appFiles: Array<{ file_id: string; app_id: string }>,
): Array<{ fileId: string; fileName: string; usageCount: number; interviewCount: number; successRate: number }> {
  const cvFiles = files.filter((file) => file.file_type === 'cv')

  return cvFiles.map((file) => {
    const linkedAppIds = appFiles.filter((link) => link.file_id === file.file_id).map((link) => link.app_id)
    const linkedApps = applications.filter((application) => linkedAppIds.includes(application.app_id))

    const usageCount = linkedApps.length
    const interviewCount = linkedApps.filter(
      (application) => application.status === 'interview' || application.status === 'offer',
    ).length

    return {
      fileId: file.file_id,
      fileName: file.file_name,
      usageCount,
      interviewCount,
      successRate: usageCount === 0 ? 0 : Number(((interviewCount / usageCount) * 100).toFixed(1)),
    }
  })
}

export function upcomingEvents(
  calendarEvents: Array<SheetRecord<CalendarEventRecord>>,
  limit = 5,
): Array<SheetRecord<CalendarEventRecord>> {
  const now = new Date()

  return [...calendarEvents]
    .filter((event) => {
      const date = new Date(`${event.event_date}T${event.event_time || '00:00'}:00`)
      return date.getTime() >= now.getTime()
    })
    .sort((a, b) => {
      const first = new Date(`${a.event_date}T${a.event_time || '00:00'}:00`).getTime()
      const second = new Date(`${b.event_date}T${b.event_time || '00:00'}:00`).getTime()
      return first - second
    })
    .slice(0, limit)
}
