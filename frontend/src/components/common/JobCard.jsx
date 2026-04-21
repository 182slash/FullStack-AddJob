import { Link } from 'react-router-dom'
import { MapPin, Clock, Bookmark, BookmarkCheck, Briefcase } from 'lucide-react'
import Badge from './Badge'
import Avatar from './Avatar'
import { formatSalaryRange, formatRelativeTime, JOB_TYPE_LABELS } from '@/utils/formatters'

const JOB_TYPE_BADGE_VARIANT = {
  fulltime:   'primary',
  parttime:   'muted',
  contract:   'warning',
  freelance:  'success',
  internship: 'error',
  remote:     'dark',
}

const JobCard = ({
  job,
  onSave,
  isSaved = false,
  variant = 'default', // default | compact | featured
}) => {
  const {
    _id, title, company, location, type, salaryMin, salaryMax,
    tags = [], createdAt, logo, remote, experience,
  } = job

  const handleSave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSave?.(job)
  }

  return (
    <Link to={`/jobs/${_id}`} className="job-card" style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Company Logo */}
        {logo ? (
          <img src={logo} alt={company?.name} className="job-card__company-logo" />
        ) : (
          <div
            className="job-card__company-logo"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-light)', color: 'var(--primary)' }}
          >
            <Briefcase size={20} />
          </div>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <h4 className="job-card__title truncate">{title}</h4>
            <button
              onClick={handleSave}
              style={{ background: 'none', border: 'none', color: isSaved ? 'var(--primary)' : 'var(--muted)', flexShrink: 0, padding: 2, cursor: 'pointer', transition: 'color 0.15s' }}
              aria-label={isSaved ? 'Hapus simpan' : 'Simpan lowongan'}
            >
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>

          <p className="job-card__company text-sm">
            {company?.name || 'Perusahaan'}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span className="job-card__location" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--muted)' }}>
          <MapPin size={13} />
          {location || 'Remote'}
        </span>
        <span style={{ color: 'var(--border)', fontSize: '0.75rem' }}>•</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--muted)' }}>
          <Clock size={13} />
          {formatRelativeTime(createdAt)}
        </span>
      </div>

      {/* Salary */}
      {(salaryMin || salaryMax) && (
        <p className="job-card__salary" style={{ marginTop: 8, fontSize: '0.875rem' }}>
          {formatSalaryRange(salaryMin, salaryMax)}
        </p>
      )}

      {/* Badges */}
      <div className="job-card__meta">
        {type && (
          <Badge variant={JOB_TYPE_BADGE_VARIANT[type] || 'primary'}>
            {JOB_TYPE_LABELS[type] || type}
          </Badge>
        )}
        {remote && <Badge variant="dark">Remote</Badge>}
        {tags.slice(0, 3).map(tag => (
          <Badge key={tag} variant="muted">{tag}</Badge>
        ))}
      </div>
    </Link>
  )
}

export default JobCard
