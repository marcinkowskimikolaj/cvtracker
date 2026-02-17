import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ApplicationRecord, SheetRecord } from '../../types'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  applications: Array<SheetRecord<ApplicationRecord>>
  onStatusChange: (appId: string, status: ApplicationRecord['status']) => void
}

const columns: ApplicationRecord['status'][] = ['sent', 'interview', 'waiting', 'offer', 'rejected']

export function KanbanBoard({ applications, onStatusChange }: KanbanBoardProps) {
  const navigate = useNavigate()

  const grouped = useMemo(() => {
    const map = new Map<ApplicationRecord['status'], Array<SheetRecord<ApplicationRecord>>>()
    columns.forEach((status) => map.set(status, []))

    applications.forEach((application) => {
      const bucket = map.get(application.status)
      if (bucket) {
        bucket.push(application)
      }
    })

    return map
  }, [applications])

  function handleDragEnd(event: DragEndEvent): void {
    const draggedId = String(event.active.id)
    const overStatus = event.over?.id as ApplicationRecord['status'] | undefined

    if (!overStatus || !columns.includes(overStatus)) {
      return
    }

    onStatusChange(draggedId, overStatus)
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {columns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={grouped.get(status) || []}
            onOpen={(appId) => navigate(`/aplikacje/${appId}`)}
          />
        ))}
      </div>
    </DndContext>
  )
}
