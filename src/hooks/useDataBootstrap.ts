import { useEffect } from 'react'
import { REFRESH_INTERVAL_MS } from '../utils/constants'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import { useProfileStore } from '../store/profileStore'

export function useDataBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isConfigLoaded = useAuthStore((state) => state.isConfigLoaded)
  const activeProfile = useProfileStore((state) => state.activeProfile)
  const loadAll = useDataStore((state) => state.loadAll)

  useEffect(() => {
    if (!accessToken || !isConfigLoaded) {
      return
    }

    void loadAll()
  }, [accessToken, activeProfile, isConfigLoaded, loadAll])

  useEffect(() => {
    if (!accessToken || !isConfigLoaded) {
      return
    }

    const timer = window.setInterval(() => {
      void loadAll()
    }, REFRESH_INTERVAL_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [accessToken, isConfigLoaded, loadAll])
}
