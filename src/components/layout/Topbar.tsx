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
  const avatarClass = activeProfile === 'emilka' ? 'cv-avatar cv-avatar-emilka' : 'cv-avatar cv-avatar-mikolaj'

  return (
    <header className="cv-topbar cv-premium-topbar">
      <div className="cv-premium-topbar-left">
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Centrum pracy</p>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Profil: {profileLabel}</h2>
      </div>

      <div className="cv-premium-topbar-right">
        <button className="cv-btn cv-premium-topbar-search" type="button" onClick={onOpenSearch}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Search size={15} />
            <span>Wyszukaj firmę, aplikację lub plik</span>
          </span>
          <kbd>Ctrl+K</kbd>
        </button>

        <button
          className="cv-btn cv-btn-secondary cv-btn-pill"
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title={lastSyncAt ? `Ostatnia synchronizacja: ${formatDateTime(lastSyncAt)}` : 'Brak synchronizacji'}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Odświeżanie...' : 'Odśwież'}</span>
        </button>

        <ProfileSwitcher />

        <div className={avatarClass} title={user?.email}>
          {user?.name?.slice(0, 1) ?? 'U'}
        </div>

        <button className="cv-btn cv-btn-ghost cv-btn-icon" type="button" onClick={logout} aria-label="Wyloguj">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
