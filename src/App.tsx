import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { useAuth } from './hooks/useAuth'
import { ApplicationDetailPage } from './pages/ApplicationDetailPage'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { CalendarPage } from './pages/CalendarPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { CompanyDetailPage } from './pages/CompanyDetailPage'
import { DashboardPage } from './pages/DashboardPage'
import { FilesPage } from './pages/FilesPage'
import { LoginPage } from './pages/LoginPage'
import { RecruiterDetailPage } from './pages/RecruiterDetailPage'
import { RecruitersPage } from './pages/RecruitersPage'

function ProtectedApp() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/aplikacje" element={<ApplicationsPage />} />
        <Route path="/aplikacje/:appId" element={<ApplicationDetailPage />} />
        <Route path="/firmy" element={<CompaniesPage />} />
        <Route path="/firmy/:companyId" element={<CompanyDetailPage />} />
        <Route path="/rekruterzy" element={<RecruitersPage />} />
        <Route path="/rekruterzy/:recruiterId" element={<RecruiterDetailPage />} />
        <Route path="/pliki" element={<FilesPage />} />
        <Route path="/kalendarz" element={<CalendarPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  )
}
