import { useDataStore } from './dataStore'

export function useCalendarStore() {
  return useDataStore((state) => ({
    calendarEvents: state.calendarEvents,
    appSteps: state.appSteps,
    isLoading: state.isLoading,
    createCalendarEvent: state.createCalendarEvent,
    updateCalendarEvent: state.updateCalendarEvent,
    deleteCalendarEvent: state.deleteCalendarEvent,
    exportEventToGoogleCalendar: state.exportEventToGoogleCalendar,
  }))
}
