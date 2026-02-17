import { useDataStore } from './dataStore'
import { useShallow } from 'zustand/react/shallow'

export function useRecruitersStore() {
  return useDataStore(
    useShallow((state) => ({
      recruiters: state.recruiters,
      isLoading: state.isLoading,
      createRecruiter: state.createRecruiter,
      updateRecruiter: state.updateRecruiter,
      deleteRecruiter: state.deleteRecruiter,
    })),
  )
}
