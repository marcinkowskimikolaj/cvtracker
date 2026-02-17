import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApplications } from '../../hooks/useApplications'
import { useCompanies } from '../../hooks/useCompanies'
import { useRecruiters } from '../../hooks/useRecruiters'
import { useToastStore } from '../../store/toastStore'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { RecruiterForm } from './RecruiterForm'

export function RecruiterList() {
  const { recruiters, deleteRecruiter } = useRecruiters()
  const { companies } = useCompanies()
  const { appRecruiters } = useApplications()
  const pushToast = useToastStore((state) => state.push)

  const [search, setSearch] = useState('')
  const [editingRowNumber, setEditingRowNumber] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteRowNumber, setDeleteRowNumber] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    if (!normalized) {
      return recruiters
    }

    return recruiters.filter((recruiter) => {
      const fullName = `${recruiter.first_name} ${recruiter.last_name}`.toLowerCase()
      return (
        fullName.includes(normalized) ||
        recruiter.email.toLowerCase().includes(normalized) ||
        recruiter.phone.toLowerCase().includes(normalized)
      )
    })
  }, [recruiters, search])

  const linkedAppsCount = useMemo(() => {
    const map = new Map<string, number>()

    appRecruiters.forEach((link) => {
      map.set(link.recruiter_id, (map.get(link.recruiter_id) || 0) + 1)
    })

    return map
  }, [appRecruiters])

  const editingRecruiter = recruiters.find((item) => item.__rowNumber === editingRowNumber) || null

  async function handleDelete(): Promise<void> {
    if (deleteRowNumber === null) {
      return
    }

    try {
      await deleteRecruiter(deleteRowNumber)
      pushToast({ title: 'Rekruter został usunięty.', variant: 'success' })
      setDeleteRowNumber(null)
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się usunąć rekrutera.',
        variant: 'error',
      })
    }
  }

  return (
    <section className="cv-card page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Rekruterzy</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Lista kontaktów rekrutacyjnych.</p>
        </div>
        <button className="cv-btn cv-btn-primary" type="button" onClick={() => setShowForm(true)}>
          Dodaj rekrutera
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <input
          className="cv-input"
          placeholder="Szukaj po imieniu, nazwisku, emailu..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Brak rekruterów"
          description="Dodaj pierwszego rekrutera, aby łączyć go z aplikacjami."
          actionLabel="Dodaj rekrutera"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div style={{ marginTop: 16 }}>
          <table className="cv-table">
            <thead>
              <tr>
                <th>Imię</th>
                <th>Nazwisko</th>
                <th>Firma</th>
                <th>Email</th>
                <th>Liczba aplikacji</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((recruiter) => {
                const company = companies.find((item) => item.company_id === recruiter.company_id)

                return (
                  <tr key={recruiter.recruiter_id}>
                    <td>
                      <Link
                        to={`/rekruterzy/${recruiter.recruiter_id}`}
                        style={{ color: 'var(--text-primary)', fontWeight: 500 }}
                      >
                        {recruiter.first_name}
                      </Link>
                    </td>
                    <td>{recruiter.last_name}</td>
                    <td>{company?.name || '-'}</td>
                    <td>{recruiter.email || '-'}</td>
                    <td>{linkedAppsCount.get(recruiter.recruiter_id) || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="cv-btn cv-btn-secondary"
                          type="button"
                          onClick={() => {
                            setEditingRowNumber(recruiter.__rowNumber)
                            setShowForm(true)
                          }}
                        >
                          Edytuj
                        </button>
                        <button className="cv-btn cv-btn-danger" type="button" onClick={() => setDeleteRowNumber(recruiter.__rowNumber)}>
                          Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <RecruiterForm
        open={showForm}
        editingRecruiter={editingRecruiter}
        onClose={() => {
          setShowForm(false)
          setEditingRowNumber(null)
        }}
      />

      <ConfirmDialog
        open={deleteRowNumber !== null}
        title="Usunąć rekrutera?"
        description="Relacje aplikacji-rekruter pozostaną i warto je wyczyścić ręcznie."
        confirmLabel="Usuń"
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteRowNumber(null)}
      />
    </section>
  )
}
