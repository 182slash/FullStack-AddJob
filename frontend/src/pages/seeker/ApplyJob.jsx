import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowLeft, Upload, MapPin, Briefcase } from 'lucide-react'
import { useJob } from '@/hooks/useJobs'
import { useApplyToJob } from '@/hooks/useApplications'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/common/Input'
import ResumeUpload from '@/components/seeker/ResumeUpload'
import { formatSalaryRange, JOB_TYPE_LABELS } from '@/utils/formatters'

const EDUCATION_OPTIONS = ['SMA/SMK','D1/D2/D3','S1','S2','S3']
const SKILL_OPTIONS = ['JavaScript','React','Node.js','Python','Java','PHP','SQL','Excel','Leadership','Communication','Project Management','UI/UX Design','Marketing','Sales']

export default function ApplyJob() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: jobData, isLoading: jobLoading } = useJob(jobId)
  const { mutate: applyJob, isPending } = useApplyToJob()
  const [cvFile, setCvFile] = useState(null)
  const [skills, setSkills] = useState(user?.skills||[])
  const [coverLetter, setCoverLetter] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: user?.name||'',
    email: user?.email||'',
    phone: user?.phone||'',
    city: user?.location||'',
    address: '',
    education: user?.education?.[0]?.degree||'S1',
  })

  const job = jobData?.data || jobData

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    if (cvFile) fd.append('resume', cvFile)
    fd.append('coverLetter', coverLetter)
    Object.entries(form).forEach(([k,v])=>fd.append(k,v))
    fd.append('skills', JSON.stringify(skills))
    applyJob({ jobId, formData:fd }, { onSuccess:()=>setSuccess(true) })
  }

  if (jobLoading) return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <div className="skeleton" style={{ height:140, borderRadius:12, marginBottom:20 }}/>
      <div className="skeleton" style={{ height:400, borderRadius:12 }}/>
    </div>
  )

  if (success) return (
    <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
      style={{ maxWidth:480, margin:'60px auto', textAlign:'center', padding:'40px 32px', background:'var(--card)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)' }}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', delay:0.2 }}>
        <div style={{ width:80, height:80, background:'var(--success-light)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', color:'var(--success)' }}>
          <CheckCircle2 size={40}/>
        </div>
      </motion.div>
      <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.625rem', marginBottom:12 }}>Lamaran Terkirim!</h2>
      <p style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:8 }}>
        Lamaran untuk <strong>{job?.title}</strong> di <strong>{job?.company?.name}</strong> telah berhasil dikirim.
      </p>
      <p style={{ color:'var(--muted)', fontSize:'0.875rem', marginBottom:28 }}>
        Kami akan mengirim notifikasi ke <strong>{user?.email}</strong> jika ada update dari perekrut.
      </p>
      <div style={{ display:'flex', gap:12 }}>
        <Link to="/seeker/applications" className="btn btn--primary" style={{ flex:1 }}>Lihat Lamaran Saya</Link>
        <Link to="/jobs" className="btn btn--secondary" style={{ flex:1 }}>Cari Lowongan Lain</Link>
      </div>
    </motion.div>
  )

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <button onClick={()=>navigate(-1)} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--muted)', background:'none', border:'none', cursor:'pointer', marginBottom:20, fontSize:'0.9rem' }}>
        <ArrowLeft size={15}/> Kembali
      </button>

      {/* Job summary card */}
      {job && (
        <div className="card card-body" style={{ display:'flex', gap:14, marginBottom:24, background:'linear-gradient(135deg,#f0f7ff,#fff)' }}>
          <div style={{ width:56, height:56, borderRadius:12, background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {job.company?.logo
              ? <img src={job.company.logo} alt="" style={{ width:44, height:44, objectFit:'contain' }}/>
              : <Briefcase size={24} style={{ color:'var(--primary)' }}/>
            }
          </div>
          <div>
            <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.125rem' }}>{job.title}</h2>
            <p style={{ fontSize:'0.875rem', color:'var(--muted)' }}>
              {job.company?.name} · <MapPin size={11} style={{ verticalAlign:'middle' }}/> {job.location}
              {job.salaryMin || job.salaryMax ? ` · 💰 ${formatSalaryRange(job.salaryMin, job.salaryMax)}` : ''}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Data Pribadi</p>
          </div>
          <div className="profile-section__body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Input label="Nama Lengkap" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required style={{ gridColumn:'span 2' }}/>
            <Input label="Email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/>
            <Input label="No. Telepon" type="tel" placeholder="+62..." value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} required/>
            <Input label="Kota Asal" placeholder="Jakarta" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))}/>
            <Input label="Alamat Domisili" placeholder="Jl. ..." value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>

            <div className="form-group" style={{ margin:0, gridColumn:'span 2' }}>
              <label className="form-label">Pendidikan Terakhir</label>
              <select className="form-input" value={form.education} onChange={e=>setForm(f=>({...f,education:e.target.value}))}>
                {EDUCATION_OPTIONS.map(e=><option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Skills yang Relevan</p>
          </div>
          <div className="profile-section__body">
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {SKILL_OPTIONS.map(s => (
                <button key={s} type="button"
                  style={{ padding:'6px 14px', borderRadius:99, border:`1.5px solid ${skills.includes(s)?'var(--primary)':'var(--border)'}`, background:skills.includes(s)?'var(--accent-light)':'transparent', color:skills.includes(s)?'var(--primary)':'var(--dark)', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                  onClick={()=>setSkills(sk=>sk.includes(s)?sk.filter(x=>x!==s):[...sk,s])}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CV Upload */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Upload CV / Resume</p>
          </div>
          <div className="profile-section__body">
            <ResumeUpload onFileSelect={setCvFile} currentResume={user?.resumeUrl}/>
            {!cvFile && !user?.resumeUrl && (
              <p style={{ fontSize:'0.8125rem', color:'var(--error)', marginTop:8 }}>CV wajib dilampirkan untuk melamar.</p>
            )}
          </div>
        </div>

        {/* Cover Letter */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Cover Letter <span style={{ fontWeight:400, color:'var(--muted)', fontSize:'0.875rem' }}>(Opsional)</span></p>
          </div>
          <div className="profile-section__body">
            <textarea className="rich-textarea" rows={6}
              placeholder="Perkenalkan diri Anda dan jelaskan mengapa Anda cocok untuk posisi ini. Ceritakan pencapaian yang relevan..."
              value={coverLetter} onChange={e=>setCoverLetter(e.target.value)}/>
            <p style={{ fontSize:'0.8125rem', color:'var(--muted)', marginTop:6 }}>{coverLetter.length}/1000 karakter</p>
          </div>
        </div>

        <button type="submit" className="btn btn--accent btn--block btn--lg" style={{ fontSize:'1rem', padding:'14px' }}
          disabled={isPending || (!cvFile && !user?.resumeUrl)}>
          {isPending ? 'Mengirim Lamaran...' : '📤 Kirim Lamaran Sekarang'}
        </button>
        <p style={{ textAlign:'center', fontSize:'0.8125rem', color:'var(--muted)', marginTop:12 }}>
          Dengan mengirim lamaran, Anda menyetujui <Link to="/terms" style={{ color:'var(--primary)' }}>Syarat & Ketentuan</Link> AddJob.
        </p>
      </form>
    </div>
  )
}
