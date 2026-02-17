import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SearchPalette } from '../common/SearchPalette'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div>
      <Sidebar />
      <Topbar onOpenSearch={() => setSearchOpen(true)} />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          padding: 'calc(var(--topbar-height) + 20px) var(--content-padding) var(--content-padding)',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </main>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
