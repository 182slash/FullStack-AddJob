import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowLeft, Save } from 'lucide-react'
import { useJob, useUpdateJob, useSkills } from '@/hooks/useJobs'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/common/Input'
import Badge from '@/components/common/Badge'
import { JOB_TYPE_LABELS } from '@/utils/formatters'

const CATEGORIES = ['Teknologi Informasi','Marketing & Sales','Keuangan & Akuntansi','HR & Rekrutmen','Desain & Kreatif','Operasional','Legal','Kesehatan','Pendidikan','Lainnya']
const WORK_MODES = [{ value:'onsite', label:'Onsite', desc:'Bekerja di kantor' }, { value:'remote', label:'Remote', desc:'Bekerja dari mana saja' }, { value:'hybrid', label:'Hybrid', desc:'Campuran onsite & remote' }]
const EXPERIENCE_OPTS = [{ value:'fresh', label:'Fresh Graduate' }, { value:'1-2', label:'1 – 2 Tahun' }, { value:'3-5', label:'3 – 5 Tahun' }, { value:'5+', label:'5+ Tahun' }]

export default function EditJob() {
  const { jobId } = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { data: job, isLoading } = useJob(jobId)
  const { mutate: updateJob, isPending } = useUpdateJob()
  const { data: skillsData } = useSkills()

  const [success, setSuccess]           = useState(false)
  const [negotiable, setNegotiable]     = useState(false)
  const [skills, setSkills]             = useState([])
  const [skillInput, setSkillInput]     = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [initialized, setInitialized]   = useState(false)

  const { register, handleSubmit, watch, reset, formState:{ errors } } = useForm({
    defaultValues: {
      title:'', category:'', type:'fulltime', location:'', workMode:'onsite',
      salaryMin:'', salaryMax:'', description:'', requirements:'', benefits:'',
      deadline:'', slots:1, isUrgent:false, experience:'',
    }
  })

  // Populate form once job data loads
  useEffect(() => {
    if (job && !initialized) {
      reset({
        title:        job.title || '',
        category:     job.category || '',
        type:         job.type || 'fulltime',
        location:     job.location || '',
        workMode:     job.workMode || 'onsite',
        salaryMin:    job.salaryMin || '',
        salaryMax:    job.salaryMax || '',
        description:  job.description || '',
        requirements: job.requirements || '',
        benefits:     job.benefits || '',
        deadline:     job.deadline ? job.deadline.split('T')[0] : '',
        slots:        job.slots || 1,
        isUrgent:     job.isUrgent || false,
        experience:   job.experience || '',
      })
      setSkills(job.skills || [])
      setNegotiable(job.isNegotiable || (!job.salaryMin && !job.salaryMax))
      setInitialized(true)
    }
  }, [job, initialized, reset])

  const skillSuggestions = skillsData?.filter(s =>
    skillInput.trim().length > 0 &&
    s.toLowerCase().includes(skillInput.toLowerCase()) &&
    !skills.includes(s)
  ) || []

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
    updateJob({ id: jobId, data: payload }, {
      onSuccess: () => setSuccess(true),
      onError: (e) => console.error(e),
    })
  }

  if (isLoading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--accent-light)', borderTopColor:'var(--primary)', animation:'spin 0.8s linear infinite' }}/>
    </div>
  )

  if (success) return (
    <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
      style={{ maxWidth:480, margin:'60px auto', textAlign:'center', padding:'40px 32px', background:'var(--card)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)' }}>
      <div style={{ width:80, height:80, background:'var(--success-light)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', color:'var(--success)' }}>
        <CheckCircle2 size={40}/>
      </div>
      <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.625rem', marginBottom:12 }}>Lowongan Diperbarui!</h2>
      <p style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:28 }}>
        Perubahan pada lowongan <strong>{job?.title}</strong> berhasil disimpan.
      </p>
      <div style={{ display:'flex', gap:12 }}>
        <button className="btn btn--secondary" style={{ flex:1 }} onClick={()=>navigate('/employer/jobs')}>Kelola Lowongan</button>
        <button className="btn btn--primary" style={{ flex:1 }} onClick={()=>setSuccess(false)}>Edit Lagi</button>
      </div>
    </motion.div>
  )

  const values = watch()

  return (
    <div style={{ maxWidth:720, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
        <button className="btn btn--ghost btn--icon" onClick={()=>navigate('/employer/jobs')}>
          <ArrowLeft size={18}/>
        </button>
        <div>
          <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:4 }}>Edit Lowongan</h1>
          <p style={{ color:'var(--muted)' }}>Perbarui informasi lowongan yang sudah dipasang.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)}>
        <div className="card card-body" style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:20 }}>
          <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.125rem', marginBottom:4 }}>Informasi Dasar</h2>

          <Input label="Judul Posisi" placeholder="e.g. Senior React Developer" {...register('title')} error={errors.title?.message} required/>

          <div className="form-group">
            <label className="form-label">Kategori <span style={{ color:'var(--error)' }}>*</span></label>
            <select className="form-input" {...register('category')}>
              <option value="">Pilih kategori...</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
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
        </div>

        <div className="card card-body" style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:20 }}>
          <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.125rem', marginBottom:4 }}>Detail Pekerjaan</h2>

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
            <textarea className="rich-textarea" rows={7} placeholder="Jelaskan tanggung jawab, lingkup kerja..." {...register('description')}/>
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
        </div>

        <div className="card card-body" style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:24 }}>
          <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.125rem', marginBottom:4 }}>Pengaturan Lamaran</h2>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Batas Akhir Lamaran</label>
              <input type="date" className="form-input" {...register('deadline')} min={new Date().toISOString().split('T')[0]}/>
            </div>
            <div className="form-group">
              <label className="form-label">Jumlah Posisi Dibuka</label>
              <input type="number" className="form-input" min={1} max={999} {...register('slots')}/>
            </div>
          </div>

          <div className="form-group">
            <label className="filter-checkbox" style={{ marginBottom:0 }}>
              <input type="checkbox" {...register('isUrgent')} style={{ accentColor:'var(--primary)' }}/>
              <div>
                <p style={{ fontWeight:600 }}>Tandai sebagai Urgent 🔥</p>
                <p style={{ fontSize:'0.8125rem', color:'var(--muted)' }}>Lowongan akan muncul dengan label "Urgent"</p>
              </div>
            </label>
          </div>
        </div>

        <div style={{ display:'flex', gap:12 }}>
          <button type="button" className="btn btn--secondary" onClick={()=>navigate('/employer/jobs')}>
            <ArrowLeft size={16}/> Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={isPending} style={{ flex:1 }}>
            {isPending ? 'Menyimpan...' : <><Save size={16}/> Simpan Perubahan</>}
          </button>
        </div>
      </form>
    </div>
  )
}