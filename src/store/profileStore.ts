import { create } from 'zustand'
import type { ConfigValues, ProfileId } from '../types'

const PROFILE_OVERRIDE_SESSION_KEY = 'cvtracker_profile_override'

interface ProfileResolution {
  profile: ProfileId
  usedFallback: boolean
}

interface ProfileState {
  activeProfile: ProfileId
  resolveProfileFromEmail: (email: string, config: ConfigValues) => ProfileResolution
  setActiveProfile: (profile: ProfileId) => void
  clearProfileOverride: () => void
}

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined'
}

function setDocumentProfile(profile: ProfileId): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-profile', profile)
  }
}

function readStoredOverride(): ProfileId | null {
  if (!canUseSessionStorage()) {
    return null
  }

  const raw = window.sessionStorage.getItem(PROFILE_OVERRIDE_SESSION_KEY)
  return raw === 'mikolaj' || raw === 'emilka' ? raw : null
}

function storeOverride(profile: ProfileId): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(PROFILE_OVERRIDE_SESSION_KEY, profile)
  }
}

function clearStoredOverride(): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(PROFILE_OVERRIDE_SESSION_KEY)
  }
}

function resolveByConfigEmail(email: string, config: ConfigValues): ProfileResolution {
  const normalizedEmail = email.trim().toLowerCase()
  const mikolajEmail = config.PROFILE_EMAIL_mikolaj?.trim().toLowerCase()
  const emilkaEmail = config.PROFILE_EMAIL_emilka?.trim().toLowerCase()

  if (normalizedEmail && normalizedEmail === mikolajEmail) {
    return { profile: 'mikolaj', usedFallback: false }
  }

  if (normalizedEmail && normalizedEmail === emilkaEmail) {
    return { profile: 'emilka', usedFallback: false }
  }

  return { profile: 'mikolaj', usedFallback: true }
}

const initialProfile = readStoredOverride() ?? 'mikolaj'
setDocumentProfile(initialProfile)

export const useProfileStore = create<ProfileState>((set) => ({
  activeProfile: initialProfile,
  resolveProfileFromEmail: (email, config) => {
    const override = readStoredOverride()
    const resolution = override ? { profile: override, usedFallback: false } : resolveByConfigEmail(email, config)
    setDocumentProfile(resolution.profile)
    set({ activeProfile: resolution.profile })
    return resolution
  },
  setActiveProfile: (profile) => {
    storeOverride(profile)
    setDocumentProfile(profile)
    set({ activeProfile: profile })
  },
  clearProfileOverride: () => {
    clearStoredOverride()
  },
}))
