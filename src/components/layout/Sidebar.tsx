import {
  Briefcase,
  Building2,
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useProfile } from '../../hooks/useProfile'
import { PROFILE_OPTIONS } from '../../utils/constants'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/aplikacje', icon: Briefcase, label: 'Aplikacje' },
  { to: '/firmy', icon: Building2, label: 'Firmy' },
  { to: '/pliki', icon: FolderOpen, label: 'Pliki' },
  { to: '/kalendarz', icon: CalendarDays, label: 'Kalendarz' },
]

export function Sidebar() {
  const { activeProfile } = useProfile()
  const profileLabel = PROFILE_OPTIONS.find((profile) => profile.id === activeProfile)?.label ?? 'Profil'

  return (
    <aside className="cv-sidebar cv-premium-sidebar">
      <div className="cv-premium-brand">
        <div className="cv-premium-brand-icon" aria-hidden="true">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="cv-premium-brand-title">CV Tracker</p>
          <p className="cv-premium-brand-subtitle">Panel rekrutacji</p>
        </div>
      </div>

      <nav className="cv-premium-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `cv-sidebar-nav-item${isActive ? ' cv-sidebar-nav-item-active' : ''}`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="cv-premium-sidebar-footer">
        <div className="cv-card-nested">
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Aktywny profil</p>
          <p style={{ fontWeight: 600 }}>{profileLabel}</p>
        </div>
      </div>
    </aside>
  )
}
