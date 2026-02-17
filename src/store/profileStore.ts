import { create } from 'zustand'
import type { ProfileId } from '../types'

interface ProfileState {
  activeProfile: ProfileId
  setActiveProfile: (profile: ProfileId) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  activeProfile: 'mikolaj',
  setActiveProfile: (profile) => {
    document.documentElement.setAttribute('data-profile', profile)
    set({ activeProfile: profile })
  },
}))
