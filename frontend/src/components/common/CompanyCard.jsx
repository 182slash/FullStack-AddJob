import { Link } from 'react-router-dom'
import { MapPin, Users, Briefcase } from 'lucide-react'
import Badge from './Badge'

const CompanyCard = ({ company }) => {
  const { _id, name, logo, industry, location, size, openJobs = 0, description } = company

  return (
    <Link
      to={`/companies/${_id}`}
      className="card card-body"
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Logo */}
        {logo ? (
          <img
            src={logo}
            alt={name}
            style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'contain', background: 'var(--bg-alt)', border: '1px solid var(--border-light)', padding: 4, flexShrink: 0 }}
          />
        ) : (
          <div
            style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}
          >
            <Briefcase size={24} />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 2 }} className="truncate">
            {name}
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 500 }}>{industry}</p>
        </div>
      </div>

      {description && (
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }} className="line-clamp-2">
          {description}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14, alignItems: 'center' }}>
        {location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--muted)' }}>
            <MapPin size={13} /> {location}
          </span>
        )}
        {size && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--muted)' }}>
            <Users size={13} /> {size} karyawan
          </span>
        )}
        {openJobs > 0 && (
          <Badge variant="success">{openJobs} lowongan terbuka</Badge>
        )}
      </div>
    </Link>
  )
}

export default CompanyCard
