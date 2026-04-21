import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, ExternalLink, X } from 'lucide-react'
import { useMyApplications, useWithdrawApplication } from '@/hooks/useApplications'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import { formatDate, formatRelativeTime, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/utils/formatters'
import { SkeletonJobCard } from '@/components/common/Skeleton'

const STATUS_TABS = ['all','pending','reviewed','shortlist','interview','offered','hired','rejected']
const STATUS_TAB_LABELS = { all:'Semua', pending:'Menunggu', reviewed:'Dilihat', shortlist:'Shortlist', interview:'Interview', offered:'Ditawarkan', hired:'Diterima', rejected:'Ditolak' }

export default function MyApplications() {
  const [activeStatus, setActiveStatus] = useState('all')
  const [withdrawId, setWithdrawId] = useState(null)
  const [detailApp, setDetailApp] = useState(null)

  const params = activeStatus!=='all' ? { status:activeStatus } : {}
  const { data, isLoading, error } = useMyApplications(params)
  const { mutate: withdraw, isPending: withdrawing } = useWithdrawApplication()

  const apps = data?.data || []

  const handleWithdraw = () => {
    withdraw(withdrawId, { onSuccess: ()=>setWithdrawId(null) })
  }

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:4 }}>Lamaran Saya</h1>
        <p style={{ color:'var(--muted)' }}>Pantau status semua lamaran kerja Anda.</p>
      </div>

      {/* Status tabs */}
      <div className="tabs" style={{ marginBottom:20, overflowX:'auto', whiteSpace:'nowrap' }}>
        {STATUS_TABS.map(s=>(
          <button key={s} className={`tab-btn ${activeStatus===s?'active':''}`} onClick={()=>setActiveStatus(s)}>
            {STATUS_TAB_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>{Array(5).fill(0).map((_,i)=><SkeletonJobCard key={i}/>)}</div>
      ) : error ? (
        <div className="alert alert--error"><p>Gagal memuat data lamaran.</p></div>
      ) : apps.length===0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><FileText size={28}/></div>
          <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, marginBottom:8 }}>Belum ada lamaran</h3>
          <p>Mulai lamar lowongan sekarang untuk membangun karir impian Anda.</p>
          <Link to="/jobs" className="btn btn--primary" style={{ marginTop:20 }}>Cari Lowongan</Link>
        </div>
      ) : (
        <motion.div style={{ display:'flex', flexDirection:'column', gap:12 }}
          initial="h" animate="s" variants={{h:{},s:{transition:{staggerChildren:0.06}}}}>
          {apps.map(app=>(
            <motion.div key={app._id} variants={{h:{opacity:0,y:10},s:{opacity:1,y:0}}}
              className="card card-body" style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
              {/* Company logo */}
              <div style={{ width:52, height:52, borderRadius:10, background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {app.job?.company?.logo
                  ? <img src={app.job.company.logo} alt="" style={{ width:40, height:40, objectFit:'contain' }}/>
                  : <FileText size={20} style={{ color:'var(--primary)' }}/>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
                  <div style={{ minWidth:0 }}>
                    <Link to={`/jobs/${app.job?._id}`} style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1rem', color:'var(--dark)', textDecoration:'none' }} className="truncate">
                      {app.job?.title}
                    </Link>
                    <p style={{ fontSize:'0.875rem', color:'var(--muted)', marginTop:2 }}>{app.job?.company?.name} · {app.job?.location}</p>
                  </div>
                  <Badge variant={APPLICATION_STATUS_COLORS[app.status]||'muted'}>
                    {APPLICATION_STATUS_LABELS[app.status]||app.status}
                  </Badge>
                </div>
                <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:'0.8125rem', color:'var(--muted)' }}>Dikirim {formatRelativeTime(app.createdAt)}</span>
                  {app.job?.deadline && <span style={{ fontSize:'0.8125rem', color:'var(--muted)' }}>Tutup {formatDate(app.job.deadline)}</span>}
                  <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
                    <button className="btn btn--secondary btn--sm" onClick={()=>setDetailApp(app)}>
                      <ExternalLink size={13}/> Detail
                    </button>
                    {['pending','reviewed'].includes(app.status) && (
                      <button className="btn btn--ghost btn--sm" style={{ color:'var(--error)' }} onClick={()=>setWithdrawId(app._id)}>
                        <X size={13}/> Tarik
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Withdraw confirm */}
      <Modal isOpen={!!withdrawId} onClose={()=>setWithdrawId(null)} title="Tarik Lamaran" size="sm">
        <p style={{ color:'var(--muted)', marginBottom:24 }}>Apakah Anda yakin ingin menarik lamaran ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn btn--danger" style={{ flex:1 }} onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing?'Memproses...':'Ya, Tarik Lamaran'}
          </button>
          <button className="btn btn--secondary" onClick={()=>setWithdrawId(null)}>Batal</button>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal isOpen={!!detailApp} onClose={()=>setDetailApp(null)} title="Detail Lamaran" size="md">
        {detailApp && (
          <div>
            <div style={{ display:'flex', gap:14, marginBottom:20 }}>
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800 }}>{detailApp.job?.title}</h3>
                <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>{detailApp.job?.company?.name}</p>
              </div>
              <Badge variant={APPLICATION_STATUS_COLORS[detailApp.status]||'muted'}>
                {APPLICATION_STATUS_LABELS[detailApp.status]}
              </Badge>
            </div>
            {detailApp.coverLetter && (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontWeight:700, marginBottom:8, fontSize:'0.875rem' }}>Cover Letter:</p>
                <p style={{ color:'var(--muted)', fontSize:'0.875rem', lineHeight:1.7, background:'var(--bg)', padding:12, borderRadius:'var(--radius)' }}>{detailApp.coverLetter}</p>
              </div>
            )}
            <div style={{ marginBottom:16 }}>
              <p style={{ fontWeight:700, marginBottom:8, fontSize:'0.875rem' }}>Riwayat Status:</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {(detailApp.statusHistory||[]).map((h,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', flexShrink:0, marginTop:5 }}/>
                    <div>
                      <p style={{ fontSize:'0.875rem', fontWeight:600 }}>{APPLICATION_STATUS_LABELS[h.status]||h.status}</p>
                      {h.note && <p style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{h.note}</p>}
                      <p style={{ fontSize:'0.75rem', color:'var(--muted-light)' }}>{formatDate(h.changedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {detailApp.resumeUrl && (
              <a href={detailApp.resumeUrl} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm">
                <FileText size={14}/> Lihat CV yang Dikirim
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
