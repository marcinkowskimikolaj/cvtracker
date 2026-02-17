import { create } from 'zustand'
import {
  createAppFile,
  deleteAppFileRecord,
  listAppFiles,
} from '../services/data/appFilesService'
import {
  createApplication,
  deleteApplicationRecord,
  listApplications,
  updateApplication,
} from '../services/data/applicationsService'
import {
  createAppRecruiter,
  deleteAppRecruiterRecord,
  listAppRecruiters,
} from '../services/data/appRecruitersService'
import {
  createAppStep,
  deleteAppStepRecord,
  listAppSteps,
  updateAppStep,
} from '../services/data/appStepsService'
import {
  createCalendarEvent,
  deleteCalendarEventRecord,
  listCalendarEvents,
  updateCalendarEvent,
} from '../services/data/calendarEventsService'
import {
  createCompany,
  deleteCompanyRecord,
  listCompanies,
  updateCompany,
} from '../services/data/companiesService'
import {
  createFile,
  deleteFileRecord,
  listFiles,
  updateFile,
} from '../services/data/filesService'
import {
  createRecruiter,
  deleteRecruiterRecord,
  listRecruiters,
  updateRecruiter,
} from '../services/data/recruitersService'
import type { ServiceContext } from '../services/data/context'
import { insertEvent } from '../services/google/calendar'
import { validateDriveStructure } from '../services/google/drive'
import { useAuthStore } from './authStore'
import { useProfileStore } from './profileStore'
import { useToastStore } from './toastStore'
import type {
  AppFileRecord,
  ApplicationRecord,
  AppRecruiterRecord,
  AppStepRecord,
  CalendarEventRecord,
  CompanyRecord,
  DriveFolderValidation,
  FileRecord,
  RecruiterRecord,
  SheetRecord,
} from '../types'

interface DataStoreState {
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastSyncAt: string | null
  driveValidation: DriveFolderValidation | null
  files: Array<SheetRecord<FileRecord>>
  companies: Array<SheetRecord<CompanyRecord>>
  recruiters: Array<SheetRecord<RecruiterRecord>>
  applications: Array<SheetRecord<ApplicationRecord>>
  appFiles: Array<SheetRecord<AppFileRecord>>
  appRecruiters: Array<SheetRecord<AppRecruiterRecord>>
  appSteps: Array<SheetRecord<AppStepRecord>>
  calendarEvents: Array<SheetRecord<CalendarEventRecord>>
  loadAll: () => Promise<void>
  refreshAll: () => Promise<void>
  createFile: (record: FileRecord) => Promise<void>
  updateFile: (record: SheetRecord<FileRecord>) => Promise<void>
  deleteFile: (rowNumber: number) => Promise<void>
  createCompany: (record: CompanyRecord) => Promise<void>
  updateCompany: (record: SheetRecord<CompanyRecord>) => Promise<void>
  deleteCompany: (rowNumber: number) => Promise<void>
  createRecruiter: (record: RecruiterRecord) => Promise<void>
  updateRecruiter: (record: SheetRecord<RecruiterRecord>) => Promise<void>
  deleteRecruiter: (rowNumber: number) => Promise<void>
  createApplication: (record: ApplicationRecord) => Promise<void>
  updateApplication: (record: SheetRecord<ApplicationRecord>) => Promise<void>
  deleteApplication: (rowNumber: number) => Promise<void>
  createAppFile: (record: AppFileRecord) => Promise<void>
  deleteAppFile: (rowNumber: number) => Promise<void>
  createAppRecruiter: (record: AppRecruiterRecord) => Promise<void>
  deleteAppRecruiter: (rowNumber: number) => Promise<void>
  createAppStep: (record: AppStepRecord) => Promise<void>
  updateAppStep: (record: SheetRecord<AppStepRecord>) => Promise<void>
  deleteAppStep: (rowNumber: number) => Promise<void>
  createCalendarEvent: (record: CalendarEventRecord) => Promise<void>
  updateCalendarEvent: (record: SheetRecord<CalendarEventRecord>) => Promise<void>
  deleteCalendarEvent: (rowNumber: number) => Promise<void>
  exportEventToGoogleCalendar: (event: SheetRecord<CalendarEventRecord>) => Promise<string>
}

function requireServiceContext(): ServiceContext {
  const authState = useAuthStore.getState()
  const profileState = useProfileStore.getState()

  if (!authState.accessToken) {
    throw new Error('Brak aktywnej sesji Google.')
  }

  return {
    accessToken: authState.accessToken,
    profileId: profileState.activeProfile,
    config: authState.config,
  }
}

function reportError(message: string): void {
  useToastStore.getState().push({
    title: message,
    variant: 'error',
  })
}

function reportSuccess(message: string): void {
  useToastStore.getState().push({
    title: message,
    variant: 'success',
  })
}

async function optimisticMutation<T>(
  getSnapshot: () => T,
  rollback: (snapshot: T) => void,
  action: () => Promise<void>,
): Promise<void> {
  const snapshot = getSnapshot()
  try {
    await action()
  } catch (error) {
    rollback(snapshot)
    throw error
  }
}

async function fetchAllData(context: ServiceContext): Promise<{
  files: Array<SheetRecord<FileRecord>>
  companies: Array<SheetRecord<CompanyRecord>>
  recruiters: Array<SheetRecord<RecruiterRecord>>
  applications: Array<SheetRecord<ApplicationRecord>>
  appFiles: Array<SheetRecord<AppFileRecord>>
  appRecruiters: Array<SheetRecord<AppRecruiterRecord>>
  appSteps: Array<SheetRecord<AppStepRecord>>
  calendarEvents: Array<SheetRecord<CalendarEventRecord>>
  driveValidation: DriveFolderValidation | null
}> {
  const [
    files,
    companies,
    recruiters,
    applications,
    appFilesRaw,
    appRecruitersRaw,
    appStepsRaw,
    calendarEvents,
  ] = await Promise.all([
    listFiles(context),
    listCompanies(context),
    listRecruiters(context),
    listApplications(context),
    listAppFiles(context),
    listAppRecruiters(context),
    listAppSteps(context),
    listCalendarEvents(context),
  ])

  const appIds = new Set(applications.map((application) => application.app_id))

  const appFiles = appFilesRaw.filter((link) => appIds.has(link.app_id))
  const appRecruiters = appRecruitersRaw.filter((link) => appIds.has(link.app_id))
  const appSteps = appStepsRaw.filter((step) => appIds.has(step.app_id))

  let driveValidation: DriveFolderValidation | null = null
  if (context.config.GOOGLE_DRIVE_FOLDER_ID) {
    try {
      driveValidation = await validateDriveStructure(
        context.accessToken,
        context.config.GOOGLE_DRIVE_FOLDER_ID,
      )
    } catch {
      driveValidation = {
        rootExists: false,
        missingFolders: ['Nie udało się zweryfikować struktury folderów Drive.'],
      }
    }
  }

  return {
    files,
    companies,
    recruiters,
    applications,
    appFiles,
    appRecruiters,
    appSteps,
    calendarEvents,
    driveValidation,
  }
}

export const useDataStore = create<DataStoreState>((set, get) => ({
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastSyncAt: null,
  driveValidation: null,
  files: [],
  companies: [],
  recruiters: [],
  applications: [],
  appFiles: [],
  appRecruiters: [],
  appSteps: [],
  calendarEvents: [],
  loadAll: async () => {
    set({ isLoading: true, error: null })

    try {
      const context = requireServiceContext()
      const result = await fetchAllData(context)

      set({
        ...result,
        isLoading: false,
        isRefreshing: false,
        lastSyncAt: new Date().toISOString(),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nie udało się załadować danych.'
      set({ isLoading: false, isRefreshing: false, error: message })
      reportError(message)
    }
  },
  refreshAll: async () => {
    set({ isRefreshing: true })

    try {
      const context = requireServiceContext()
      const result = await fetchAllData(context)

      set({
        ...result,
        isRefreshing: false,
        error: null,
        lastSyncAt: new Date().toISOString(),
      })
      reportSuccess('Dane zostały odświeżone.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nie udało się odświeżyć danych.'
      set({ isRefreshing: false, error: message })
      reportError(message)
    }
  },
  createFile: async (record) => {
    const tempRecord: SheetRecord<FileRecord> = { ...record, __rowNumber: -Date.now() }
    set((state) => ({ files: [tempRecord, ...state.files] }))

    try {
      await createFile(requireServiceContext(), record)
      await get().loadAll()
    } catch (error) {
      set((state) => ({ files: state.files.filter((item) => item.__rowNumber !== tempRecord.__rowNumber) }))
      reportError(error instanceof Error ? error.message : 'Nie udało się dodać pliku.')
      throw error
    }
  },
  updateFile: async (record) => {
    await optimisticMutation(
      () => get().files,
      (snapshot) => set({ files: snapshot }),
      async () => {
        set((state) => ({
          files: state.files.map((item) => (item.__rowNumber === record.__rowNumber ? record : item)),
        }))

        await updateFile(requireServiceContext(), record.__rowNumber, record)
      },
    )
  },
  deleteFile: async (rowNumber) => {
    await optimisticMutation(
      () => get().files,
      (snapshot) => set({ files: snapshot }),
      async () => {
        set((state) => ({ files: state.files.filter((item) => item.__rowNumber !== rowNumber) }))
        await deleteFileRecord(requireServiceContext(), rowNumber)
      },
    )
  },
  createCompany: async (record) => {
    const tempRecord: SheetRecord<CompanyRecord> = { ...record, __rowNumber: -Date.now() }
    set((state) => ({ companies: [tempRecord, ...state.companies] }))

    try {
      await createCompany(requireServiceContext(), record)
      await get().loadAll()
    } catch (error) {
      set((state) => ({
        companies: state.companies.filter((item) => item.__rowNumber !== tempRecord.__rowNumber),
      }))
      reportError(error instanceof Error ? error.message : 'Nie udało się dodać firmy.')
      throw error
    }
  },
  updateCompany: async (record) => {
    await optimisticMutation(
      () => get().companies,
      (snapshot) => set({ companies: snapshot }),
      async () => {
        set((state) => ({
          companies: state.companies.map((item) => (item.__rowNumber === record.__rowNumber ? record : item)),
        }))

        await updateCompany(requireServiceContext(), record.__rowNumber, record)
      },
    )
  },
  deleteCompany: async (rowNumber) => {
    await optimisticMutation(
      () => get().companies,
      (snapshot) => set({ companies: snapshot }),
      async () => {
        set((state) => ({ companies: state.companies.filter((item) => item.__rowNumber !== rowNumber) }))
        await deleteCompanyRecord(requireServiceContext(), rowNumber)
      },
    )
  },
  createRecruiter: async (record) => {
    const tempRecord: SheetRecord<RecruiterRecord> = { ...record, __rowNumber: -Date.now() }
    set((state) => ({ recruiters: [tempRecord, ...state.recruiters] }))

    try {
      await createRecruiter(requireServiceContext(), record)
      await get().loadAll()
    } catch (error) {
      set((state) => ({
        recruiters: state.recruiters.filter((item) => item.__rowNumber !== tempRecord.__rowNumber),
      }))
      reportError(error instanceof Error ? error.message : 'Nie udało się dodać rekrutera.')
      throw error
    }
  },
  updateRecruiter: async (record) => {
    await optimisticMutation(
      () => get().recruiters,
      (snapshot) => set({ recruiters: snapshot }),
      async () => {
        set((state) => ({
          recruiters: state.recruiters.map((item) => (item.__rowNumber === record.__rowNumber ? record : item)),
        }))

        await updateRecruiter(requireServiceContext(), record.__rowNumber, record)
      },
    )
  },
  deleteRecruiter: async (rowNumber) => {
    await optimisticMutation(
      () => get().recruiters,
      (snapshot) => set({ recruiters: snapshot }),
      async () => {
        set((state) => ({ recruiters: state.recruiters.filter((item) => item.__rowNumber !== rowNumber) }))
        await deleteRecruiterRecord(requireServiceContext(), rowNumber)
      },
    )
  },
  createApplication: async (record) => {
    const tempRecord: SheetRecord<ApplicationRecord> = { ...record, __rowNumber: -Date.now() }
    set((state) => ({ applications: [tempRecord, ...state.applications] }))

    try {
      await createApplication(requireServiceContext(), record)
      await get().loadAll()
    } catch (error) {
      set((state) => ({
        applications: state.applications.filter((item) => item.__rowNumber !== tempRecord.__rowNumber),
      }))
      reportError(error instanceof Error ? error.message : 'Nie udało się dodać aplikacji.')
      throw error
    }
  },
  updateApplication: async (record) => {
    await optimisticMutation(
      () => get().applications,
      (snapshot) => set({ applications: snapshot }),
      async () => {
        set((state) => ({
          applications: state.applications.map((item) =>
            item.__rowNumber === record.__rowNumber ? record : item,
          ),
        }))

        await updateApplication(requireServiceContext(), record.__rowNumber, record)
      },
    )
  },
  deleteApplication: async (rowNumber) => {
    await optimisticMutation(
      () => get().applications,
      (snapshot) => set({ applications: snapshot }),
      async () => {
        set((state) => ({ applications: state.applications.filter((item) => item.__rowNumber !== rowNumber) }))
        await deleteApplicationRecord(requireServiceContext(), rowNumber)
      },
    )
  },
  createAppFile: async (record) => {
    const tempRecord: SheetRecord<AppFileRecord> = { ...record, __rowNumber: -Date.now() }
    set((state) => ({ appFiles: [tempRecord, ...state.appFiles] }))

    try {
      await createAppFile(requireServiceContext(), record)
      await get().loadAll()
    } catch (error) {
      set((state) => ({
        appFiles: state.appFiles.filter((item) => item.__rowNumber !== tempRecord.__rowNumber),
      }))
      reportError(error instanceof Error ? error.message : 'Nie udało się podpiąć pliku.')
      throw error
    }
  },
  deleteAppFile: async (rowNumber) => {
    await optimisticMutation(
      () => get().appFiles,
      (snapshot) => set({ appFiles: snapshot }),
      async () => {
        set((state) => ({ appFiles: state.appFiles.filter((item) => item.__rowNumber !== rowNumber) }))
        await deleteAppFileRecord(requireServiceContext(), rowNumber)
      },
    )
  },
  createAppRecruiter: async (record) => {
    const tempRecord: SheetRecord<AppRecruiterRecord> = { ...record, __rowNumber: -Date.now() }
    set((state) => ({ appRecruiters: [tempRecord, ...state.appRecruiters] }))

    try {
      await createAppRecruiter(requireServiceContext(), record)
      await get().loadAll()
    } catch (error) {
      set((state) => ({
        appRecruiters: state.appRecruiters.filter((item) => item.__rowNumber !== tempRecord.__rowNumber),
      }))
      reportError(error instanceof Error ? error.message : 'Nie udało się podpiąć rekrutera.')
      throw error
    }
  },
  deleteAppRecruiter: async (rowNumber) => {
    await optimisticMutation(
      () => get().appRecruiters,
      (snapshot) => set({ appRecruiters: snapshot }),
      async () => {
        set((state) => ({
          appRecruiters: state.appRecruiters.filter((item) => item.__rowNumber !== rowNumber),
        }))
        await deleteAppRecruiterRecord(requireServiceContext(), rowNumber)
      },
    )
  },
  createAppStep: async (record) => {
    const tempRecord: SheetRecord<AppStepRecord> = { ...record, __rowNumber: -Date.now() }
    set((state) => ({ appSteps: [tempRecord, ...state.appSteps] }))

    try {
      await createAppStep(requireServiceContext(), record)
      await get().loadAll()
    } catch (error) {
      set((state) => ({
        appSteps: state.appSteps.filter((item) => item.__rowNumber !== tempRecord.__rowNumber),
      }))
      reportError(error instanceof Error ? error.message : 'Nie udało się dodać kroku rekrutacji.')
      throw error
    }
  },
  updateAppStep: async (record) => {
    await optimisticMutation(
      () => get().appSteps,
      (snapshot) => set({ appSteps: snapshot }),
      async () => {
        set((state) => ({
          appSteps: state.appSteps.map((item) => (item.__rowNumber === record.__rowNumber ? record : item)),
        }))

        await updateAppStep(requireServiceContext(), record.__rowNumber, record)
      },
    )
  },
  deleteAppStep: async (rowNumber) => {
    await optimisticMutation(
      () => get().appSteps,
      (snapshot) => set({ appSteps: snapshot }),
      async () => {
        set((state) => ({ appSteps: state.appSteps.filter((item) => item.__rowNumber !== rowNumber) }))
        await deleteAppStepRecord(requireServiceContext(), rowNumber)
      },
    )
  },
  createCalendarEvent: async (record) => {
    const tempRecord: SheetRecord<CalendarEventRecord> = { ...record, __rowNumber: -Date.now() }
    set((state) => ({ calendarEvents: [tempRecord, ...state.calendarEvents] }))

    try {
      await createCalendarEvent(requireServiceContext(), record)
      await get().loadAll()
    } catch (error) {
      set((state) => ({
        calendarEvents: state.calendarEvents.filter((item) => item.__rowNumber !== tempRecord.__rowNumber),
      }))
      reportError(error instanceof Error ? error.message : 'Nie udało się dodać wydarzenia.')
      throw error
    }
  },
  updateCalendarEvent: async (record) => {
    await optimisticMutation(
      () => get().calendarEvents,
      (snapshot) => set({ calendarEvents: snapshot }),
      async () => {
        set((state) => ({
          calendarEvents: state.calendarEvents.map((item) =>
            item.__rowNumber === record.__rowNumber ? record : item,
          ),
        }))

        await updateCalendarEvent(requireServiceContext(), record.__rowNumber, record)
      },
    )
  },
  deleteCalendarEvent: async (rowNumber) => {
    await optimisticMutation(
      () => get().calendarEvents,
      (snapshot) => set({ calendarEvents: snapshot }),
      async () => {
        set((state) => ({
          calendarEvents: state.calendarEvents.filter((item) => item.__rowNumber !== rowNumber),
        }))
        await deleteCalendarEventRecord(requireServiceContext(), rowNumber)
      },
    )
  },
  exportEventToGoogleCalendar: async (event) => {
    const context = requireServiceContext()

    const startDateTime = `${event.event_date}T${event.event_time || '09:00'}:00`
    const endDate = new Date(startDateTime)
    endDate.setMinutes(endDate.getMinutes() + (event.duration_minutes || 60))

    const result = await insertEvent({
      accessToken: context.accessToken,
      event: {
        title: event.title,
        description: event.notes,
        startDateTime,
        endDateTime: endDate.toISOString(),
      },
    })

    return result.googleCalendarEventId
  },
}))
