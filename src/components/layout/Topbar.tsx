import { LogOut, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { PROFILE_OPTIONS } from '../../utils/constants'
import { ProfileSwitcher } from './ProfileSwitcher'

interface TopbarProps {
  onOpenSearch: () => void
}

export function Topbar({ onOpenSearch }: TopbarProps) {
  const { logout, user } = useAuth()
  const { activeProfile } = useProfile()

  const profileLabel = PROFILE_OPTIONS.find((profile) => profile.id === activeProfile)?.label ?? 'Profil'

  return (
    <header className="cv-topbar">
      <div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Aktywny profil</p>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{profileLabel}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="cv-btn cv-btn-secondary cv-btn-pill" type="button" onClick={onOpenSearch}>
          <Search size={16} />
          <span>Szukaj (Ctrl+K)</span>
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
