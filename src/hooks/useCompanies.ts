import { useCompaniesStore } from '../store/companiesStore'

export function useCompanies() {
  return useCompaniesStore()
}
