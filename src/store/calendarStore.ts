import { useDataStore } from './dataStore'
import { useShallow } from 'zustand/react/shallow'

export function useCalendarStore() {
  return useDataStore(
    useShallow((state) => ({
      calendarEvents: state.calendarEvents,
      appSteps: state.appSteps,
      isLoading: state.isLoading,
      createCalendarEvent: state.createCalendarEvent,
      updateCalendarEvent: state.updateCalendarEvent,
      deleteCalendarEvent: state.deleteCalendarEvent,
      exportEventToGoogleCalendar: state.exportEventToGoogleCalendar,
    })),
  )
}
