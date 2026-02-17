import { ChevronDown } from 'lucide-react'
import { PROFILE_OPTIONS } from '../../utils/constants'
import { useProfile } from '../../hooks/useProfile'

export function ProfileSwitcher() {
  const { activeProfile, setActiveProfile } = useProfile()

  return (
    <div className="cv-card-nested" style={{ padding: '8px 12px' }}>
      <label htmlFor="profile" className="sr-only">
        Wybierz profil
      </label>
      <div style={{ position: 'relative' }}>
        <select
          id="profile"
          className="cv-input cv-select"
          value={activeProfile}
          onChange={(event) => setActiveProfile(event.target.value as 'mikolaj' | 'emilka')}
          style={{ paddingTop: '8px', paddingBottom: '8px' }}
        >
          {PROFILE_OPTIONS.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
      </div>
    </div>
  )
}
