import { useApplicationsStore } from '../store/applicationsStore'

export function useApplications() {
  return useApplicationsStore()
}
