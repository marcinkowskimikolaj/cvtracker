import { LogOut, RefreshCw, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { PROFILE_OPTIONS } from '../../utils/constants'
import { formatDateTime } from '../../utils/dates'
import { ProfileSwitcher } from './ProfileSwitcher'

interface TopbarProps {
  onOpenSearch: () => void
  onRefresh: () => void
  isRefreshing: boolean
  lastSyncAt: string | null
}

export function Topbar({ onOpenSearch, onRefresh, isRefreshing, lastSyncAt }: TopbarProps) {
  const { logout, user } = useAuth()
  const { activeProfile } = useProfile()

  const profileLabel = PROFILE_OPTIONS.find((profile) => profile.id === activeProfile)?.label ?? 'Profil'

  return (
    <header className="cv-topbar">
      <div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Aktywny profil</p>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{profileLabel}</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          Ostatnia synchronizacja: {lastSyncAt ? formatDateTime(lastSyncAt) : '-'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="cv-btn cv-btn-secondary cv-btn-pill" type="button" onClick={onOpenSearch}>
          <Search size={16} />
          <span>Szukaj (Ctrl+K)</span>
        </button>

        <button
          className="cv-btn cv-btn-secondary cv-btn-pill"
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Odświeżanie...' : 'Odśwież dane'}</span>
        </button>

        <ProfileSwitcher />

        <div className="cv-avatar cv-avatar-mikolaj" title={user?.email}>
          {user?.name?.slice(0, 1) ?? 'U'}
        </div>

        <button className="cv-btn cv-btn-ghost cv-btn-icon" type="button" onClick={logout} aria-label="Wyloguj">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
