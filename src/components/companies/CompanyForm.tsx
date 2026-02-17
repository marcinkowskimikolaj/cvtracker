import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCompanies } from '../../hooks/useCompanies'
import { useProfile } from '../../hooks/useProfile'
import { distance, geocode } from '../../services/google/maps'
import { useToastStore } from '../../store/toastStore'
import type { CompanyRecord, SheetRecord } from '../../types'
import { nowIsoDateTime } from '../../utils/dates'
import { generateId } from '../../utils/uuid'

interface CompanyFormProps {
  open: boolean
  editingCompany: SheetRecord<CompanyRecord> | null
  onClose: () => void
}

export function CompanyForm({ open, editingCompany, onClose }: CompanyFormProps) {
  const { config } = useAuth()
  const { activeProfile } = useProfile()
  const { createCompany, updateCompany } = useCompanies()
  const pushToast = useToastStore((state) => state.push)

  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [careersUrl, setCareersUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!editingCompany) {
      setName('')
      setIndustry('')
      setWebsite('')
      setCareersUrl('')
      setLinkedinUrl('')
      setAddress('')
      setNotes('')
      return
    }

    setName(editingCompany.name)
    setIndustry(editingCompany.industry)
    setWebsite(editingCompany.website)
    setCareersUrl(editingCompany.careers_url)
    setLinkedinUrl(editingCompany.linkedin_url)
    setAddress(editingCompany.address)
    setNotes(editingCompany.notes)
  }, [editingCompany])

  if (!open) {
    return null
  }

  async function calculateDistance(addressValue: string): Promise<{ lat: number | null; lng: number | null; distanceKm: number | null; travelTimeMin: number | null }> {
    const mapsApiKey = config.GOOGLE_MAPS_API_KEY

    if (!mapsApiKey || !addressValue.trim()) {
      return {
        lat: null,
        lng: null,
        distanceKm: null,
        travelTimeMin: null,
      }
    }

    try {
      const location = await geocode(addressValue, mapsApiKey)

      const homeAddress =
        activeProfile === 'mikolaj' ? config.HOME_ADDRESS_MIKOLAJ || '' : config.HOME_ADDRESS_EMILKA || ''

      if (!homeAddress) {
        return {
          lat: location.lat,
          lng: location.lng,
          distanceKm: null,
          travelTimeMin: null,
        }
      }

      const distanceInfo = await distance(homeAddress, addressValue, mapsApiKey)

      return {
        lat: location.lat,
        lng: location.lng,
        distanceKm: distanceInfo.distanceKm,
        travelTimeMin: distanceInfo.travelTimeMin,
      }
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się obliczyć odległości firmy.',
        variant: 'error',
      })

      return {
        lat: null,
        lng: null,
        distanceKm: null,
        travelTimeMin: null,
      }
    }
  }

  async function handleSave(): Promise<void> {
    if (!name.trim()) {
      pushToast({ title: 'Nazwa firmy jest wymagana.', variant: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      const distanceData = await calculateDistance(address.trim())

      if (editingCompany) {
        await updateCompany({
          ...editingCompany,
          name: name.trim(),
          industry: industry.trim(),
          website: website.trim(),
          careers_url: careersUrl.trim(),
          linkedin_url: linkedinUrl.trim(),
          address: address.trim(),
          lat: distanceData.lat,
          lng: distanceData.lng,
          distance_km: distanceData.distanceKm,
          travel_time_min: distanceData.travelTimeMin,
          notes: notes.trim(),
        })
      } else {
        await createCompany({
          company_id: generateId(),
          profile_id: activeProfile,
          name: name.trim(),
          industry: industry.trim(),
          website: website.trim(),
          careers_url: careersUrl.trim(),
          linkedin_url: linkedinUrl.trim(),
          address: address.trim(),
          lat: distanceData.lat,
          lng: distanceData.lng,
          distance_km: distanceData.distanceKm,
          travel_time_min: distanceData.travelTimeMin,
          notes: notes.trim(),
          created_at: nowIsoDateTime(),
        })
      }

      pushToast({ title: editingCompany ? 'Zaktualizowano firmę.' : 'Dodano firmę.', variant: 'success' })
      onClose()
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : 'Nie udało się zapisać firmy.',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="cv-overlay" onClick={onClose}>
      <div className="cv-modal" style={{ maxWidth: 680 }} onClick={(event) => event.stopPropagation()}>
        <div className="cv-modal-header">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{editingCompany ? 'Edytuj firmę' : 'Dodaj firmę'}</h3>
        </div>
        <div className="cv-modal-body" style={{ display: 'grid', gap: 12 }}>
          <input className="cv-input" placeholder="Nazwa firmy" value={name} onChange={(event) => setName(event.target.value)} />
          <input className="cv-input" placeholder="Branża" value={industry} onChange={(event) => setIndustry(event.target.value)} />
          <input className="cv-input" placeholder="Strona www" value={website} onChange={(event) => setWebsite(event.target.value)} />
          <input className="cv-input" placeholder="Strona kariery" value={careersUrl} onChange={(event) => setCareersUrl(event.target.value)} />
          <input className="cv-input" placeholder="LinkedIn" value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} />
          <input className="cv-input" placeholder="Adres" value={address} onChange={(event) => setAddress(event.target.value)} />
          <textarea className="cv-input cv-textarea" placeholder="Notatki" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
        <div className="cv-modal-footer">
          <button className="cv-btn cv-btn-secondary" type="button" onClick={onClose}>
            Anuluj
          </button>
          <button className="cv-btn cv-btn-primary" type="button" onClick={() => void handleSave()} disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </div>
      </div>
    </div>
  )
}
