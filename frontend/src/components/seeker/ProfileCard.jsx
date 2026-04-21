import { Link } from 'react-router-dom'
import { MapPin, Edit3, FileText } from 'lucide-react'
import Avatar from '@/components/common/Avatar'

const ProfileCard = ({ user }) => (
  <div className="card card-body" style={{ textAlign: 'center' }}>
    <Avatar name={user?.name} src={user?.avatar} size="xl" style={{ margin: '0 auto 16px' }} />
    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', marginBottom: 4 }}>{user?.name}</h3>
    {user?.headline && <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 10 }}>{user.headline}</p>}
    {user?.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: 16 }}><MapPin size={12}/>{user.location}</span>}
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 600 }}>Kelengkapan Profil</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>{user?.profileComplete || 0}%</span>
      </div>
      <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${user?.profileComplete || 0}%` }}/></div>
    </div>
    <Link to="/seeker/profile" className="btn btn--secondary btn--sm btn--block"><Edit3 size={14}/> Edit Profil</Link>
  </div>
)
export default ProfileCard
