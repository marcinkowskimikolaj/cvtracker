export type ProfileId = 'mikolaj' | 'emilka'

export type FileType =
  | 'cv'
  | 'cover_letter'
  | 'recommendation'
  | 'reference_letter'
  | 'other'

export type ApplicationStatus =
  | 'sent'
  | 'interview'
  | 'waiting'
  | 'rejected'
  | 'offer'

export type Priority = 'normal' | 'high' | 'promising'

export type StepType =
  | 'screening'
  | 'phone_interview'
  | 'technical'
  | 'onsite'
  | 'hr_interview'
  | 'task'
  | 'offer'
  | 'other'

export type EventType =
  | 'interview'
  | 'preparation'
  | 'follow_up'
  | 'deadline'
  | 'other'

export interface AuthUser {
  email: string
  name: string
  picture?: string
}

export interface AppConfigEntry {
  key: string
  value: string
}

export interface ConfigValues {
  GOOGLE_MAPS_API_KEY?: string
  GOOGLE_DRIVE_FOLDER_ID?: string
  SPREADSHEET_ID?: string
  HOME_ADDRESS_MIKOLAJ?: string
  HOME_LAT_MIKOLAJ?: string
  HOME_LNG_MIKOLAJ?: string
  HOME_ADDRESS_EMILKA?: string
  HOME_LAT_EMILKA?: string
  HOME_LNG_EMILKA?: string
  [key: string]: string | undefined
}

export interface RowMeta {
  __rowNumber: number
}

export type SheetRecord<T> = T & RowMeta

export interface FileRecord {
  file_id: string
  profile_id: ProfileId
  file_name: string
  file_type: FileType
  drive_file_id: string
  drive_url: string
  description: string
  version_label: string
  created_at: string
}

export interface CompanyRecord {
  company_id: string
  profile_id: ProfileId
  name: string
  industry: string
  website: string
  careers_url: string
  linkedin_url: string
  address: string
  lat: number | null
  lng: number | null
  distance_km: number | null
  travel_time_min: number | null
  notes: string
  created_at: string
}

export interface RecruiterRecord {
  recruiter_id: string
  profile_id: ProfileId
  first_name: string
  last_name: string
  email: string
  phone: string
  linkedin_url: string
  company_id: string
  notes: string
  created_at: string
}

export interface ApplicationRecord {
  app_id: string
  profile_id: ProfileId
  company_id: string
  position_title: string
  position_url: string
  status: ApplicationStatus
  priority: Priority
  excitement_rating: number | null
  monthly_salary: number | null
  hourly_rate: number | null
  job_offer_file_id: string
  applied_date: string
  response_date: string
  role_description: string
  notes: string
  created_at: string
  updated_at: string
}

export interface AppFileRecord {
  app_id: string
  file_id: string
  attached_at: string
}

export interface AppRecruiterRecord {
  app_id: string
  recruiter_id: string
}

export interface AppStepRecord {
  step_id: string
  app_id: string
  step_type: StepType
  step_name: string
  step_date: string
  step_time: string
  step_notes: string
  google_calendar_event_id: string
  created_at: string
}

export interface CalendarEventRecord {
  event_id: string
  profile_id: ProfileId
  app_id: string
  title: string
  event_date: string
  event_time: string
  duration_minutes: number
  event_type: EventType
  google_calendar_event_id: string
  notes: string
  created_at: string
}

export interface DriveFolderValidation {
  rootExists: boolean
  missingFolders: string[]
}

export interface DistanceInfo {
  distanceKm: number
  travelTimeMin: number
}

export interface SelectOption {
  label: string
  value: string
}

export interface SearchResult {
  id: string
  label: string
  sublabel: string
  group: 'Firmy' | 'Aplikacje' | 'Rekruterzy' | 'Pliki'
  path: string
}

export interface DashboardMetrics {
  totalApplications: number
  totalInterviews: number
  totalOffers: number
  totalRejected: number
  responseRate: number
  avgResponseDays: number
}
