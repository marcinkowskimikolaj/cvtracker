import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ApplicationRecord, SheetRecord } from '../../types'
import { formatDate } from '../../utils/dates'
import { PriorityIndicator } from '../common/PriorityIndicator'

interface KanbanCardProps {
  application: SheetRecord<ApplicationRecord>
  onOpen: () => void
}

export function KanbanCard({ application, onOpen }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.app_id,
    data: { status: application.status },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    border:
      application.priority === 'high'
        ? '1px solid #C93B3B'
        : application.priority === 'promising'
          ? '1px solid #1D8A56'
          : '1px solid transparent',
  }

  return (
    <article
      ref={setNodeRef}
      className="cv-kanban-card"
      style={style}
      {...listeners}
      {...attributes}
      onDoubleClick={onOpen}
    >
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{formatDate(application.applied_date)}</p>
      <h4 style={{ fontWeight: 600 }}>{application.position_title}</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Kliknij 2x, aby otworzyć</p>
      <div style={{ marginTop: 8 }}>
        <PriorityIndicator priority={application.priority} />
      </div>
    </article>
  )
}
