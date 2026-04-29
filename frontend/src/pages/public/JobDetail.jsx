import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Users, Calendar, Building2, ArrowLeft, Bookmark, BookmarkCheck, Share2, CheckCircle2, Briefcase, Globe, BadgeCheck, ChevronRight, ExternalLink } from 'lucide-react'
import { useJob, useFeaturedJobs, useSaveJob } from '@/hooks/useJobs'
import { useApplyToJob } from '@/hooks/useApplications'
import { useAuth } from '@/context/AuthContext'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import JobCard from '@/components/common/JobCard'
import ResumeUpload from '@/components/seeker/ResumeUpload'
import { formatSalaryRange, formatDate, formatRelativeTime, JOB_TYPE_LABELS } from '@/utils/formatters'

const TABS = ['Deskripsi','Persyaratan','Benefit','Tentang Perusahaan']

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isSeeker, user } = useAuth()
  const { data: jobData, isLoading } = useJob(id)
  const { data: featuredData } = useFeaturedJobs()
  const { mutate: saveJob, isPending: savePending } = useSaveJob()
  const { mutate: applyJob, isPending: applyPending } = useApplyToJob()
  const [activeTab, setActiveTab] = useState('Deskripsi')
  const [applyModal, setApplyModal] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [saved, setSaved] = useState(false)

  if (isLoading) return (
    <div className="container" style={{padding:'40px 0'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:28}}>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {[160,200,180].map((h,i) => <div key={i} className="skeleton" style={{height:h,borderRadius:12}}/>)}
        </div>
        <div className="skeleton" style={{height:340,borderRadius:12}}/>
      </div>
    </div>
  )

  const job = jobData?.data || jobData
  if (!job) return (
    <div className="container empty-state" style={{minHeight:'60vh'}}>
      <div className="empty-state__icon"><Briefcase size={32}/></div>
      <h3>Lowongan tidak ditemukan</h3>
      <button className="btn btn--primary" style={{marginTop:20}} onClick={() => navigate('/jobs')}>Cari Lowongan</button>
    </div>
  )

  const { title, company, description, requirements, location, type, salaryMin, salaryMax, deadline, tags=[], createdAt, slots, remote, isUrgent } = job
  const similarJobs = (featuredData?.data||[]).filter(j=>j._id!==id).slice(0,3)

  const handleApply = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })
    if (!isSeeker) return // employers can't apply
    if (user?.resumeUrl) {
      setApplyModal(true) // has CV → quick apply modal
    } else {
      navigate(`/seeker/apply/${id}`) // no CV → full form with upload
    }
  }

  const submitApplication = () => {
    const fd = new FormData()
    if (cvFile) fd.append('resume', cvFile)
    fd.append('coverLetter', coverLetter)
    applyJob({jobId:id, formData:fd}, {
      onSuccess:()=>setApplied(true),
      onError: (err) => {
        const status = err.response?.status
        if (status === 401) {
          setApplyModal(false)
          navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })
        } else {
          const msg = err.response?.data?.message || 'Gagal mengirim lamaran.'
          alert(msg)
        }
      }
    })
  }

  return (
    <>
      <div style={{background:'var(--bg)',minHeight:'100vh',paddingBottom:48}}>
        <div className="container" style={{padding:'28px var(--space-6)',maxWidth:1100}}>
          <button onClick={()=>navigate(-1)} style={{display:'flex',alignItems:'center',gap:6,color:'var(--muted)',background:'none',border:'none',cursor:'pointer',marginBottom:24,fontSize:'0.9375rem'}}>
            <ArrowLeft size={16}/> Kembali
          </button>

          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:28,alignItems:'flex-start'}}>
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
              {/* Header */}
              <div className="card card-body" style={{marginBottom:20}}>
                <div style={{display:'flex',gap:16,alignItems:'flex-start',marginBottom:16}}>
                  {company?.logo
                    ? <img src={company.logo} alt="" style={{width:72,height:72,borderRadius:12,objectFit:'contain',border:'1px solid var(--border-light)',padding:4,background:'#fff',flexShrink:0}}/>
                    : <div className="company-logo-placeholder" style={{width:72,height:72}}><Building2 size={32}/></div>
                  }
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                      <h1 style={{fontFamily:'var(--font-heading)',fontSize:'clamp(1.25rem,2.5vw,1.625rem)',fontWeight:800}}>{title}</h1>
                      {isUrgent && <Badge variant="error">🔥 Urgent</Badge>}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <Link to={`/companies/${company?._id}`} style={{fontWeight:600,color:'var(--primary)',fontSize:'1rem',textDecoration:'none'}}>{company?.name}</Link>
                      {company?.isVerified && <span style={{display:'flex',alignItems:'center',gap:3,color:'var(--success)',fontSize:'0.8125rem',fontWeight:600}}><BadgeCheck size={15}/> Terverifikasi</span>}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6,color:'var(--muted)',fontSize:'0.875rem',marginTop:4}}>
                      <MapPin size={13}/> {location}{remote && <> · <span style={{color:'var(--success)',fontWeight:600}}>Remote</span></>}
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {type && <Badge variant="primary">{JOB_TYPE_LABELS[type]||type}</Badge>}
                  {job.experience && <Badge variant="muted">{job.experience==='fresh'?'Fresh Graduate':`${job.experience} Thn`}</Badge>}
                  {(salaryMin||salaryMax) && <Badge variant="success">💰 {formatSalaryRange(salaryMin,salaryMax)}</Badge>}
                  {tags.slice(0,4).map(t=><Badge key={t} variant="muted">{t}</Badge>)}
                </div>
              </div>

              {/* Tabs */}
              <div className="card" style={{marginBottom:20,overflow:'hidden'}}>
                <div className="tab-list">
                  {TABS.map(tab=>(
                    <button key={tab} className={`tab-item ${activeTab===tab?'active':''}`} onClick={()=>setActiveTab(tab)}>{tab}</button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}} style={{padding:'0 24px 24px'}}>
                    {activeTab==='Deskripsi' && <div style={{color:'var(--dark)',lineHeight:1.85,whiteSpace:'pre-wrap',fontSize:'0.9375rem'}}>{description||'Deskripsi belum tersedia.'}</div>}
                    {activeTab==='Persyaratan' && <div style={{color:'var(--dark)',lineHeight:1.85,whiteSpace:'pre-wrap',fontSize:'0.9375rem'}}>{requirements||'Persyaratan belum dicantumkan.'}</div>}
                    {activeTab==='Benefit' && <div style={{color:'var(--dark)',lineHeight:1.85,whiteSpace:'pre-wrap',fontSize:'0.9375rem'}}>{job.benefits||'Benefit belum dicantumkan.'}</div>}
                    {activeTab==='Tentang Perusahaan' && (
                      <div>
                        {company?.description
                          ? <p style={{color:'var(--dark)',lineHeight:1.8,fontSize:'0.9375rem'}}>{company.description}</p>
                          : <p style={{color:'var(--muted)'}}>Informasi perusahaan belum tersedia.</p>
                        }
                        {company?.website && <a href={company.website} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:16,color:'var(--primary)',fontWeight:600,fontSize:'0.9rem'}}><Globe size={15}/> Website <ExternalLink size={12}/></a>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {similarJobs.length>0 && (
                <div>
                  <h2 style={{fontFamily:'var(--font-heading)',fontWeight:700,fontSize:'1.125rem',marginBottom:16}}>Lowongan Serupa</h2>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {similarJobs.map(j=><JobCard key={j._id} job={j}/>)}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div className="job-sticky-sidebar" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.1}}>
              <div className="card card-body">
                {(salaryMin||salaryMax) && (
                  <div style={{marginBottom:20,paddingBottom:20,borderBottom:'1px solid var(--border-light)'}}>
                    <p style={{fontSize:'0.75rem',fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4}}>Gaji</p>
                    <p style={{fontFamily:'var(--font-heading)',fontSize:'1.375rem',fontWeight:800,color:'var(--success)'}}>{formatSalaryRange(salaryMin,salaryMax)}</p>
                  </div>
                )}
                <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20,paddingBottom:20,borderBottom:'1px solid var(--border-light)'}}>
                  {[{icon:<MapPin size={15}/>,label:'Lokasi',value:location},{icon:<Calendar size={15}/>,label:'Batas Lamaran',value:deadline?formatDate(deadline):'Tidak ditentukan'},{icon:<Users size={15}/>,label:'Posisi',value:`${slots||1} posisi`},{icon:<Clock size={15}/>,label:'Diposting',value:formatRelativeTime(createdAt)}].map(({icon,label,value})=>(
                    <div key={label} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                      <span style={{color:'var(--primary)',flexShrink:0,marginTop:2}}>{icon}</span>
                      <div>
                        <p style={{fontSize:'0.75rem',color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p>
                        <p style={{fontWeight:600,color:'var(--dark)',fontSize:'0.9rem'}}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn--accent btn--block" style={{marginBottom:10,fontSize:'1rem',padding:'13px'}} onClick={handleApply} disabled={applied}>
                  {applied ? <><CheckCircle2 size={18}/> Sudah Dilamar</> : 'Lamar Sekarang'}
                </button>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn--secondary" style={{flex:1}} onClick={()=>{saveJob({jobId:id,saved},{onSuccess:()=>setSaved(v=>!v)})}} disabled={savePending}>
                    {saved ? <><BookmarkCheck size={16}/> Tersimpan</> : <><Bookmark size={16}/> Simpan</>}
                  </button>
                  <button className="btn btn--ghost btn--icon" onClick={()=>navigator.share?.({title,url:window.location.href})||navigator.clipboard.writeText(window.location.href)}>
                    <Share2 size={16}/>
                  </button>
                </div>
                {!isAuthenticated && <p style={{marginTop:14,fontSize:'0.8125rem',color:'var(--muted)',textAlign:'center'}}><Link to="/login" style={{color:'var(--primary)',fontWeight:600}}>Masuk</Link> untuk melamar</p>}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Modal isOpen={applyModal} onClose={()=>{if(!applied)setApplyModal(false)}} title={applied?undefined:`Lamar: ${title}`} size="md">
        {applied ? (
          <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{width:72,height:72,background:'var(--success-light)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',color:'var(--success)'}}>
              <CheckCircle2 size={36}/>
            </div>
            <h3 style={{fontFamily:'var(--font-heading)',fontWeight:800,marginBottom:10}}>Lamaran Terkirim!</h3>
            <p style={{color:'var(--muted)',lineHeight:1.7,marginBottom:24}}>Lamaran Anda untuk posisi <strong>{title}</strong> telah berhasil dikirim.</p>
            <div style={{display:'flex',gap:10}}>
              <Link to="/seeker/applications" className="btn btn--primary" style={{flex:1}}>Lihat Lamaran</Link>
              <button className="btn btn--ghost" onClick={()=>setApplyModal(false)}>Tutup</button>
            </div>
          </motion.div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <div className="alert alert--info"><p style={{fontSize:'0.875rem'}}>Melamar sebagai <strong>{user?.name}</strong></p></div>
            <div className="form-group">
              <label className="form-label">Upload CV / Resume</label>
              <ResumeUpload onFileSelect={setCvFile} currentResume={user?.resumeUrl}/>
            </div>
            <div className="form-group">
              <label className="form-label">Cover Letter <span style={{color:'var(--muted)',fontWeight:400}}>(Opsional)</span></label>
              <textarea className="rich-textarea" placeholder="Ceritakan mengapa Anda cocok..." rows={5} value={coverLetter} onChange={e=>setCoverLetter(e.target.value)}/>
            </div>
              {!cvFile && !user?.resumeUrl && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--error)', marginTop: -12 }}>
                  CV wajib dilampirkan. <Link to={`/seeker/apply/${id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>Upload via form lengkap</Link>
                </p>
              )}
              <button
                className="btn btn--accent btn--block btn--lg"
                onClick={submitApplication}
                disabled={applyPending || (!cvFile && !user?.resumeUrl)}
              >
                {applyPending ? 'Mengirim...' : 'Kirim Lamaran'}
              </button>
          </div>
        )}
      </Modal>

      <style>{`@media(max-width:768px){.job-sticky-sidebar{position:static!important;}}`}</style>
    </>
  )
}
