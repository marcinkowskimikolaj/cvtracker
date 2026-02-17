import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      accessToken: state.accessToken,
      isLoading: state.isLoading,
      error: state.error,
      config: state.config,
      isConfigLoaded: state.isConfigLoaded,
      login: state.login,
      logout: state.logout,
      clearError: state.clearError,
    })),
  )
}
