import { useDataStore } from './dataStore'

export function useFilesStore() {
  return useDataStore((state) => ({
    files: state.files,
    isLoading: state.isLoading,
    createFile: state.createFile,
    updateFile: state.updateFile,
    deleteFile: state.deleteFile,
  }))
}
