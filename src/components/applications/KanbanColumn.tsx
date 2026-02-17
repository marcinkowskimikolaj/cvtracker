import { useDroppable } from '@dnd-kit/core'
import type { ApplicationRecord, SheetRecord } from '../../types'
import { STATUS_LABELS } from '../../utils/constants'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  status: ApplicationRecord['status']
  items: Array<SheetRecord<ApplicationRecord>>
  onOpen: (appId: string) => void
}

export function KanbanColumn({ status, items, onOpen }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  })

  return (
    <section
      ref={setNodeRef}
      className="cv-kanban-column"
      style={{ background: isOver ? 'var(--accent-light)' : undefined, transition: 'all var(--transition-fast)' }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{STATUS_LABELS[status]}</h3>
        <span className="cv-badge-count">{items.length}</span>
      </header>

      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((application) => (
          <KanbanCard key={application.app_id} application={application} onOpen={() => onOpen(application.app_id)} />
        ))}
      </div>
    </section>
  )
}
