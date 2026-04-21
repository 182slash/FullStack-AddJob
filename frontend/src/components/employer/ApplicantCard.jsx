import { MapPin, Mail, FileText } from 'lucide-react'
import Avatar from '@/components/common/Avatar'
import Badge from '@/components/common/Badge'
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/utils/formatters'

const ApplicantCard = ({ application, onStatusChange }) => {
  const { applicant, status } = application
  if (!applicant) return null

  const statusColor = APPLICATION_STATUS_COLORS[status] || 'muted'
  const nextStatuses = ['shortlist', 'interview', 'offered', 'rejected', 'hired'].filter(s => s !== status)

  return (
    <div className="card card-body">
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Avatar name={applicant.name} src={applicant.avatar} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{applicant.name}</h4>
              {applicant.headline && <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{applicant.headline}</p>}
            </div>
            <Badge variant={statusColor}>{APPLICATION_STATUS_LABELS[status] || status}</Badge>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
            {applicant.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--muted)' }}>
                <MapPin size={12} /> {applicant.location}
              </span>
            )}
            {applicant.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--muted)' }}>
                <Mail size={12} /> {applicant.email}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        {applicant.resumeUrl && (
          <a href={applicant.resumeUrl} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm">
            <FileText size={14} /> Lihat CV
          </a>
        )}
        {nextStatuses.slice(0, 3).map(s => (
          <button
            key={s}
            className="btn btn--ghost btn--sm"
            onClick={() => onStatusChange?.(application._id, s)}
          >
            {APPLICATION_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ApplicantCard
