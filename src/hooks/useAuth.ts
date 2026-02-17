import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      accessToken: state.accessToken,
      tokenExpiresAt: state.tokenExpiresAt,
      isLoading: state.isLoading,
      isRestoring: state.isRestoring,
      error: state.error,
      config: state.config,
      isConfigLoaded: state.isConfigLoaded,
      login: state.login,
      restoreSession: state.restoreSession,
      logout: state.logout,
      clearError: state.clearError,
    })),
  )
}
