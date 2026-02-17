import { useMemo } from 'react'
import { computeCvEffectiveness, computeDashboardMetrics, upcomingEvents } from '../services/data/statsService'
import { useDataStore } from '../store/dataStore'

export function useStats() {
  const applications = useDataStore((state) => state.applications)
  const files = useDataStore((state) => state.files)
  const appFiles = useDataStore((state) => state.appFiles)
  const calendarEvents = useDataStore((state) => state.calendarEvents)

  return useMemo(() => {
    const metrics = computeDashboardMetrics(applications)
    const cvEffectiveness = computeCvEffectiveness(files, applications, appFiles)
    const upcoming = upcomingEvents(calendarEvents)

    return {
      metrics,
      cvEffectiveness,
      upcoming,
    }
  }, [applications, appFiles, calendarEvents, files])
}
