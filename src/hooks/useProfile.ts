import { useShallow } from 'zustand/react/shallow'
import { useProfileStore } from '../store/profileStore'

export function useProfile() {
  return useProfileStore(
    useShallow((state) => ({
      activeProfile: state.activeProfile,
      setActiveProfile: state.setActiveProfile,
    })),
  )
}
