import { useDataStore } from './dataStore'
import { useShallow } from 'zustand/react/shallow'

export function useApplicationsStore() {
  return useDataStore(
    useShallow((state) => ({
      applications: state.applications,
      appFiles: state.appFiles,
      appRecruiters: state.appRecruiters,
      appSteps: state.appSteps,
      isLoading: state.isLoading,
      createApplication: state.createApplication,
      updateApplication: state.updateApplication,
      deleteApplication: state.deleteApplication,
      createAppFile: state.createAppFile,
      deleteAppFile: state.deleteAppFile,
      createAppRecruiter: state.createAppRecruiter,
      deleteAppRecruiter: state.deleteAppRecruiter,
      createAppStep: state.createAppStep,
      updateAppStep: state.updateAppStep,
      deleteAppStep: state.deleteAppStep,
    })),
  )
}
