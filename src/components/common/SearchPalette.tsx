import Fuse from 'fuse.js'
import { Building2, Briefcase, FileText, Users } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApplications } from '../../hooks/useApplications'
import { useCompanies } from '../../hooks/useCompanies'
import { useFiles } from '../../hooks/useFiles'
import { useRecruiters } from '../../hooks/useRecruiters'
import { useSearch } from '../../hooks/useSearch'
import type { SearchResult } from '../../types'

function getApplicationTimestamp(updatedAt: string, appliedDate: string): number {
  const updatedTimestamp = Date.parse(updatedAt)
  if (!Number.isNaN(updatedTimestamp)) {
    return updatedTimestamp
  }

  const appliedTimestamp = Date.parse(appliedDate)
  if (!Number.isNaN(appliedTimestamp)) {
    return appliedTimestamp
  }

  return 0
}

function iconForGroup(group: SearchResult['group']) {
  if (group === 'Firmy') {
    return <Building2 size={16} />
  }

  if (group === 'Aplikacje') {
    return <Briefcase size={16} />
  }

  if (group === 'Rekruterzy') {
    return <Users size={16} />
  }

  return <FileText size={16} />
}

export function SearchPalette() {
  const navigate = useNavigate()
  const { files } = useFiles()
  const { companies } = useCompanies()
  const { recruiters } = useRecruiters()
  const { applications, appRecruiters } = useApplications()
  const { isOpen, open, close, query, setQuery, activeIndex, setActiveIndex } = useSearch()

  const companiesById = useMemo(() => new Map(companies.map((company) => [company.company_id, company])), [companies])
  const applicationsById = useMemo(
    () => new Map(applications.map((application) => [application.app_id, application])),
    [applications],
  )

  const baseResults = useMemo<SearchResult[]>(() => {
    const companyResults: SearchResult[] = companies.map((company) => ({
      id: `company-${company.company_id}`,
      label: company.name,
      sublabel: company.industry,
      group: 'Firmy',
      path: `/firmy/${company.company_id}`,
    }))

    const appResults: SearchResult[] = applications.map((application) => {
      const company = companies.find((item) => item.company_id === application.company_id)
      return {
        id: `app-${application.app_id}`,
        label: application.position_title,
        sublabel: `${company?.name || 'Brak firmy'} • ${application.status}`,
        group: 'Aplikacje',
        path: `/aplikacje/${application.app_id}`,
      }
    })

    const recruiterResults: SearchResult[] = recruiters.map((recruiter) => {
      const relatedApps = appRecruiters
        .filter((relation) => relation.recruiter_id === recruiter.recruiter_id)
        .map((relation) => applicationsById.get(relation.app_id))
        .filter((application): application is (typeof applications)[number] => Boolean(application))

      const latestApplication = relatedApps.reduce<(typeof applications)[number] | null>((latest, current) => {
        if (!latest) {
          return current
        }

        const latestTimestamp = getApplicationTimestamp(latest.updated_at, latest.applied_date)
        const currentTimestamp = getApplicationTimestamp(current.updated_at, current.applied_date)

        return currentTimestamp > latestTimestamp ? current : latest
      }, null)

      const companyName = latestApplication
        ? companiesById.get(latestApplication.company_id)?.name || 'Brak firmy'
        : 'Brak powiązanej aplikacji'
      const contextLabel = latestApplication
        ? `${companyName} • ${latestApplication.position_title}`
        : 'Brak powiązanej aplikacji'

      return {
        id: `recruiter-${recruiter.recruiter_id}`,
        label: `${recruiter.first_name} ${recruiter.last_name}`,
        sublabel: recruiter.email ? `${recruiter.email} • ${contextLabel}` : contextLabel,
        group: 'Rekruterzy',
        path: latestApplication ? `/aplikacje/${latestApplication.app_id}` : '/aplikacje',
      }
    })

    const fileResults: SearchResult[] = files.map((file) => ({
      id: `file-${file.file_id}`,
      label: file.file_name,
      sublabel: file.version_label,
      group: 'Pliki',
      path: '/pliki',
    }))

    return [...companyResults, ...appResults, ...recruiterResults, ...fileResults]
  }, [appRecruiters, applications, applicationsById, companies, companiesById, files, recruiters])

  const fuse = useMemo(
    () =>
      new Fuse(baseResults, {
        keys: ['label', 'sublabel'],
        threshold: 0.34,
        includeScore: true,
      }),
    [baseResults],
  )

  const searchResults = useMemo(() => {
    const raw = query.trim()
    const items = raw ? fuse.search(raw).map((result) => result.item) : baseResults

    const grouped = new Map<SearchResult['group'], SearchResult[]>()

    items.forEach((item) => {
      const bucket = grouped.get(item.group) || []

      if (bucket.length < 5) {
        bucket.push(item)
      }

      grouped.set(item.group, bucket)
    })

    return grouped
  }, [baseResults, fuse, query])

  const flatResults = useMemo(() => {
    const list: SearchResult[] = []

    ;(['Firmy', 'Aplikacje', 'Rekruterzy', 'Pliki'] as const).forEach((group) => {
      const bucket = searchResults.get(group)
      if (bucket) {
        list.push(...bucket)
      }
    })

    return list
  }, [searchResults])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (isOpen) {
          close()
        } else {
          open()
        }
      }

      if (!isOpen) {
        return
      }

      if (event.key === 'Escape') {
        close()
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (flatResults.length > 0) {
          setActiveIndex((activeIndex + 1) % flatResults.length)
        }
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (flatResults.length > 0) {
          setActiveIndex((activeIndex - 1 + flatResults.length) % flatResults.length)
        }
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const active = flatResults[activeIndex]
        if (active) {
          navigate(active.path)
          close()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, close, flatResults, isOpen, navigate, open, setActiveIndex])

  if (!isOpen) {
    return null
  }

  let cursor = -1

  return (
    <div className="cv-overlay" role="dialog" aria-modal="true" onClick={close}>
      <div className="cv-command-palette" onClick={(event) => event.stopPropagation()}>
        <input
          className="cv-command-input"
          placeholder="Szukaj firmy, stanowiska, rekrutera, pliku..."
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
        />

        <div style={{ maxHeight: 420, overflow: 'auto' }}>
          {(['Firmy', 'Aplikacje', 'Rekruterzy', 'Pliki'] as const).map((group) => {
            const results = searchResults.get(group)

            if (!results || results.length === 0) {
              return null
            }

            return (
              <div key={group}>
                <div className="cv-command-group-label">{group}</div>
                {results.map((result) => {
                  cursor += 1
                  const currentIndex = cursor
                  const isActive = currentIndex === activeIndex

                  return (
                    <button
                      key={result.id}
                      type="button"
                      className="cv-command-item"
                      data-active={isActive}
                      style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                      onClick={() => {
                        navigate(result.path)
                        close()
                      }}
                    >
                      <span className="cv-command-item-icon">{iconForGroup(result.group)}</span>
                      <span>
                        <strong>{result.label}</strong>
                        <br />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{result.sublabel}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}

          {flatResults.length === 0 ? (
            <p style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Brak wyników dla: {query}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
