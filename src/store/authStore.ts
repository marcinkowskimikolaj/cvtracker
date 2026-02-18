import { create } from 'zustand'
import { APP_CONFIG } from '../config'
import { ensureProfileEmails, fetchConfigValues } from '../services/data/configService'
import * as googleAuth from '../services/google/auth'
import { useProfileStore } from './profileStore'
import { useToastStore } from './toastStore'
import type { AuthUser, ConfigValues } from '../types'

const AUTH_SESSION_KEY = 'cvtracker_auth_session'

type AllowedEmail = (typeof APP_CONFIG.allowedEmails)[number]

interface StoredAuthSession {
  user: AuthUser
  accessToken: string
  tokenExpiresAt: number
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  tokenExpiresAt: number | null
  isLoading: boolean
  isRestoring: boolean
  error: string | null
  config: ConfigValues
  isConfigLoaded: boolean
  login: () => Promise<void>
  restoreSession: () => Promise<void>
  logout: () => void
  clearError: () => void
}

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined'
}

function saveStoredSession(session: StoredAuthSession): void {
  if (!canUseSessionStorage()) {
    return
  }

  window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

function readStoredSession(): StoredAuthSession | null {
  if (!canUseSessionStorage()) {
    return null
  }

  const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>
    if (
      !parsed ||
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.tokenExpiresAt !== 'number' ||
      !parsed.user ||
      typeof parsed.user.email !== 'string' ||
      typeof parsed.user.name !== 'string'
    ) {
      return null
    }

    return {
      accessToken: parsed.accessToken,
      tokenExpiresAt: parsed.tokenExpiresAt,
      user: {
        email: parsed.user.email,
        name: parsed.user.name,
        picture: parsed.user.picture,
      },
    }
  } catch {
    return null
  }
}

function clearStoredSession(): void {
  if (!canUseSessionStorage()) {
    return
  }

  window.sessionStorage.removeItem(AUTH_SESSION_KEY)
}

function isAllowedEmail(email: string): boolean {
  return APP_CONFIG.allowedEmails.includes(email as AllowedEmail)
}

async function loadConfigWithEnsure(accessToken: string): Promise<ConfigValues> {
  try {
    return await ensureProfileEmails(accessToken)
  } catch (error) {
    useToastStore.getState().push({
      title:
        error instanceof Error
          ? `Nie udało się uzupełnić PROFILE_EMAIL_* w _Config: ${error.message}`
          : 'Nie udało się uzupełnić PROFILE_EMAIL_* w _Config.',
      variant: 'error',
    })
    return fetchConfigValues(accessToken)
  }
}

function resolveAndSetProfile(userEmail: string, config: ConfigValues): void {
  const resolution = useProfileStore.getState().resolveProfileFromEmail(userEmail, config)

  if (resolution.usedFallback) {
    useToastStore.getState().push({
      title: 'Nie znaleziono dopasowania e-mail do profilu. Ustawiono domyślnie profil Mikołaj.',
      variant: 'info',
    })
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  tokenExpiresAt: null,
  isLoading: false,
  isRestoring: true,
  error: null,
  config: {},
  isConfigLoaded: false,
  login: async () => {
    set({ isLoading: true, error: null })

    try {
      const session = await googleAuth.login()
      const email = session.email.toLowerCase()
      const isAllowed = isAllowedEmail(email)

      if (!isAllowed) {
        googleAuth.logout(session.accessToken)
        throw new Error('Ten adres e-mail nie ma dostępu do aplikacji CV Tracker.')
      }

      const config = await loadConfigWithEnsure(session.accessToken)
      const tokenExpiresAt = Date.now() + Math.max(3600, session.expiresInSeconds) * 1000

      const user: AuthUser = {
        email,
        name: session.name,
        picture: session.picture,
      }

      resolveAndSetProfile(user.email, config)

      saveStoredSession({
        user,
        accessToken: session.accessToken,
        tokenExpiresAt,
      })

      set({
        user,
        accessToken: session.accessToken,
        tokenExpiresAt,
        config,
        isConfigLoaded: true,
        isLoading: false,
        isRestoring: false,
      })
    } catch (error) {
      clearStoredSession()
      set({
        user: null,
        accessToken: null,
        tokenExpiresAt: null,
        config: {},
        isConfigLoaded: false,
        isLoading: false,
        isRestoring: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd logowania.',
      })
    }
  },
  restoreSession: async () => {
    const state = get()

    if (!state.isRestoring) {
      return
    }

    const stored = readStoredSession()

    if (!stored) {
      set({ isRestoring: false })
      return
    }

    if (stored.tokenExpiresAt <= Date.now()) {
      clearStoredSession()
      set({
        user: null,
        accessToken: null,
        tokenExpiresAt: null,
        config: {},
        isConfigLoaded: false,
        isRestoring: false,
      })
      return
    }

    if (!isAllowedEmail(stored.user.email.toLowerCase())) {
      clearStoredSession()
      set({
        user: null,
        accessToken: null,
        tokenExpiresAt: null,
        config: {},
        isConfigLoaded: false,
        isRestoring: false,
        error: 'Ten adres e-mail nie ma dostępu do aplikacji CV Tracker.',
      })
      return
    }

    try {
      const config = await loadConfigWithEnsure(stored.accessToken)
      resolveAndSetProfile(stored.user.email, config)

      set({
        user: stored.user,
        accessToken: stored.accessToken,
        tokenExpiresAt: stored.tokenExpiresAt,
        config,
        isConfigLoaded: true,
        isRestoring: false,
        error: null,
      })
    } catch {
      googleAuth.logout(stored.accessToken)
      clearStoredSession()
      set({
        user: null,
        accessToken: null,
        tokenExpiresAt: null,
        config: {},
        isConfigLoaded: false,
        isRestoring: false,
        error: null,
      })
    }
  },
  logout: () => {
    const token = get().accessToken
    googleAuth.logout(token ?? undefined)
    clearStoredSession()
    useProfileStore.getState().clearProfileOverride()
    set({
      user: null,
      accessToken: null,
      tokenExpiresAt: null,
      config: {},
      isConfigLoaded: false,
      isRestoring: false,
      error: null,
    })
  },
  clearError: () => set({ error: null }),
}))
