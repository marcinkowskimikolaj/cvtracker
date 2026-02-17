import { create } from 'zustand'
import { generateId } from '../utils/uuid'

export type ToastVariant = 'info' | 'error' | 'success'

export interface ToastMessage {
  id: string
  title: string
  variant: ToastVariant
}

interface ToastState {
  toasts: ToastMessage[]
  push: (toast: Omit<ToastMessage, 'id'>) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = generateId()
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }))

    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
    }, 4000)
  },
  remove: (id) => {
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
  },
}))
