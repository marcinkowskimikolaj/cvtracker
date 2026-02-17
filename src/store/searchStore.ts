import { create } from 'zustand'

interface SearchState {
  isOpen: boolean
  query: string
  activeIndex: number
  open: () => void
  close: () => void
  setQuery: (value: string) => void
  setActiveIndex: (index: number) => void
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: '',
  activeIndex: 0,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: '', activeIndex: 0 }),
  setQuery: (value) => set({ query: value, activeIndex: 0 }),
  setActiveIndex: (index) => set({ activeIndex: index }),
}))
