export type ApplicationViewMode = 'kanban' | 'table' | 'timeline'

interface ViewSwitcherProps {
  mode: ApplicationViewMode
  onChange: (mode: ApplicationViewMode) => void
}

export function ViewSwitcher({ mode, onChange }: ViewSwitcherProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        className={`cv-btn ${mode === 'kanban' ? 'cv-btn-primary' : 'cv-btn-secondary'}`}
        onClick={() => onChange('kanban')}
      >
        Kanban
      </button>
      <button
        type="button"
        className={`cv-btn ${mode === 'table' ? 'cv-btn-primary' : 'cv-btn-secondary'}`}
        onClick={() => onChange('table')}
      >
        Tabela
      </button>
      <button
        type="button"
        className={`cv-btn ${mode === 'timeline' ? 'cv-btn-primary' : 'cv-btn-secondary'}`}
        onClick={() => onChange('timeline')}
      >
        Timeline
      </button>
    </div>
  )
}
