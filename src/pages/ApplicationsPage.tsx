import { useMemo, useState } from 'react'
import { useApplications } from '../hooks/useApplications'
import { useCompanies } from '../hooks/useCompanies'
import { useToastStore } from '../store/toastStore'
import { nowIsoDateTime } from '../utils/dates'
import { ApplicationForm } from '../components/applications/ApplicationForm'
import { ApplicationTable } from '../components/applications/ApplicationTable'
import { ApplicationTimeline } from '../components/applications/ApplicationTimeline'
import { KanbanBoard } from '../components/applications/KanbanBoard'
import type { ApplicationStatus, Priority } from '../types'
import { ViewSwitcher, type ApplicationViewMode } from '../components/applications/ViewSwitcher'

export function ApplicationsPage() {
  const { applications, updateApplication } = useApplications()
  const { companies } = useCompanies()
  const pushToast = useToastStore((state) => state.push)

  const [viewMode, setViewMode] = useState<ApplicationViewMode>('table')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [showForm, setShowForm] = useState(false)

  const filtered = useMemo(
    () =>
      applications.filter((application) => {
        if (statusFilter !== 'all' && application.status !== statusFilter) {
          return false
        }

        if (priorityFilter !== 'all' && application.priority !== priorityFilter) {
          return false
        }

        return true
      }),
    [applications, priorityFilter, statusFilter],
  )

  async function handleStatusChange(appId: string, status: ApplicationStatus): Promise<void> {
    const application = applications.find((item) => item.app_id === appId)

    if (!application || application.status === status) {
      return
    }

    try {
      await updateApplication({
        ...application,
        status,
        updated_at: nowIsoDateTime(),
      })
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się zmienić statusu aplikacji.',
        variant: 'error',
      })
    }
  }

  return (
    <section className="cv-card page-enter" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Aplikacje</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Śledzenie procesu aplikacji i etapów rekrutacji.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <ViewSwitcher mode={viewMode} onChange={setViewMode} />
          <button className="cv-btn cv-btn-primary" type="button" onClick={() => setShowForm(true)}>
            Nowa aplikacja
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select className="cv-input cv-select" style={{ width: 220 }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ApplicationStatus | 'all')}>
          <option value="all">Wszystkie statusy</option>
          <option value="sent">Wysłano</option>
          <option value="interview">Rozmowa</option>
          <option value="waiting">Oczekuję</option>
          <option value="offer">Oferta</option>
          <option value="rejected">Odrzucone</option>
        </select>

        <select className="cv-input cv-select" style={{ width: 220 }} value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as Priority | 'all')}>
          <option value="all">Wszystkie priorytety</option>
          <option value="normal">Normalny</option>
          <option value="high">Wysoki</option>
          <option value="promising">Rokujący</option>
        </select>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard applications={filtered} onStatusChange={(appId, status) => void handleStatusChange(appId, status)} />
      ) : null}

      {viewMode === 'table' ? <ApplicationTable applications={filtered} companies={companies} /> : null}

      {viewMode === 'timeline' ? <ApplicationTimeline applications={filtered} companies={companies} /> : null}

      <ApplicationForm open={showForm} editingApplication={null} onClose={() => setShowForm(false)} />
    </section>
  )
}
