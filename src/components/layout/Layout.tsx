import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { SearchPalette } from '../common/SearchPalette'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const refreshAll = useDataStore((state) => state.refreshAll)
  const isRefreshing = useDataStore((state) => state.isRefreshing)
  const lastSyncAt = useDataStore((state) => state.lastSyncAt)
  const driveValidation = useDataStore((state) => state.driveValidation)

  return (
    <div>
      <Sidebar />
      <Topbar
        onOpenSearch={() => setSearchOpen(true)}
        onRefresh={() => void refreshAll()}
        isRefreshing={isRefreshing}
        lastSyncAt={lastSyncAt}
      />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          padding: 'calc(var(--topbar-height) + 20px) var(--content-padding) var(--content-padding)',
          minHeight: '100vh',
        }}
      >
        {driveValidation && driveValidation.missingFolders.length > 0 ? (
          <div className="cv-toast" style={{ marginBottom: 16 }}>
            <span>
              Brakuje folderów na Google Drive: {driveValidation.missingFolders.join(', ')}.
            </span>
          </div>
        ) : null}
        <Outlet />
      </main>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
