import { Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '@/components/common/Badge'
import { formatRelativeTime, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/utils/formatters'

const ApplicationCard = ({ application }) => {
  const { job, status, createdAt } = application
  const statusColor = APPLICATION_STATUS_COLORS[status] || 'muted'
  return (
    <div className="card card-body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Briefcase size={20} style={{ color: 'var(--primary)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 2 }} className="truncate">{job?.title}</h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 10 }}>{job?.company?.name} · {job?.location}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Badge variant={statusColor}>{APPLICATION_STATUS_LABELS[status] || status}</Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{formatRelativeTime(createdAt)}</span>
        </div>
      </div>
    </div>
  )
}
export default ApplicationCard
