import { Briefcase, Users, Eye, TrendingUp } from 'lucide-react'
import { SkeletonStatCard } from '@/components/common/Skeleton'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <div>
      <p className="stat-card__value">{value ?? '—'}</p>
      <p className="stat-card__label">{label}</p>
    </div>
    <div className="stat-card__icon" style={{ background: color }}>
      <Icon size={22} />
    </div>
  </div>
)

const DashboardStats = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid-4" style={{ gap: 20 }}>
        {Array(4).fill(0).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid-4" style={{ gap: 20 }}>
      <StatCard icon={Briefcase}  label="Lowongan Aktif"    value={stats?.activeJobs}         color="var(--primary)" />
      <StatCard icon={Users}      label="Total Pelamar"     value={stats?.totalApplications}   color="var(--accent)" />
      <StatCard icon={Eye}        label="Total Tampilan"    value={stats?.totalViews}           color="var(--warning)" />
      <StatCard icon={TrendingUp} label="Berhasil Diterima" value={stats?.totalHired}           color="var(--success)" />
    </div>
  )
}

export default DashboardStats
