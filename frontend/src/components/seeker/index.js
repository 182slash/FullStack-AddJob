// src/components/seeker/ProfileCard.jsx
import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Star, Edit3 } from 'lucide-react'
import Avatar from '@/components/common/Avatar'
import Badge from '@/components/common/Badge'

export const ProfileCard = ({ user }) => (
  <div className="card card-body" style={{ textAlign: 'center' }}>
    <Avatar name={user?.name} src={user?.avatar} size="xl" style={{ margin: '0 auto 16px' }} />
    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', marginBottom: 4 }}>{user?.name}</h3>
    {user?.headline && <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 12 }}>{user.headline}</p>}
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
      {user?.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--muted)' }}><MapPin size={12} />{user.location}</span>}
    </div>
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 600 }}>Profil Lengkap</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>{user?.profileComplete || 0}%</span>
      </div>
      <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${user?.profileComplete || 0}%` }} /></div>
    </div>
    <Link to="/seeker/profile" className="btn btn--secondary btn--sm btn--block"><Edit3 size={14} /> Edit Profil</Link>
  </div>
)

// src/components/seeker/ApplicationCard.jsx
import { formatRelativeTime, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/utils/formatters'

export const ApplicationCard = ({ application }) => {
  const { job, status, createdAt } = application
  const statusLabel = APPLICATION_STATUS_LABELS[status] || status
  const statusColor = APPLICATION_STATUS_COLORS[status] || 'muted'

  return (
    <div className="card card-body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Briefcase size={20} style={{ color: 'var(--primary)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 2 }} className="truncate">{job?.title}</h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 10 }}>{job?.company?.name} · {job?.location}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Badge variant={statusColor}>{statusLabel}</Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{formatRelativeTime(createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

// src/components/seeker/ResumeUpload.jsx
import { useState } from 'react'
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react'

export const ResumeUpload = ({ onFileSelect, currentResume }) => {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)

  const handleFile = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      alert('Format file harus PDF, DOC, atau DOCX')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      return
    }
    setFile(f)
    onFileSelect?.(f)
  }

  return (
    <div
      className={`upload-area ${dragOver ? 'upload-area--active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => document.getElementById('resume-input').click()}
    >
      <input
        id="resume-input"
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {file ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{file.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setFile(null); onFileSelect?.(null) }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={18} />
          </button>
        </div>
      ) : (
        <>
          <Upload size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Drag & drop CV Anda di sini</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>atau klik untuk memilih file (PDF, DOC, DOCX · max 5MB)</p>
          {currentResume && (
            <p style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              <FileText size={14} /> CV saat ini tersimpan
            </p>
          )}
        </>
      )}
    </div>
  )
}
