import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastViewport } from './components/common/ToastViewport'
import { Layout } from './components/layout/Layout'
import { useAuth } from './hooks/useAuth'
import { useDataBootstrap } from './hooks/useDataBootstrap'
import { LoginPage } from './pages/LoginPage'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage').then((module) => ({ default: module.ApplicationsPage })))
const ApplicationDetailPage = lazy(() =>
  import('./pages/ApplicationDetailPage').then((module) => ({ default: module.ApplicationDetailPage })),
)
const CompaniesPage = lazy(() => import('./pages/CompaniesPage').then((module) => ({ default: module.CompaniesPage })))
const CompanyDetailPage = lazy(() =>
  import('./pages/CompanyDetailPage').then((module) => ({ default: module.CompanyDetailPage })),
)
const RecruitersPage = lazy(() => import('./pages/RecruitersPage').then((module) => ({ default: module.RecruitersPage })))
const RecruiterDetailPage = lazy(() =>
  import('./pages/RecruiterDetailPage').then((module) => ({ default: module.RecruiterDetailPage })),
)
const FilesPage = lazy(() => import('./pages/FilesPage').then((module) => ({ default: module.FilesPage })))
const CalendarPage = lazy(() => import('./pages/CalendarPage').then((module) => ({ default: module.CalendarPage })))

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
  const { user } = useAuth()

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
