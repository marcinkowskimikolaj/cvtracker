import { create } from 'zustand'
import { APP_CONFIG } from '../config'
import { fetchConfigValues } from '../services/data/configService'
import * as googleAuth from '../services/google/auth'
import type { AuthUser, ConfigValues } from '../types'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
  config: ConfigValues
  isConfigLoaded: boolean
  login: () => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  config: {},
  isConfigLoaded: false,
  login: async () => {
    set({ isLoading: true, error: null })

    try {
      const session = await googleAuth.login()
      const isAllowed = APP_CONFIG.allowedEmails.includes(session.email as (typeof APP_CONFIG.allowedEmails)[number])

      if (!isAllowed) {
        googleAuth.logout(session.accessToken)
        throw new Error('Ten adres e-mail nie ma dostępu do aplikacji CV Tracker.')
      }

      const config = await fetchConfigValues(session.accessToken)

      set({
        user: {
          email: session.email,
          name: session.name,
          picture: session.picture,
        },
        accessToken: session.accessToken,
        config,
        isConfigLoaded: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        user: null,
        accessToken: null,
        config: {},
        isConfigLoaded: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd logowania.',
      })
    }
  },
  logout: () => {
    const token = get().accessToken
    googleAuth.logout(token ?? undefined)
    set({
      user: null,
      accessToken: null,
      config: {},
      isConfigLoaded: false,
      error: null,
    })
  },
  clearError: () => set({ error: null }),
}))
