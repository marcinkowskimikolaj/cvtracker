import { useDataStore } from './dataStore'

export function useCompaniesStore() {
  return useDataStore((state) => ({
    companies: state.companies,
    isLoading: state.isLoading,
    createCompany: state.createCompany,
    updateCompany: state.updateCompany,
    deleteCompany: state.deleteCompany,
  }))
}
