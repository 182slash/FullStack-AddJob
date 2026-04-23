import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowLeft, ArrowRight, Eye, Send } from 'lucide-react'
import { useCreateJob, useCategories, useSkills } from '@/hooks/useJobs'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/common/Input'
import Badge from '@/components/common/Badge'
import { JOB_TYPE_LABELS } from '@/utils/formatters'
import { jobPostSchema } from '@/utils/validators'

const STEPS = ['Informasi Lowongan', 'Detail Pekerjaan', 'Pengaturan & Publikasi']
const CATEGORIES = ['Teknologi Informasi','Marketing & Sales','Keuangan & Akuntansi','HR & Rekrutmen','Desain & Kreatif','Operasional','Legal','Kesehatan','Pendidikan','Konstruksi','Retail','Lainnya']
const WORK_MODES = [{ value:'onsite', label:'Onsite', desc:'Bekerja di kantor' }, { value:'remote', label:'Remote', desc:'Bekerja dari mana saja' }, { value:'hybrid', label:'Hybrid', desc:'Campuran onsite & remote' }]
const EXPERIENCE_OPTS = [{ value:'fresh', label:'Fresh Graduate' }, { value:'1-2', label:'1 – 2 Tahun' }, { value:'3-5', label:'3 – 5 Tahun' }, { value:'5+', label:'5+ Tahun' }]

export default function PostJob() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mutate: createJob, isPending } = useCreateJob()
  const [jobLimitError, setJobLimitError] = useState('')
  const { data: catData } = useCategories()
  const { data: skillsData } = useSkills()
  const [step, setStep] = useState(1)
  const [preview, setPreview] = useState(false)
  const [success, setSuccess] = useState(false)
  const [negotiable, setNegotiable] = useState(false)
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    setSuccess(false)
    setStep(1)
  }, [])

  const skillSuggestions = skillsData?.filter(s =>
    skillInput.trim().length > 0 &&
    s.toLowerCase().includes(skillInput.toLowerCase()) &&
    !skills.includes(s)
  ) || []

  const { register, handleSubmit, watch, formState:{ errors }, trigger, getValues } = useForm({
    defaultValues: {
      title:'', category:'', type:'fulltime', location:'', workMode:'onsite',
      salaryMin:'', salaryMax:'', description:'', requirements:'', benefits:'',
      deadline:'', slots:1, isUrgent:false,
    }
  })

  const values = watch()

  const nextStep = async () => {
    const fields = step===1
      ? ['title','category','type','location']
      : step===2 ? ['description'] : []
    const ok = await trigger(fields)
    if (ok) setStep(s => s+1)
  }

  const addSkill = (e) => {
    if ((e.key==='Enter'||e.key===',') && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) setSkills(s=>[...s, skillInput.trim()])
      setSkillInput('')
      setShowSuggestions(false)
    }
  }

  const submit = (data) => {
    const payload = {
      ...data,
      salaryMin: negotiable ? undefined : Number(data.salaryMin)||undefined,
      salaryMax: negotiable ? undefined : Number(data.salaryMax)||undefined,
      remote: data.workMode==='remote',
      skills,
      slots: Number(data.slots)||1,
    }
    createJob(payload, {
      onSuccess: () => setSuccess(true),
      onError: (e) => {
        const msg = e.response?.data?.message || 'Gagal mempublikasikan lowongan.'
        setJobLimitError(msg)
      },
    })
  }

  if (success) return (
    <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
      style={{ maxWidth:480, margin:'60px auto', textAlign:'center', padding:'40px 32px', background:'var(--card)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)' }}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', delay:0.2 }}>
        <div style={{ width:80, height:80, background:'var(--success-light)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', color:'var(--success)' }}>
          <CheckCircle2 size={40}/>
        </div>
      </motion.div>
      <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.625rem', marginBottom:12 }}>Lowongan Dipublikasikan!</h2>
      <p style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:28 }}>
        Lowongan <strong>{values.title}</strong> berhasil dipasang. Pelamar sudah bisa melihat dan melamar sekarang.
      </p>
      <div style={{ display:'flex', gap:12 }}>
        <button className="btn btn--secondary" style={{ flex:1 }} onClick={()=>navigate('/employer/jobs')}>Kelola Lowongan</button>
        <button className="btn btn--primary" style={{ flex:1 }} onClick={()=>{ setSuccess(false); setStep(1) }}>Pasang Lagi</button>
      </div>
    </motion.div>
  )

  return (
    <div style={{ maxWidth:720, margin:'0 auto' }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:4 }}>Pasang Lowongan</h1>
        <p style={{ color:'var(--muted)' }}>Isi form berikut untuk mempublikasikan lowongan kerja.</p>
      </div>

      {jobLimitError && (
        <div style={{ background:'var(--error-light)', border:'1px solid var(--error)', borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
          <p style={{ color:'var(--error)', fontSize:'0.875rem', fontWeight:600, margin:0 }}>⚠️ {jobLimitError}</p>
          <div style={{ display:'flex', gap:8, flexShrink:0 }}>
            <Link to="/employer/subscription" className="btn btn--danger btn--sm">Upgrade Paket</Link>
            <button className="btn btn--ghost btn--sm" onClick={() => setJobLimitError('')}>✕</button>
          </div>
        </div>
      )}

      {/* Step Wizard */}
      <div className="step-wizard" style={{ marginBottom:36 }}>
        {STEPS.map((label, i) => {
          const n = i+1
          const done = n < step
          const active = n === step
          return (
            <div key={n} className="step-wizard__item">
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div className={`step-wizard__circle ${active?'step-wizard__circle--active':done?'step-wizard__circle--done':''}`}>
                  {done ? '✓' : n}
                </div>
                <span className={`step-wizard__label ${active?'step-wizard__label--active':''}`}>{label}</span>
              </div>
              {i < STEPS.length-1 && <div className={`step-wizard__line ${done?'step-wizard__line--done':''}`}/>}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit(submit)}>
        <AnimatePresence mode="wait">
          {step===1 && (
            <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              className="card card-body" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.125rem', marginBottom:4 }}>Informasi Dasar</h2>

              <Input label="Judul Posisi" placeholder="e.g. Senior React Developer" {...register('title')} error={errors.title?.message} required/>

              <div className="form-group">
                <label className="form-label">Kategori <span style={{ color:'var(--error)' }}>*</span></label>
                <select className="form-input" {...register('category')}>
                  <option value="">Pilih kategori...</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="form-error">{errors.category.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Tipe Pekerjaan <span style={{ color:'var(--error)' }}>*</span></label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  {Object.entries(JOB_TYPE_LABELS).map(([val,label])=>(
                    <label key={val} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:99, border:`1.5px solid ${watch('type')===val?'var(--primary)':'var(--border)'}`, background:watch('type')===val?'var(--accent-light)':'transparent', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, color:watch('type')===val?'var(--primary)':'var(--dark)' }}>
                      <input type="radio" style={{ display:'none' }} value={val} {...register('type')}/>{label}
                    </label>
                  ))}
                </div>
              </div>

              <Input label="Lokasi" placeholder="e.g. Jakarta Selatan" {...register('location')} error={errors.location?.message} required/>

              <div className="form-group">
                <label className="form-label">Mode Kerja</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {WORK_MODES.map(m=>(
                    <label key={m.value} style={{ padding:'12px 14px', borderRadius:'var(--radius)', border:`1.5px solid ${watch('workMode')===m.value?'var(--primary)':'var(--border)'}`, background:watch('workMode')===m.value?'var(--accent-light)':'var(--card)', cursor:'pointer', textAlign:'center' }}>
                      <input type="radio" style={{ display:'none' }} value={m.value} {...register('workMode')}/>
                      <p style={{ fontWeight:700, fontSize:'0.9rem', color:watch('workMode')===m.value?'var(--primary)':'var(--dark)' }}>{m.label}</p>
                      <p style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>{m.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Level Pengalaman</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  {EXPERIENCE_OPTS.map(e=>(
                    <label key={e.value} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:99, border:`1.5px solid ${watch('experience')===e.value?'var(--primary)':'var(--border)'}`, background:watch('experience')===e.value?'var(--accent-light)':'transparent', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, color:watch('experience')===e.value?'var(--primary)':'var(--dark)' }}>
                      <input type="radio" style={{ display:'none' }} value={e.value} {...register('experience')}/>{e.label}
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step===2 && (
            <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              className="card card-body" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.125rem', marginBottom:4 }}>Detail Pekerjaan</h2>

              {/* Salary */}
              <div className="form-group">
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <label className="form-label" style={{ margin:0 }}>Gaji (IDR / bulan)</label>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.875rem', cursor:'pointer' }}>
                    <input type="checkbox" checked={negotiable} onChange={e=>setNegotiable(e.target.checked)} style={{ accentColor:'var(--primary)' }}/>
                    Nego / Tidak dicantumkan
                  </label>
                </div>
                {!negotiable && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <Input placeholder="Minimum (e.g. 5000000)" {...register('salaryMin')} label="Minimum"/>
                    <Input placeholder="Maksimum (e.g. 10000000)" {...register('salaryMax')} label="Maksimum"/>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Pekerjaan <span style={{ color:'var(--error)' }}>*</span></label>
                <textarea className="rich-textarea" rows={7} placeholder="Jelaskan tanggung jawab, lingkup kerja, dan hal-hal menarik dari posisi ini..." {...register('description')}/>
                {errors.description && <p className="form-error">{errors.description.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Persyaratan</label>
                <textarea className="rich-textarea" rows={5} placeholder="Pendidikan, pengalaman, keahlian yang dibutuhkan..." {...register('requirements')}/>
              </div>

              <div className="form-group">
                <label className="form-label">Benefit & Fasilitas</label>
                <textarea className="rich-textarea" rows={4} placeholder="BPJS, asuransi, tunjangan transport, laptop, dll..." {...register('benefits')}/>
              </div>

              <div className="form-group" style={{ position:'relative' }}>
                <label className="form-label">Skills yang Dibutuhkan</label>
                <div className="tag-input-wrap" onClick={e=>e.currentTarget.querySelector('input').focus()}>
                  {skills.map(s=>(
                    <span key={s} className="tag-item">{s}<button type="button" onClick={()=>setSkills(sk=>sk.filter(x=>x!==s))}>×</button></span>
                  ))}
                  <input className="tag-input" placeholder="Ketik skill + Enter..." value={skillInput}
                    onChange={e=>{ setSkillInput(e.target.value); setShowSuggestions(true) }}
                    onKeyDown={addSkill}
                    onBlur={()=>setTimeout(()=>setShowSuggestions(false), 150)}
                  />
                </div>
                {showSuggestions && skillSuggestions.length > 0 && (
                  <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-md)', zIndex:100, maxHeight:200, overflowY:'auto' }}>
                    {skillSuggestions.map(s=>(
                      <div key={s}
                        onMouseDown={()=>{ if(!skills.includes(s)) setSkills(sk=>[...sk,s]); setSkillInput(''); setShowSuggestions(false) }}
                        style={{ padding:'8px 14px', cursor:'pointer', fontSize:'0.9rem', color:'var(--dark)' }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--accent-light)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                      >{s}</div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step===3 && (
            <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              className="card card-body" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.125rem', marginBottom:4 }}>Pengaturan Lamaran</h2>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="form-group">
                  <label className="form-label">Batas Akhir Lamaran</label>
                  <input type="date" className="form-input" {...register('deadline')} min={new Date().toISOString().split('T')[0]}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah Posisi Dibuka</label>
                  <input type="number" className="form-input" min={1} max={999} {...register('slots')} defaultValue={1}/>
                </div>
              </div>

              <div className="form-group">
                <label className="filter-checkbox" style={{ marginBottom:0 }}>
                  <input type="checkbox" {...register('isUrgent')} style={{ accentColor:'var(--primary)' }}/>
                  <div>
                    <p style={{ fontWeight:600 }}>Tandai sebagai Urgent 🔥</p>
                    <p style={{ fontSize:'0.8125rem', color:'var(--muted)' }}>Lowongan akan muncul dengan label "Urgent" untuk menarik lebih banyak pelamar</p>
                  </div>
                </label>
              </div>

              {/* Preview */}
              {preview && (
                <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:20, border:'1.5px solid var(--border)' }}>
                  <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.9375rem', marginBottom:12 }}>Preview Lowongan</p>
                  <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.375rem' }}>{values.title}</h3>
                  <p style={{ color:'var(--muted)', fontSize:'0.875rem', marginTop:4, marginBottom:12 }}>{user?.company?.name} · {values.location}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                    {values.type && <Badge variant="primary">{JOB_TYPE_LABELS[values.type]}</Badge>}
                    {values.category && <Badge variant="muted">{values.category}</Badge>}
                    {values.isUrgent && <Badge variant="error">🔥 Urgent</Badge>}
                  </div>
                  {values.description && (
                    <p style={{ color:'var(--dark)', fontSize:'0.875rem', lineHeight:1.7, maxHeight:80, overflow:'hidden' }}>
                      {values.description.slice(0,200)}...
                    </p>
                  )}
                </div>
              )}

              <button type="button" className="btn btn--secondary btn--sm" style={{ alignSelf:'flex-start' }} onClick={()=>setPreview(v=>!v)}>
                <Eye size={14}/> {preview?'Sembunyikan':'Lihat'} Preview
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:24 }}>
          <button type="button" className="btn btn--secondary" onClick={()=>step>1?setStep(s=>s-1):undefined} disabled={step===1} style={{ opacity:step===1?0.4:1 }}>
            <ArrowLeft size={16}/> Sebelumnya
          </button>
          {step < 3 ? (
            <button type="button" className="btn btn--primary" onClick={nextStep}>
              Selanjutnya <ArrowRight size={16}/>
            </button>
          ) : (
            <button type="submit" className="btn btn--accent" disabled={isPending}>
              {isPending ? 'Mempublikasikan...' : <><Send size={16}/> Publikasikan</>}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}