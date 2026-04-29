import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, ChevronDown, User, Mail, Phone, MapPin, GraduationCap, X } from 'lucide-react'
import { useJobApplicants, useUpdateApplicationStatus } from '@/hooks/useApplications'
import { useJob } from '@/hooks/useJobs'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import Avatar from '@/components/common/Avatar'
import { formatDate, formatRelativeTime, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/utils/formatters'

const STATUS_TABS = ['all','pending','reviewed','shortlist','interview','offered','hired','rejected']
const STATUS_TAB_LABELS = { all:'Semua', pending:'Baru', reviewed:'Dilihat', shortlist:'Shortlist', interview:'Interview', offered:'Ditawarkan', hired:'Diterima', rejected:'Ditolak' }

const NEXT_STATUS_OPTIONS = [
  { value:'reviewed',  label:'Tandai Sudah Dilihat' },
  { value:'shortlist', label:'Masukkan Shortlist' },
  { value:'interview', label:'Undang Interview' },
  { value:'offered',   label:'Beri Penawaran' },
  { value:'hired',     label:'Terima Pelamar' },
  { value:'rejected',  label:'Tolak Lamaran' },
]

export default function Applicants() {
  const { jobId } = useParams()
  const [activeTab, setActiveTab] = useState('all')
  const [selected, setSelected] = useState(null)
  const [statusNote, setStatusNote] = useState('')
  const [updating, setUpdating] = useState(null)

  const params = activeTab!=='all' ? { status: activeTab } : {}
  const { data: jobData } = useJob(jobId)
  const { data, isLoading, refetch } = useJobApplicants(jobId, params)
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus()

  const applicants = data?.data || []
  const job = jobData?.data || jobData

  if (!jobId) return (
    <div className="empty-state">
      <div className="empty-state__icon"><Users size={28}/></div>
      <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:8 }}>Pilih Lowongan</h3>
      <p>Pilih lowongan dari halaman Kelola Lowongan untuk melihat pelamarnya.</p>
      <Link to="/employer/jobs" className="btn btn--primary" style={{ marginTop:20 }}>
        Ke Kelola Lowongan
      </Link>
    </div>
  )

  const handleStatusUpdate = (appId, status) => {
    updateStatus({ id:appId, status, note:statusNote }, {
      onSuccess:()=>{ setUpdating(null); setStatusNote(''); refetch() }
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <Link to="/employer/jobs" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--muted)', textDecoration:'none', fontSize:'0.875rem', marginBottom:12 }}>
          <ArrowLeft size={14}/> Kembali ke Lowongan
        </Link>
        <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:4 }}>
          {job?.title || 'Pelamar'}
        </h1>
        <p style={{ color:'var(--muted)' }}>{applicants.length} pelamar · {job?.location}</p>
      </div>

      {/* Tabs */}
      <div className="tab-list" style={{ marginBottom:24 }}>
        {STATUS_TABS.map(s => (
          <button key={s} className={`tab-item ${activeTab===s?'active':''}`} onClick={()=>setActiveTab(s)}>
            {STATUS_TAB_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {Array(5).fill(0).map((_,i)=>(
            <div key={i} className="card card-body" style={{ display:'flex', gap:14 }}>
              <div className="skeleton" style={{ width:52, height:52, borderRadius:'50%', flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div className="skeleton skeleton--title" style={{ width:'40%', marginBottom:8 }}/>
                <div className="skeleton skeleton--text" style={{ width:'60%' }}/>
              </div>
            </div>
          ))}
        </div>
      ) : applicants.length===0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><User size={28}/></div>
          <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:8 }}>Belum ada pelamar</h3>
          <p>{activeTab==='all' ? 'Belum ada yang melamar lowongan ini.' : `Tidak ada pelamar dengan status "${STATUS_TAB_LABELS[activeTab]}".`}</p>
        </div>
      ) : (
        <motion.div style={{ display:'flex', flexDirection:'column', gap:12 }}
          initial="h" animate="s" variants={{h:{},s:{transition:{staggerChildren:0.05}}}}>
          {applicants.map(app => (
            <motion.div key={app._id} variants={{h:{opacity:0,y:10},s:{opacity:1,y:0}}} className="applicant-card"
              style={{ position:'relative', overflow:'hidden' }}>
              {app.isBlurred && (
                <div style={{
                  position:'absolute', inset:0, zIndex:10,
                  backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
                  background:'rgba(255,255,255,0.6)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
                  borderRadius:'var(--radius-md)',
                }}>
                  <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.9rem', color:'var(--dark)' }}>
                    🔒 Kandidat terkunci
                  </p>
                  <p style={{ fontSize:'0.8rem', color:'var(--muted)', marginBottom:4 }}>
                    Upgrade paket untuk melihat profil kandidat ini
                  </p>
                  <Link to="/employer/subscription" className="btn btn--primary btn--sm">Upgrade Paket</Link>
                </div>
              )}
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <Avatar name={app.applicant?.name} src={app.applicant?.avatar} size="lg" style={{ flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
                    <div>
                      <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1rem', marginBottom:2 }}>{app.applicant?.name}</p>
                      <p style={{ fontSize:'0.8125rem', color:'var(--muted)' }}>{app.applicant?.headline}</p>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                      <Badge variant={APPLICATION_STATUS_COLORS[app.status]||'muted'}>
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </Badge>
                      <span style={{ fontSize:'0.75rem', color:'var(--muted-light)' }}>{formatRelativeTime(app.createdAt)}</span>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:8, fontSize:'0.8125rem', color:'var(--muted)' }}>
                    {app.applicant?.location && <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={12}/>{app.applicant.location}</span>}
                    {app.applicant?.email && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Mail size={12}/>{app.applicant.email}</span>}
                  </div>

                  {app.coverLetter && (
                    <p style={{ marginTop:10, fontSize:'0.875rem', color:'var(--muted)', lineHeight:1.6, background:'var(--bg)', padding:'8px 12px', borderRadius:'var(--radius)', fontStyle:'italic' }}>
                      "{app.coverLetter.slice(0,150)}{app.coverLetter.length>150?'...':''}"
                    </p>
                  )}

                  <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                    <button className="btn btn--secondary btn--sm" onClick={()=>setSelected(app)}>
                      Lihat Profil
                    </button>
                    {app.resumeUrl && (
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                        <Download size={13}/> Download CV
                      </a>
                    )}
                    {/* Status dropdown */}
                    <div style={{ position:'relative' }}>
                      <button className="btn btn--primary btn--sm" onClick={()=>setUpdating(updating===app._id?null:app._id)}>
                        Update Status <ChevronDown size={12}/>
                      </button>
                      {updating===app._id && (
                        <div style={{ position:'absolute', left:0, top:'100%', marginTop:4, background:'var(--card)', border:'1px solid var(--border-light)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-md)', zIndex:50, minWidth:200, overflow:'hidden' }}>
                          {NEXT_STATUS_OPTIONS.map(opt=>(
                            <button key={opt.value} style={{ display:'block', width:'100%', padding:'10px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontSize:'0.875rem', color:'var(--dark)' }}
                              onClick={()=>handleStatusUpdate(app._id, opt.value)}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Detail modal */}
      <Modal isOpen={!!selected} onClose={()=>setSelected(null)} title="Profil Pelamar" size="md">
        {selected && (
          <div>
            <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:24 }}>
              <Avatar name={selected.applicant?.name} src={selected.applicant?.avatar} size="xl"/>
              <div>
                <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.25rem' }}>{selected.applicant?.name}</h3>
                <p style={{ color:'var(--muted)', marginTop:2 }}>{selected.applicant?.headline}</p>
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  <Badge variant={APPLICATION_STATUS_COLORS[selected.status]||'muted'}>{APPLICATION_STATUS_LABELS[selected.status]}</Badge>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {selected.applicant?.email && (
                <div style={{ display:'flex', gap:10, alignItems:'center', fontSize:'0.9rem' }}>
                  <Mail size={16} style={{ color:'var(--primary)', flexShrink:0 }}/> {selected.applicant.email}
                </div>
              )}
              {selected.applicant?.phone && (
                <div style={{ display:'flex', gap:10, alignItems:'center', fontSize:'0.9rem' }}>
                  <Phone size={16} style={{ color:'var(--primary)', flexShrink:0 }}/> {selected.applicant.phone}
                </div>
              )}
              {selected.applicant?.location && (
                <div style={{ display:'flex', gap:10, alignItems:'center', fontSize:'0.9rem' }}>
                  <MapPin size={16} style={{ color:'var(--primary)', flexShrink:0 }}/> {selected.applicant.location}
                </div>
              )}
            </div>

            {selected.applicant?.bio && (
              <div style={{ marginTop:20, padding:'14px 16px', background:'var(--bg)', borderRadius:'var(--radius)', fontSize:'0.875rem', lineHeight:1.7, color:'var(--dark)' }}>
                {selected.applicant.bio}
              </div>
            )}

            {(selected.applicant?.skills||[]).length > 0 && (
              <div style={{ marginTop:16 }}>
                <p style={{ fontWeight:700, marginBottom:8, fontSize:'0.875rem' }}>Skills:</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {selected.applicant.skills.map(s=>(
                    <span key={s} className="tag-item">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.coverLetter && (
              <div style={{ marginTop:16 }}>
                <p style={{ fontWeight:700, marginBottom:8, fontSize:'0.875rem' }}>Cover Letter:</p>
                <p style={{ color:'var(--muted)', fontSize:'0.875rem', lineHeight:1.7, background:'var(--bg)', padding:12, borderRadius:'var(--radius)' }}>
                  {selected.coverLetter}
                </p>
              </div>
            )}

            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              {selected.resumeUrl && (
                <a href={selected.resumeUrl} target="_blank" rel="noreferrer" className="btn btn--primary" style={{ flex:1 }}>
                  <Download size={15}/> Download CV
                </a>
              )}
              <button className="btn btn--secondary" onClick={()=>setSelected(null)} style={{ flex:1 }}>Tutup</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
