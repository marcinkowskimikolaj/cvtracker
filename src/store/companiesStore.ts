import { useDataStore } from './dataStore'
import { useShallow } from 'zustand/react/shallow'

export function useCompaniesStore() {
  return useDataStore(
    useShallow((state) => ({
      companies: state.companies,
      isLoading: state.isLoading,
      createCompany: state.createCompany,
      updateCompany: state.updateCompany,
      deleteCompany: state.deleteCompany,
    })),
  )
}
