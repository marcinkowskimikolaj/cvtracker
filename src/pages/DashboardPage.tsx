import { eachWeekOfInterval, endOfWeek, parseISO, startOfWeek } from 'date-fns'
import { BarChart3, Clock3, MailCheck, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ApplicationsOverTimeChart } from '../components/dashboard/ApplicationsOverTimeChart'
import { AvgResponseTime } from '../components/dashboard/AvgResponseTime'
import { ConversionFunnel } from '../components/dashboard/ConversionFunnel'
import { CvEffectivenessChart } from '../components/dashboard/CvEffectivenessChart'
import { StatsCards } from '../components/dashboard/StatsCards'
import { StatusDistributionChart } from '../components/dashboard/StatusDistributionChart'
import { UpcomingEvents } from '../components/dashboard/UpcomingEvents'
import { useApplications } from '../hooks/useApplications'
import { useFiles } from '../hooks/useFiles'
import { useStats } from '../hooks/useStats'
import { computeDashboardMetrics } from '../services/data/statsService'
import { STATUS_LABELS } from '../utils/constants'
import { nowIsoDate } from '../utils/dates'

function weekLabel(date: Date): string {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  return `${weekStart.toISOString().slice(5, 10)} - ${weekEnd.toISOString().slice(5, 10)}`
}

export function DashboardPage() {
  const { applications, appFiles } = useApplications()
  const { files } = useFiles()
  const { cvEffectiveness, upcoming } = useStats()

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState(nowIsoDate())

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      if (fromDate && application.applied_date < fromDate) {
        return false
      }

      if (toDate && application.applied_date > toDate) {
        return false
      }

      return true
    })
  }, [applications, fromDate, toDate])

  const metrics = useMemo(() => computeDashboardMetrics(filteredApplications), [filteredApplications])

  const overTimeData = useMemo(() => {
    if (filteredApplications.length === 0) {
      return []
    }

    const dates = filteredApplications.map((application) => parseISO(application.applied_date))
    const start = new Date(Math.min(...dates.map((date) => date.getTime())))
    const end = new Date(Math.max(...dates.map((date) => date.getTime())))
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })

    return weeks.map((week) => {
      const label = weekLabel(week)
      const count = filteredApplications.filter((application) => weekLabel(parseISO(application.applied_date)) === label).length

      return {
        week: label,
        count,
      }
    })
  }, [filteredApplications])

  const statusData = useMemo(() => {
    const rows = Object.entries(STATUS_LABELS).map(([status, label]) => ({
      name: label,
      value: filteredApplications.filter((application) => application.status === status).length,
      color:
        status === 'sent'
          ? '#8C919D'
          : status === 'interview'
            ? '#3B6FD4'
            : status === 'waiting'
              ? '#D4900A'
              : status === 'offer'
                ? '#1D8A56'
                : '#C93B3B',
    }))

    return rows
  }, [filteredApplications])

  const funnel = useMemo(() => {
    const sent = filteredApplications.length
    const interview = filteredApplications.filter((application) => application.status === 'interview').length
    const offer = filteredApplications.filter((application) => application.status === 'offer').length

    return { sent, interview, offer }
  }, [filteredApplications])

  const cvData = useMemo(() => {
    return cvEffectiveness.map((item) => {
      const usageCount = appFiles.filter((link) => link.file_id === item.fileId).length
      const file = files.find((entry) => entry.file_id === item.fileId)

      return {
        ...item,
        fileName: file?.file_name || item.fileName,
        usageCount,
      }
    })
  }, [appFiles, cvEffectiveness, files])

  const dominantStatus = useMemo(() => {
    const sorted = [...statusData].sort((a, b) => b.value - a.value)
    return sorted[0]
  }, [statusData])

  const activeProcesses = filteredApplications.filter((application) => ['sent', 'waiting', 'interview'].includes(application.status)).length

  return (
    <section className="cv-dashboard-page page-enter">
      <section className="cv-card cv-dashboard-hero">
        <div className="cv-dashboard-hero-header">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Centrum aplikacji</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Śledź postęp rekrutacji, skuteczność dokumentów i tempo odpowiedzi firm.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input className="cv-input" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <input className="cv-input" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
        </div>

        <div className="cv-dashboard-kpi-pills">
          <span className="cv-dashboard-kpi-pill">
            <MailCheck size={14} />
            Odpowiedzi <strong>{metrics.responseRate}%</strong>
          </span>
          <span className="cv-dashboard-kpi-pill">
            <Clock3 size={14} />
            Średni czas <strong>{metrics.avgResponseDays} dni</strong>
          </span>
          <span className="cv-dashboard-kpi-pill">
            <BarChart3 size={14} />
            Aktywne procesy <strong>{activeProcesses}</strong>
          </span>
          <span className="cv-dashboard-kpi-pill">
            <Sparkles size={14} />
            Dominujący status <strong>{dominantStatus?.name || 'Brak danych'}</strong>
          </span>
        </div>
      </section>

      <StatsCards metrics={metrics} />

      <div className="cv-dashboard-main-grid">
        <div className="cv-dashboard-main-column">
          <ApplicationsOverTimeChart data={overTimeData} />
          <CvEffectivenessChart data={cvData} />
        </div>

        <div className="cv-dashboard-side-column">
          <UpcomingEvents events={upcoming} />
          <StatusDistributionChart data={statusData} />
          <AvgResponseTime avgDays={metrics.avgResponseDays} />
        </div>
      </div>

      <div className="cv-dashboard-bottom-grid">
        <ConversionFunnel sent={funnel.sent} interview={funnel.interview} offer={funnel.offer} />

        <section className="cv-card" style={{ display: 'grid', gap: 14 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Szybkie insighty</h3>

          <div className="cv-card-nested" style={{ display: 'grid', gap: 6 }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Najmocniejszy status</p>
            <p style={{ fontWeight: 600 }}>{dominantStatus?.name || 'Brak danych'}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Aktualnie {dominantStatus?.value ?? 0} rekordów jest w tym statusie.
            </p>
          </div>

          <div className="cv-card-nested" style={{ display: 'grid', gap: 6 }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Tempo odpowiedzi</p>
            <p style={{ fontWeight: 600 }}>
              {metrics.avgResponseDays <= 7 ? 'Bardzo dobre' : metrics.avgResponseDays <= 14 ? 'Stabilne' : 'Wymaga poprawy'}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Średnio {metrics.avgResponseDays} dni do odpowiedzi od pracodawcy.
            </p>
          </div>

          <div className="cv-card-nested" style={{ display: 'grid', gap: 6 }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Kierunek działania</p>
            <p style={{ fontWeight: 600 }}>
              {funnel.sent > 0 && funnel.interview === 0
                ? 'Wzmocnij CV i follow-up'
                : funnel.offer > 0
                  ? 'Kontynuuj obecną strategię'
                  : 'Utrzymaj rytm aplikowania'}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Aktualny lejek: {funnel.sent} wysłanych / {funnel.interview} rozmów / {funnel.offer} ofert.
            </p>
          </div>
        </section>
      </div>
    </section>
  )
}
