import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, EyeOff, Users, Eye, MoreVertical, Briefcase } from 'lucide-react'
import { useEmployerJobs, useDeleteJob, useUpdateJob } from '@/hooks/useJobs'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import { formatDate, formatRelativeTime, formatSalaryRange, JOB_TYPE_LABELS } from '@/utils/formatters'

const STATUS_TABS = ['all','active','inactive','draft']
const STATUS_LABELS = { all:'Semua', active:'Aktif', inactive:'Ditutup', draft:'Draft' }

export default function MyJobs() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [deleteId, setDeleteId] = useState(null)
  const [menuJob, setMenuJob] = useState(null)
  const [reviewJob, setReviewJob] = useState(null)

  const params = activeTab !== 'all' ? { status: activeTab } : {}
  const { data, isLoading, refetch } = useEmployerJobs(params)
  const { mutate: deleteJob, isPending: deleting } = useDeleteJob()
  const { mutate: updateJob } = useUpdateJob()

  const jobs = data?.data || []

  const handleDelete = () => {
    deleteJob(deleteId, { onSuccess: ()=>{ setDeleteId(null); refetch() } })
  }

  const toggleStatus = (job) => {
    updateJob({ id:job._id, data:{ isActive:!job.isActive } }, { onSuccess:()=>refetch() })
    setMenuJob(null)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:4 }}>Kelola Lowongan</h1>
          <p style={{ color:'var(--muted)' }}>{jobs.length} lowongan ditemukan</p>
        </div>
        <Link to="/employer/post-job" className="btn btn--primary">
          <Plus size={16}/> Pasang Lowongan
        </Link>
      </div>

      {/* Tabs */}
      <div className="tab-list" style={{ marginBottom:24 }}>
        {STATUS_TABS.map(s => (
          <button key={s} className={`tab-item ${activeTab===s?'active':''}`} onClick={()=>setActiveTab(s)}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {Array(5).fill(0).map((_,i)=>(
            <div key={i} className="card card-body" style={{ display:'flex', gap:14 }}>
              <div className="skeleton" style={{ width:52, height:52, borderRadius:10, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div className="skeleton skeleton--title" style={{ width:'55%', marginBottom:10 }}/>
                <div className="skeleton skeleton--text" style={{ width:'35%' }}/>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length===0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><Briefcase size={28}/></div>
          <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:8 }}>Belum ada lowongan</h3>
          <p>Pasang lowongan pertama Anda sekarang untuk mulai menerima pelamar.</p>
          <Link to="/employer/post-job" className="btn btn--primary" style={{ marginTop:20 }}>
            <Plus size={16}/> Pasang Lowongan
          </Link>
        </div>
      ) : (
        <motion.div style={{ display:'flex', flexDirection:'column', gap:12 }}
          initial="h" animate="s" variants={{h:{},s:{transition:{staggerChildren:0.05}}}}>
          {jobs.map(job => (
            <motion.div key={job._id} variants={{h:{opacity:0,y:10},s:{opacity:1,y:0}}}
              className="card card-body" style={{ display:'flex', gap:14, alignItems:'center' }}>
              {/* Icon */}
              <div style={{ width:52, height:52, borderRadius:10, background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--primary)', flexShrink:0 }}>
                <Briefcase size={22}/>
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                  <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1rem' }}>{job.title}</p>
                  <Badge variant={job.isActive?'success':'muted'}>{job.isActive?'Aktif':'Tutup'}</Badge>
                  {job.isUrgent && <Badge variant="error">Urgent</Badge>}
                </div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:'0.8125rem', color:'var(--muted)' }}>
                  <span>{JOB_TYPE_LABELS[job.type]||job.type}</span>
                  <span>·</span>
                  <span><Users size={12} style={{ verticalAlign:'middle' }}/> {job.applicantCount||0} pelamar</span>
                  <span>·</span>
                  <span><Eye size={12} style={{ verticalAlign:'middle' }}/> {job.views||0} dilihat</span>
                  <span>·</span>
                  <span>Diposting {formatRelativeTime(job.createdAt)}</span>
                  {job.deadline && <><span>·</span><span>Tutup {formatDate(job.deadline)}</span></>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                <button className="btn btn--ghost btn--sm" onClick={()=>setReviewJob(job)}>
                  <Eye size={13}/> Review
                </button>
                <button className="btn btn--secondary btn--sm" onClick={()=>navigate(`/employer/edit-job/${job._id}`)}>
                  <Edit2 size={13}/> Edit
                </button>
                <div style={{ position:'relative' }}>
                  <button className="btn btn--ghost btn--icon btn--sm" onClick={()=>setMenuJob(menuJob===job._id?null:job._id)}>
                    <MoreVertical size={16}/>
                  </button>
                  {menuJob===job._id && (
                    <div style={{ position:'absolute', right:0, top:'100%', marginTop:4, background:'var(--card)', border:'1px solid var(--border-light)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-md)', zIndex:50, minWidth:160, overflow:'hidden' }}>
                      <button style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 16px', background:'none', border:'none', cursor:'pointer', fontSize:'0.875rem', color:'var(--dark)' }}
                        onClick={()=>toggleStatus(job)}>
                        <EyeOff size={14}/> {job.isActive?'Tutup Lowongan':'Aktifkan'}
                      </button>
                      <button style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 16px', background:'none', border:'none', cursor:'pointer', fontSize:'0.875rem', color:'var(--error)' }}
                        onClick={()=>{ setDeleteId(job._id); setMenuJob(null) }}>
                        <Trash2 size={14}/> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Review modal */}
      <Modal isOpen={!!reviewJob} onClose={()=>setReviewJob(null)} title="Review Lowongan" size="lg">
        {reviewJob && (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.25rem', marginBottom:4 }}>{reviewJob.title}</h2>
                <p style={{ fontWeight:600, color:'var(--dark)', marginBottom:2 }}>{reviewJob.company?.name}</p>
                <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>{reviewJob.location} · {JOB_TYPE_LABELS[reviewJob.type]||reviewJob.type}</p>
                <p style={{ color:'var(--muted)', fontSize:'0.8125rem', marginTop:6, display:'flex', alignItems:'center', gap:8 }}>
                  Diposting {formatRelativeTime(reviewJob.createdAt)} &nbsp;|&nbsp; Status: <Badge variant={reviewJob.isActive?'success':'muted'}>{reviewJob.isActive?'Active':'Tutup'}</Badge>
                </p>
              </div>
              <button className="btn btn--primary btn--sm" onClick={()=>{ setReviewJob(null); navigate(`/employer/edit-job/${reviewJob._id}`) }}>
                <Edit2 size={13}/> Edit Job
              </button>
            </div>

            {/* Salary */}
            {(reviewJob.salaryMin || reviewJob.salaryMax) && (
              <div style={{ background:'var(--accent-light)', borderRadius:'var(--radius)', padding:'10px 14px', marginBottom:16, fontSize:'0.875rem', color:'var(--primary)', fontWeight:600 }}>
                💰 {formatSalaryRange(reviewJob.salaryMin, reviewJob.salaryMax)}
              </div>
            )}

            {/* Skills */}
            {reviewJob.skills?.length > 0 && (
              <div style={{ marginBottom:16, display:'flex', flexWrap:'wrap', gap:6 }}>
                {reviewJob.skills.map(s=><Badge key={s} variant="primary">{s}</Badge>)}
              </div>
            )}

            {/* Description */}
            {reviewJob.description && (
              <div style={{ borderTop:'1px solid var(--border-light)', paddingTop:16, marginBottom:16 }}>
                <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:10 }}>Job Description</p>
                <p style={{ color:'var(--dark)', fontSize:'0.875rem', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{reviewJob.description}</p>
              </div>
            )}

            {/* Requirements */}
            {reviewJob.requirements && (
              <div style={{ borderTop:'1px solid var(--border-light)', paddingTop:16, marginBottom:16 }}>
                <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:10 }}>Requirements</p>
                <p style={{ color:'var(--dark)', fontSize:'0.875rem', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{reviewJob.requirements}</p>
              </div>
            )}

            {/* Benefits */}
            {reviewJob.benefits && (
              <div style={{ borderTop:'1px solid var(--border-light)', paddingTop:16, marginBottom:16 }}>
                <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:10 }}>Benefits</p>
                <p style={{ color:'var(--dark)', fontSize:'0.875rem', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{reviewJob.benefits}</p>
              </div>
            )}

            {/* Meta */}
            <div style={{ borderTop:'1px solid var(--border-light)', paddingTop:16, marginTop:4, display:'flex', gap:20, flexWrap:'wrap', fontSize:'0.8125rem', color:'var(--muted)' }}>
              {reviewJob.deadline && <span>📅 Batas lamar: {formatDate(reviewJob.deadline)}</span>}
              {reviewJob.slots && <span>👥 {reviewJob.slots} posisi dibuka</span>}
              {reviewJob.workMode && <span>🏢 {reviewJob.workMode}</span>}
              {reviewJob.experience && <span>⭐ {reviewJob.experience}</span>}
              {reviewJob.isUrgent && <Badge variant="error">🔥 Urgent</Badge>}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={()=>setDeleteId(null)} title="Hapus Lowongan" size="sm">
        <p style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:24 }}>
          Apakah Anda yakin ingin menghapus lowongan ini? Semua data pelamar terkait akan ikut terhapus dan tidak dapat dipulihkan.
        </p>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn btn--danger" style={{ flex:1 }} onClick={handleDelete} disabled={deleting}>
            {deleting?'Menghapus...':'Ya, Hapus'}
          </button>
          <button className="btn btn--secondary" onClick={()=>setDeleteId(null)}>Batal</button>
        </div>
      </Modal>
    </div>
  )
}