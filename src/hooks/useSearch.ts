import { useShallow } from 'zustand/react/shallow'
import { useSearchStore } from '../store/searchStore'

export function useSearch() {
  return useSearchStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      query: state.query,
      activeIndex: state.activeIndex,
      open: state.open,
      close: state.close,
      setQuery: state.setQuery,
      setActiveIndex: state.setActiveIndex,
    })),
  )
}
