import type { FileType } from '../../types'
import { FILE_TYPE_LABELS } from '../../utils/constants'

interface FileTypeFilterProps {
  activeType: FileType | 'all'
  onChange: (value: FileType | 'all') => void
}

const options: Array<FileType | 'all'> = ['all', 'cv', 'cover_letter', 'recommendation', 'reference_letter', 'other']

export function FileTypeFilter({ activeType, onChange }: FileTypeFilterProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`cv-btn cv-btn-pill ${activeType === option ? 'cv-btn-primary' : 'cv-btn-secondary'}`}
          onClick={() => onChange(option)}
        >
          {option === 'all' ? 'Wszystkie' : FILE_TYPE_LABELS[option]}
        </button>
      ))}
    </div>
  )
}
