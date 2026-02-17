import { useDataStore } from './dataStore'
import { useShallow } from 'zustand/react/shallow'

export function useFilesStore() {
  return useDataStore(
    useShallow((state) => ({
      files: state.files,
      isLoading: state.isLoading,
      createFile: state.createFile,
      updateFile: state.updateFile,
      deleteFile: state.deleteFile,
    })),
  )
}
