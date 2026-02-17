import { useDataStore } from './dataStore'

export function useRecruitersStore() {
  return useDataStore((state) => ({
    recruiters: state.recruiters,
    isLoading: state.isLoading,
    createRecruiter: state.createRecruiter,
    updateRecruiter: state.updateRecruiter,
    deleteRecruiter: state.deleteRecruiter,
  }))
}
