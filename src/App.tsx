import { Suspense, lazy, useEffect, type ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastViewport } from './components/common/ToastViewport'
import { Layout } from './components/layout/Layout'
import { useAuth } from './hooks/useAuth'
import { useDataBootstrap } from './hooks/useDataBootstrap'
import { LoginPage } from './pages/LoginPage'

const CHUNK_RELOAD_SESSION_KEY = 'cvtracker_chunk_reload_attempted'

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('importing a module script failed')
  )
}

function reloadWithCacheBuster(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  if (window.sessionStorage.getItem(CHUNK_RELOAD_SESSION_KEY) === '1') {
    return false
  }

  window.sessionStorage.setItem(CHUNK_RELOAD_SESSION_KEY, '1')
  const url = new URL(window.location.href)
  url.searchParams.set('reload', Date.now().toString())
  window.location.replace(url.toString())
  return true
}

function lazyWithRetry<T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const module = await importer()
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(CHUNK_RELOAD_SESSION_KEY)
      }
      return module
    } catch (error) {
      if (isChunkLoadError(error) && reloadWithCacheBuster()) {
        return new Promise<never>(() => {})
      }

      throw error
    }
  })
}

const DashboardPage = lazyWithRetry(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const ApplicationsPage = lazyWithRetry(() => import('./pages/ApplicationsPage').then((module) => ({ default: module.ApplicationsPage })))
const ApplicationDetailPage = lazyWithRetry(() =>
  import('./pages/ApplicationDetailPage').then((module) => ({ default: module.ApplicationDetailPage })),
)
const CompaniesPage = lazyWithRetry(() => import('./pages/CompaniesPage').then((module) => ({ default: module.CompaniesPage })))
const CompanyDetailPage = lazyWithRetry(() =>
  import('./pages/CompanyDetailPage').then((module) => ({ default: module.CompanyDetailPage })),
)
const RecruitersPage = lazyWithRetry(() => import('./pages/RecruitersPage').then((module) => ({ default: module.RecruitersPage })))
const RecruiterDetailPage = lazyWithRetry(() =>
  import('./pages/RecruiterDetailPage').then((module) => ({ default: module.RecruiterDetailPage })),
)
const FilesPage = lazyWithRetry(() => import('./pages/FilesPage').then((module) => ({ default: module.FilesPage })))
const CalendarPage = lazyWithRetry(() => import('./pages/CalendarPage').then((module) => ({ default: module.CalendarPage })))

function PageFallback() {
  return (
    <div className="cv-card">
      <div className="cv-skeleton cv-skeleton-card" />
    </div>
  )
}

function ProtectedApp() {
  const { user } = useAuth()
  useDataBootstrap()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<PageFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/aplikacje"
          element={
            <Suspense fallback={<PageFallback />}>
              <ApplicationsPage />
            </Suspense>
          }
        />
        <Route
          path="/aplikacje/:appId"
          element={
            <Suspense fallback={<PageFallback />}>
              <ApplicationDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/firmy"
          element={
            <Suspense fallback={<PageFallback />}>
              <CompaniesPage />
            </Suspense>
          }
        />
        <Route
          path="/firmy/:companyId"
          element={
            <Suspense fallback={<PageFallback />}>
              <CompanyDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/rekruterzy"
          element={
            <Suspense fallback={<PageFallback />}>
              <RecruitersPage />
            </Suspense>
          }
        />
        <Route
          path="/rekruterzy/:recruiterId"
          element={
            <Suspense fallback={<PageFallback />}>
              <RecruiterDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/pliki"
          element={
            <Suspense fallback={<PageFallback />}>
              <FilesPage />
            </Suspense>
          }
        />
        <Route
          path="/kalendarz"
          element={
            <Suspense fallback={<PageFallback />}>
              <CalendarPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const { user, isRestoring, restoreSession } = useAuth()

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  if (isRestoring) {
    return (
      <div style={{ minHeight: '100vh', padding: 24 }}>
        <PageFallback />
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
      <ToastViewport />
    </>
  )
}
