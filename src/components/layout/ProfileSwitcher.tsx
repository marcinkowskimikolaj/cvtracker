import { ChevronDown } from 'lucide-react'
import { PROFILE_OPTIONS } from '../../utils/constants'
import { useProfile } from '../../hooks/useProfile'

export function ProfileSwitcher() {
  const { activeProfile, setActiveProfile } = useProfile()

  return (
    <div className="cv-premium-profile-switch">
      <label htmlFor="profile" className="sr-only">
        Wybierz profil
      </label>
      <select
        id="profile"
        className="cv-input cv-select"
        value={activeProfile}
        onChange={(event) => setActiveProfile(event.target.value as 'mikolaj' | 'emilka')}
      >
        {PROFILE_OPTIONS.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      />
    </div>
  )
}
