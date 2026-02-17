import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { useProfile } from './useProfile'
import { REFRESH_INTERVAL_MS } from '../utils/constants'
import { useDataStore } from '../store/dataStore'

export function useDataBootstrap() {
  const { user, isConfigLoaded } = useAuth()
  const { activeProfile } = useProfile()
  const loadAll = useDataStore((state) => state.loadAll)

  useEffect(() => {
    if (!user || !isConfigLoaded) {
      return
    }

    void loadAll()
  }, [activeProfile, isConfigLoaded, loadAll, user])

  useEffect(() => {
    if (!user || !isConfigLoaded) {
      return
    }

    const timer = window.setInterval(() => {
      void loadAll()
    }, REFRESH_INTERVAL_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [isConfigLoaded, loadAll, user])
}
