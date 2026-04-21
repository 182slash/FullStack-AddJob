import { useState, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Plus, Trash2, Save, CheckCircle2, Upload } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'
import { seekerProfileSchema } from '@/utils/validators'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Avatar from '@/components/common/Avatar'
import ResumeUpload from '@/components/seeker/ResumeUpload'

const SKILL_SUGGESTIONS = ['React','Node.js','Python','SQL','JavaScript','TypeScript','UI/UX','Figma','Excel','Marketing','SEO','Project Management','Leadership','Communication']

export default function SeekerProfile() {
  const { user, updateUser } = useAuth()
  const qc = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState(user?.skills || [])
  const fileRef = useRef()

  const { register, handleSubmit, formState:{ errors, isDirty }, reset } = useForm({
    resolver: zodResolver(seekerProfileSchema),
    defaultValues: {
      name: user?.name||'', phone:user?.phone||'', location:user?.location||'',
      bio: user?.bio||'', headline:user?.headline||'', website:user?.website||'',
      linkedin:user?.linkedin||'', github:user?.github||'',
    }
  })

  const eduForm = useForm({ defaultValues:{ education: user?.education||[] } })
  const { fields:eduFields, append:appendEdu, remove:removeEdu } = useFieldArray({ control:eduForm.control, name:'education' })

  const expForm = useForm({ defaultValues:{ experience: user?.experience||[] } })
  const { fields:expFields, append:appendExp, remove:removeExp } = useFieldArray({ control:expForm.control, name:'experience' })

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: data => authService.updateProfile({ ...data, skills }).then(r=>r.data),
    onSuccess: data => {
      updateUser(data.data)
      qc.invalidateQueries({ queryKey:['auth','me'] })
      setSaved(true); setTimeout(()=>setSaved(false),3000)
    }
  })

  const { mutate: uploadAvatar } = useMutation({
    mutationFn: fd => authService.uploadAvatar(fd).then(r=>r.data),
    onSuccess: data => updateUser({ avatar: data.data.avatar })
  })

  const handleAvatarChange = e => {
    const f = e.target.files[0]; if(!f) return
    const fd = new FormData(); fd.append('avatar', f)
    uploadAvatar(fd)
  }

  const addSkill = s => {
    if(s && !skills.includes(s)) setSkills(prev=>[...prev, s])
    setSkillInput('')
  }

  const removeSkill = s => setSkills(prev=>prev.filter(x=>x!==s))

  const TABS = [
    { id:'personal', label:'Info Pribadi' },
    { id:'education', label:'Pendidikan' },
    { id:'experience', label:'Pengalaman' },
    { id:'skills', label:'Keahlian' },
    { id:'resume', label:'CV / Resume' },
  ]

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:4 }}>Profil Saya</h1>
        <p style={{ color:'var(--muted)' }}>Lengkapi profil untuk meningkatkan peluang diterima.</p>
      </div>

      {/* Avatar */}
      <div className="card card-body" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <Avatar name={user?.name} src={user?.avatar} size="2xl"/>
            <button onClick={()=>fileRef.current.click()} style={{ position:'absolute', bottom:0, right:0, width:32, height:32, borderRadius:'50%', background:'var(--primary)', border:'3px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <Camera size={14} style={{ color:'#fff' }}/>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange}/>
          </div>
          <div>
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.25rem' }}>{user?.name}</h3>
            <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>{user?.headline||'Tambahkan headline profil'}</p>
            <div style={{ marginTop:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:'0.8rem', color:'var(--muted)', fontWeight:600 }}>Kelengkapan Profil</span>
                <span style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--primary)' }}>{user?.profileComplete||0}%</span>
              </div>
              <div className="progress-bar" style={{ width:220 }}>
                <div className="progress-bar__fill" style={{ width:`${user?.profileComplete||0}%` }}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:0, overflowX:'auto' }}>
        {TABS.map(t=>(
          <button key={t.id} className={`tab-btn ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}>
          {/* Personal Info */}
          {activeTab==='personal' && (
            <form onSubmit={handleSubmit(saveProfile)} className="card card-body" style={{ marginTop:0, borderTopLeftRadius:0, borderTopRightRadius:0 }}>
              <div className="grid-2" style={{ gap:20, marginBottom:20 }}>
                <Input label="Nama Lengkap" error={errors.name?.message} required {...register('name')}/>
                <Input label="Headline Profil" placeholder="contoh: Front-end Developer" error={errors.headline?.message} {...register('headline')}/>
              </div>
              <div className="grid-2" style={{ gap:20, marginBottom:20 }}>
                <Input label="No. Telepon" placeholder="081234567890" error={errors.phone?.message} {...register('phone')}/>
                <Input label="Domisili" placeholder="Jakarta Selatan" error={errors.location?.message} {...register('location')}/>
              </div>
              <div className="form-group" style={{ marginBottom:20 }}>
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={4} placeholder="Ceritakan tentang diri Anda..." {...register('bio')}/>
              </div>
              <div className="grid-2" style={{ gap:20 }}>
                <Input label="Website" placeholder="https://yourwebsite.com" error={errors.website?.message} {...register('website')}/>
                <Input label="LinkedIn" placeholder="https://linkedin.com/in/username" error={errors.linkedin?.message} {...register('linkedin')}/>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:24, alignItems:'center' }}>
                <Button type="submit" variant="accent" loading={isPending}><Save size={15}/> Simpan Perubahan</Button>
                {saved && <span style={{ display:'flex', alignItems:'center', gap:6, color:'var(--success)', fontWeight:600, fontSize:'0.875rem' }}><CheckCircle2 size={16}/>Tersimpan!</span>}
              </div>
            </form>
          )}

          {/* Education */}
          {activeTab==='education' && (
            <div className="card card-body" style={{ marginTop:0, borderTopLeftRadius:0, borderTopRightRadius:0 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {eduFields.map((field,i)=>(
                  <div key={field.id} style={{ padding:16, borderRadius:'var(--radius)', border:'1.5px solid var(--border-light)', background:'var(--bg)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                      <p style={{ fontFamily:'var(--font-heading)', fontWeight:700 }}>Pendidikan {i+1}</p>
                      <button type="button" onClick={()=>removeEdu(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--error)' }}><Trash2 size={16}/></button>
                    </div>
                    <div className="grid-2" style={{ gap:14 }}>
                      <Input label="Institusi" {...eduForm.register(`education.${i}.school`)}/>
                      <Input label="Gelar/Jenjang" placeholder="S1, D3, SMA..." {...eduForm.register(`education.${i}.degree`)}/>
                      <Input label="Jurusan" {...eduForm.register(`education.${i}.field`)}/>
                      <div className="grid-2" style={{ gap:10 }}>
                        <Input label="Tahun Masuk" type="number" {...eduForm.register(`education.${i}.startYear`,{valueAsNumber:true})}/>
                        <Input label="Tahun Lulus" type="number" {...eduForm.register(`education.${i}.endYear`,{valueAsNumber:true})}/>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn--secondary btn--sm" style={{ alignSelf:'flex-start' }}
                  onClick={()=>appendEdu({school:'',degree:'',field:'',startYear:'',endYear:''})}>
                  <Plus size={14}/> Tambah Pendidikan
                </button>
                <Button variant="accent" onClick={eduForm.handleSubmit(d=>saveProfile(d))} loading={isPending} style={{ alignSelf:'flex-start' }}>
                  <Save size={15}/> Simpan
                </Button>
              </div>
            </div>
          )}

          {/* Experience */}
          {activeTab==='experience' && (
            <div className="card card-body" style={{ marginTop:0, borderTopLeftRadius:0, borderTopRightRadius:0 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {expFields.map((field,i)=>(
                  <div key={field.id} style={{ padding:16, borderRadius:'var(--radius)', border:'1.5px solid var(--border-light)', background:'var(--bg)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                      <p style={{ fontFamily:'var(--font-heading)', fontWeight:700 }}>Pengalaman {i+1}</p>
                      <button type="button" onClick={()=>removeExp(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--error)' }}><Trash2 size={16}/></button>
                    </div>
                    <div className="grid-2" style={{ gap:14 }}>
                      <Input label="Perusahaan" {...expForm.register(`experience.${i}.company`)}/>
                      <Input label="Jabatan" {...expForm.register(`experience.${i}.title`)}/>
                      <Input label="Lokasi" {...expForm.register(`experience.${i}.location`)}/>
                      <div className="grid-2" style={{ gap:10 }}>
  <Input label="Mulai" type="date" {...expForm.register(`experience.${i}.startDate`)}/>
  <Input label="Selesai" type="date" {...expForm.register(`experience.${i}.endDate`)}
    disabled={expForm.watch(`experience.${i}.current`)}/>
</div>
<div style={{ gridColumn:'1/-1', marginTop:8, marginBottom:4 }}>
  <style>{`
    @keyframes ripple-${i} {
      0% { box-shadow: 0 0 0 0 rgba(79,195,247,0.5); }
      100% { box-shadow: 0 0 0 8px rgba(79,195,247,0); }
    }
    @keyframes typing {
      from { opacity: 0; transform: translateX(-6px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    #current-${i}:checked {
      animation: ripple-${i} 0.4s ease-out;
    }
  `}</style>
  <label htmlFor={`current-${i}`} style={{ display:'inline-flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none', padding:'8px 14px', borderRadius:8, border:`1.5px solid ${expForm.watch(`experience.${i}.current`) ? '#4FC3F7' : 'var(--border-light)'}`, background: expForm.watch(`experience.${i}.current`) ? 'rgba(79,195,247,0.08)' : 'transparent', transition:'all 0.2s ease' }}>
    <input
      type="checkbox"
      id={`current-${i}`}
      {...expForm.register(`experience.${i}.current`)}
      onChange={e => {
        expForm.setValue(`experience.${i}.current`, e.target.checked)
        if (e.target.checked) expForm.setValue(`experience.${i}.endDate`, '')
      }}
      style={{ width:18, height:18, accentColor:'#4FC3F7', cursor:'pointer', flexShrink:0 }}
    />
    <span style={{ fontSize:'0.875rem', fontWeight:600, color: expForm.watch(`experience.${i}.current`) ? '#4FC3F7' : 'var(--muted)', animation: expForm.watch(`experience.${i}.current`) ? 'typing 0.25s ease forwards' : 'none', transition:'color 0.2s ease' }}>
      {expForm.watch(`experience.${i}.current`) ? '✓ Masih bekerja di sini' : 'Masih bekerja di sini'}
    </span>
  </label>
</div>
                    </div>
                    <div className="form-group" style={{ marginTop:12 }}>
                      <label className="form-label">Deskripsi</label>
                      <textarea className="form-input" rows={3} {...expForm.register(`experience.${i}.desc`)}/>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn--secondary btn--sm" style={{ alignSelf:'flex-start' }}
  onClick={()=>appendExp({company:'',title:'',location:'',startDate:'',endDate:'',current:false,desc:''})}>
  <Plus size={14}/> Tambah Pengalaman
</button>
                <Button variant="accent" onClick={expForm.handleSubmit(d=>saveProfile(d))} loading={isPending} style={{ alignSelf:'flex-start' }}>
                  <Save size={15}/> Simpan
                </Button>
              </div>
            </div>
          )}

          {/* Skills */}
          {activeTab==='skills' && (
            <div className="card card-body" style={{ marginTop:0, borderTopLeftRadius:0, borderTopRightRadius:0 }}>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                <input className="form-input" placeholder="Tambah keahlian..." value={skillInput} onChange={e=>setSkillInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addSkill(skillInput.trim()) }}}
                  style={{ flex:1 }}/>
                <button className="btn btn--primary btn--sm" onClick={()=>addSkill(skillInput.trim())}>Tambah</button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {skills.map(s=>(
                  <span key={s} className="badge badge--primary" style={{ gap:6, cursor:'pointer' }} onClick={()=>removeSkill(s)}>
                    {s} <span style={{ fontSize:10 }}>×</span>
                  </span>
                ))}
                {skills.length===0 && <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>Belum ada keahlian ditambahkan.</p>}
              </div>
              <p style={{ fontSize:'0.875rem', color:'var(--muted)', marginBottom:10 }}>Saran:</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {SKILL_SUGGESTIONS.filter(s=>!skills.includes(s)).map(s=>(
                  <button key={s} className="badge badge--muted" style={{ cursor:'pointer', border:'none' }} onClick={()=>addSkill(s)}><Plus size={11}/>{s}</button>
                ))}
              </div>
              <Button variant="accent" onClick={()=>saveProfile({})} loading={isPending} style={{ alignSelf:'flex-start' }}>
                <Save size={15}/> Simpan Keahlian
              </Button>
            </div>
          )}

          {/* Resume */}
          {activeTab==='resume' && (
            <div className="card card-body" style={{ marginTop:0, borderTopLeftRadius:0, borderTopRightRadius:0 }}>
              <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, marginBottom:8 }}>Upload CV / Resume</h3>
              <p style={{ color:'var(--muted)', fontSize:'0.875rem', marginBottom:20 }}>CV Anda akan digunakan saat melamar pekerjaan. Format: PDF, DOC, DOCX. Maks 5MB.</p>
              <ResumeUpload currentResume={user?.resumeUrl}
                onFileSelect={f=>{ if(!f) return; const fd=new FormData(); fd.append('resume',f); saveProfile(fd) }}/>
              {user?.resumeUrl && (
                <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm" style={{ marginTop:16 }}>
                  <Upload size={14}/> Lihat CV Saat Ini
                </a>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
