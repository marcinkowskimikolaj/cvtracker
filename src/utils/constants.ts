import type {
  ApplicationStatus,
  EventType,
  FileType,
  Priority,
  ProfileId,
  SeniorityLevel,
  StepType,
  WorkMode,
} from '../types'

export const PROFILE_OPTIONS: Array<{ id: ProfileId; label: string }> = [
  { id: 'mikolaj', label: 'Mikołaj' },
  { id: 'emilka', label: 'Emilka' },
]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  sent: 'Wysłano',
  interview: 'Rozmowa',
  waiting: 'Oczekuję',
  rejected: 'Odrzucone',
  offer: 'Oferta',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  normal: 'Normalny',
  high: 'Wysoki',
  promising: 'Rokujący',
}

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  intern: 'Praktykant/Staż',
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
  lead: 'Lead',
  manager: 'Manager',
  unknown: 'Nie określono',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Zdalna',
  hybrid: 'Hybrydowa',
  onsite: 'Stacjonarna',
  unknown: 'Nie określono',
}

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  cv: 'CV',
  cover_letter: 'List motywacyjny',
  recommendation: 'Rekomendacja',
  reference_letter: 'List polecający',
  other: 'Inne',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  interview: 'Rozmowa',
  preparation: 'Przygotowanie',
  follow_up: 'Follow-up',
  deadline: 'Deadline',
  other: 'Inne',
}

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  screening: 'Screening',
  phone_interview: 'Rozmowa telefoniczna',
  technical: 'Rozmowa techniczna',
  onsite: 'Spotkanie onsite',
  hr_interview: 'Rozmowa HR',
  task: 'Zadanie',
  offer: 'Oferta',
  other: 'Inne',
}

export const SHEET_NAMES = {
  config: '_Config',
  files: 'Files',
  companies: 'Companies',
  recruiters: 'Recruiters',
  applications: 'Applications',
  appFiles: 'AppFiles',
  appRecruiters: 'AppRecruiters',
  appSteps: 'AppSteps',
  calendarEvents: 'CalendarEvents',
} as const

export const REFRESH_INTERVAL_MS = 5 * 60 * 1000
