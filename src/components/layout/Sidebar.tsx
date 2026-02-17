import {
  Briefcase,
  Building2,
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/aplikacje', icon: Briefcase, label: 'Aplikacje' },
  { to: '/firmy', icon: Building2, label: 'Firmy' },
  { to: '/rekruterzy', icon: Users, label: 'Rekruterzy' },
  { to: '/pliki', icon: FolderOpen, label: 'Pliki' },
  { to: '/kalendarz', icon: CalendarDays, label: 'Kalendarz' },
]

export function Sidebar() {
  return (
    <aside className="cv-sidebar">
      <div style={{ padding: '20px 16px', marginBottom: 8 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>CV Tracker</h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
