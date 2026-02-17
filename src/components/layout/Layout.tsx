import { Outlet } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { useSearchStore } from '../../store/searchStore'
import { SearchPalette } from '../common/SearchPalette'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function Layout() {
  const refreshAll = useDataStore((state) => state.refreshAll)
  const isRefreshing = useDataStore((state) => state.isRefreshing)
  const lastSyncAt = useDataStore((state) => state.lastSyncAt)
  const driveValidation = useDataStore((state) => state.driveValidation)
  const openSearch = useSearchStore((state) => state.open)

  return (
    <div className="cv-premium-app">
      <Sidebar />
      <Topbar
        onOpenSearch={openSearch}
        onRefresh={() => void refreshAll()}
        isRefreshing={isRefreshing}
        lastSyncAt={lastSyncAt}
      />

      <main className="cv-premium-content">
        <div className="cv-premium-content-inner page-enter">
          {driveValidation && driveValidation.missingFolders.length > 0 ? (
            <div className="cv-toast cv-premium-drive-alert" style={{ marginBottom: 14 }}>
              <span>Brakuje folderów na Google Drive: {driveValidation.missingFolders.join(', ')}.</span>
            </div>
          ) : null}
          <Outlet />
        </div>
      </main>

      <SearchPalette />
    </div>
  )
}
