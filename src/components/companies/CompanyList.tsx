import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApplications } from '../../hooks/useApplications'
import { useCompanies } from '../../hooks/useCompanies'
import { useToastStore } from '../../store/toastStore'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { CompanyForm } from './CompanyForm'

export function CompanyList() {
  const { companies, deleteCompany } = useCompanies()
  const { applications } = useApplications()
  const pushToast = useToastStore((state) => state.push)

  const [search, setSearch] = useState('')
  const [editingRowNumber, setEditingRowNumber] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteRowNumber, setDeleteRowNumber] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return companies
    }

    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(normalized) || company.industry.toLowerCase().includes(normalized),
    )
  }, [companies, search])

  const appsByCompany = useMemo(() => {
    const map = new Map<string, number>()

    applications.forEach((application) => {
      map.set(application.company_id, (map.get(application.company_id) || 0) + 1)
    })

    return map
  }, [applications])

  const editingCompany = companies.find((company) => company.__rowNumber === editingRowNumber) || null

  async function handleDelete(): Promise<void> {
    if (deleteRowNumber === null) {
      return
    }

    try {
      await deleteCompany(deleteRowNumber)
      pushToast({ title: 'Firma została usunięta.', variant: 'success' })
      setDeleteRowNumber(null)
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się usunąć firmy.',
        variant: 'error',
      })
    }
  }

  return (
    <section className="cv-card page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Firmy</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Baza firm i ich danych kontaktowych.</p>
        </div>
        <button className="cv-btn cv-btn-primary" type="button" onClick={() => setShowForm(true)}>
          Dodaj firmę
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <input
          className="cv-input"
          placeholder="Szukaj firmy lub branży..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Brak firm"
          description="Dodaj pierwszą firmę, aby przypisywać do niej aplikacje i rekruterów."
          actionLabel="Dodaj firmę"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div style={{ marginTop: 16 }}>
          <table className="cv-table">
            <thead>
              <tr>
                <th>Nazwa</th>
                <th>Branża</th>
                <th>Liczba aplikacji</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => (
                <tr key={company.company_id}>
                  <td>
                    <Link to={`/firmy/${company.company_id}`} style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {company.name}
                    </Link>
                  </td>
                  <td>{company.industry || '-'}</td>
                  <td>{appsByCompany.get(company.company_id) || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="cv-btn cv-btn-secondary"
                        type="button"
                        onClick={() => {
                          setEditingRowNumber(company.__rowNumber)
                          setShowForm(true)
                        }}
                      >
                        Edytuj
                      </button>
                      <button className="cv-btn cv-btn-danger" type="button" onClick={() => setDeleteRowNumber(company.__rowNumber)}>
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CompanyForm
        open={showForm}
        editingCompany={editingCompany}
        onClose={() => {
          setShowForm(false)
          setEditingRowNumber(null)
        }}
      />

      <ConfirmDialog
        open={deleteRowNumber !== null}
        title="Usunąć firmę?"
        description="Powiązane aplikacje pozostaną w arkuszu i trzeba je przepiąć ręcznie."
        confirmLabel="Usuń"
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteRowNumber(null)}
      />
    </section>
  )
}
