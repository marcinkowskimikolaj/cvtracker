import { useFilesStore } from '../store/filesStore'

export function useFiles() {
  return useFilesStore()
}
