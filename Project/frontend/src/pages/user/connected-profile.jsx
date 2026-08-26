import { useQuery } from '@tanstack/react-query'
import Icon from '../../components/Icon'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { useAuth } from '../../providers/AuthProvider'
import { profileApi } from '../../services/profileApi'

export default function ConnectedProfilePage() {
  const { user } = useAuth()
  const query = useQuery({ queryKey: queryKeys.profile.me(), queryFn: ({ signal }) => profileApi.get({ signal }), staleTime: 60_000 })
  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />
  const profile = query.data?.data?.profile
  const initials = user?.name?.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'PS'
  const location = [profile?.location?.city, profile?.location?.country].filter(Boolean).join(', ') || 'Location not added'
  return <div className="profile-page page-stack">
    <section className="profile-hero"><div className="profile-avatar">{initials}<button aria-label="Edit avatar"><Icon name="edit" size={15} /></button></div><div><span className="eyebrow">Career Passport</span><h1>{user?.name}</h1><p>{user?.stage} · {location}</p><div><span><Icon name="sparkles" /> {profile?.headline || 'Career explorer'}</span></div></div></section>
    <section className="settings-content panel"><span className="eyebrow">Your profile</span><h2>Career passport</h2><div className="passport-sections"><article><span><Icon name="heart" /></span><div><small>Interests</small><strong>{profile?.interests?.join(', ') || 'Add your interests'}</strong></div></article><article><span><Icon name="target" /></span><div><small>Goals</small><strong>{profile?.goals?.join(', ') || 'Add a career goal'}</strong></div></article><article className={!profile?.experience?.length ? 'incomplete' : ''}><span><Icon name="briefcase" /></span><div><small>Experience</small><strong>{profile?.experience?.length ? `${profile.experience.length} experience entries` : 'Add education or work experience'}</strong></div></article></div></section>
  </div>
}
