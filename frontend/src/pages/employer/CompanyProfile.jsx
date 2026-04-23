import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Camera, Save, CheckCircle2, Building2, Globe, Linkedin, Twitter, Instagram, Upload, FileText, Trash2, ExternalLink } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import Input from '@/components/common/Input'

const INDUSTRIES = ['Teknologi','E-Commerce','Keuangan','Perbankan','Manufaktur','Pendidikan','Kesehatan','Media','Konsultan','Ritel','Logistik','Startup','Pemerintah','NGO','Lainnya']
const COMPANY_SIZES = ['1-10','11-50','51-200','201-500','500+']
const COMPANY_TYPES = [{ value:'PT', label:'PT (Perseroan Terbatas)' }, { value:'CV', label:'CV' }, { value:'Firma', label:'Firma' }, { value:'Perseorangan', label:'Perseorangan' }, { value:'UMKM', label:'UMKM' }]

const DOCUMENTS = [
  { key: 'nib_doc',  label: 'Upload NIB',                        required: true,  placeholder: 'Upload Nomor Induk Berusaha' },
  { key: 'sk_doc',   label: 'Upload SK Kemenkumham',             required: false, placeholder: 'Surat Keputusan Kemenkumham (Opsional)' },
  { key: 'akta_doc', label: 'Upload Akta Pendirian Usaha',       required: false, placeholder: 'Akta Pendirian Usaha (Opsional)' },
]

const fetchMyCompany = () => api.get('/companies/employer/me').then(r=>r.data)
const updateCompany  = (data) => api.put('/companies/employer/me', data).then(r=>r.data)
const uploadLogo     = (fd) => api.post('/companies/employer/logo', fd, { headers:{'Content-Type':'multipart/form-data'} }).then(r=>r.data)

export default function CompanyProfile() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const logoRef = useRef()
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [docUploading, setDocUploading] = useState({})
  const [docDeleting, setDocDeleting]   = useState({})

  const { data, isLoading } = useQuery({ queryKey:['myCompany'], queryFn:fetchMyCompany })
  const company = data?.data || data || {}

  const { register, handleSubmit, watch, reset, formState:{ errors, isDirty } } = useForm({
    defaultValues: {
      name: '', industry: '', size: '', type: '',
      website: '', location: '', description: '', culture: '',
      linkedin: '', twitter: '', instagram: '',
      nib: '', npwp: '', email: '', phone: '',
    }
  })

  useEffect(() => {
    if (!company?.name) return
    reset({
      name: company.name||'',
      industry: company.industry||'',
      size: company.size||'',
      type: company.type||'',
      website: company.website||'',
      location: company.location||'',
      description: company.description||'',
      culture: company.culture||'',
      linkedin: company.socialMedia?.linkedin||'',
      twitter: company.socialMedia?.twitter||'',
      instagram: company.socialMedia?.instagram||'',
      nib:  company.nib||'',
      npwp: company.npwp||'',
      email: company.email||'',
      phone: company.phone||'',
    })
  }, [company?._id])

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => { setSaved(true); setTimeout(()=>setSaved(false),2500) },
  })

  const { mutate: saveLogo, isPending: uploadingLogo } = useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => { qc.invalidateQueries({ queryKey:['myCompany'] }) }
  })

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append('logo', file)
    saveLogo(fd)
  }

  const handleDocUpload = async (docKey, file) => {
    if (!file) return
    setDocUploading(prev => ({ ...prev, [docKey]: true }))
    try {
      const fd = new FormData()
      fd.append('document', file)
      await api.post(`/companies/employer/documents/${docKey}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      qc.invalidateQueries({ queryKey: ['myCompany'] })
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setDocUploading(prev => ({ ...prev, [docKey]: false }))
    }
  }

  const handleDocDelete = async (docKey) => {
    setDocDeleting(prev => ({ ...prev, [docKey]: true }))
    try {
      await api.delete(`/companies/employer/documents/${docKey}`)
      qc.invalidateQueries({ queryKey: ['myCompany'] })
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDocDeleting(prev => ({ ...prev, [docKey]: false }))
    }
  }

  const onSubmit = (data) => {
    const { linkedin, twitter, instagram, ...rest } = data
    save({ ...rest, socialMedia:{ linkedin, twitter, instagram } })
  }

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {Array(3).fill(0).map((_,i)=>(
        <div key={i} className="card card-body">
          <div className="skeleton skeleton--title" style={{ width:'40%', marginBottom:20 }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {Array(3).fill(0).map((_,j)=><div key={j} className="skeleton" style={{ height:46, borderRadius:'var(--radius)' }}/>)}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:4 }}>Profil Perusahaan</h1>
        <p style={{ color:'var(--muted)' }}>Informasi perusahaan yang tampil kepada calon pelamar.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Logo */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Logo Perusahaan</p>
          </div>
          <div className="profile-section__body">
            <div style={{ display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:100, height:100, borderRadius:'var(--radius-md)', border:'1.5px solid var(--border)', background:'var(--bg-alt)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {(logoPreview || company.logo)
                    ? <img src={logoPreview||company.logo} alt="Logo" style={{ width:'100%', height:'100%', objectFit:'contain', padding:6 }}/>
                    : <Building2 size={36} style={{ color:'var(--muted-light)' }}/>
                  }
                </div>
                <button type="button" onClick={()=>logoRef.current?.click()}
                  style={{ position:'absolute', bottom:-6, right:-6, width:30, height:30, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff', cursor:'pointer' }}>
                  <Camera size={14}/>
                </button>
                <input ref={logoRef} type="file" style={{ display:'none' }} accept="image/*" onChange={handleLogoChange}/>
              </div>
              <div>
                <p style={{ fontWeight:600, marginBottom:4 }}>Upload Logo</p>
                <p style={{ fontSize:'0.8125rem', color:'var(--muted)', lineHeight:1.6 }}>Format: JPG, PNG, WebP. Ukuran maks. 3MB.<br/>Rekomendasi: 400×400px, background transparan.</p>
                {uploadingLogo && <p style={{ fontSize:'0.8125rem', color:'var(--primary)', marginTop:6 }}>Mengupload...</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Informasi Dasar</p>
          </div>
          <div className="profile-section__body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Input label="Nama Perusahaan" {...register('name')} error={errors.name?.message} required style={{ gridColumn:'span 2' }}/>

            <div className="form-group">
              <label className="form-label">Industri</label>
              <select className="form-input" {...register('industry')}>
                <option value="">Pilih industri...</option>
                {INDUSTRIES.map(i=><option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ukuran Perusahaan</label>
              <select className="form-input" {...register('size')}>
                <option value="">Pilih ukuran...</option>
                {COMPANY_SIZES.map(s=><option key={s} value={s}>{s} karyawan</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipe Perusahaan</label>
              <select className="form-input" {...register('type')}>
                <option value="">Pilih tipe...</option>
                {COMPANY_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <Input label="Lokasi / Kota" placeholder="Jakarta Selatan, DKI Jakarta" {...register('location')}/>
            <Input label="Website" placeholder="https://perusahaan.com" {...register('website')} style={{ gridColumn:'span 2' }}/>
          </div>
        </div>

        {/* Legalitas */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Legalitas Perusahaan</p>
          </div>
          <div className="profile-section__body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Input
              label="NIB (Nomor Induk Berusaha)"
              placeholder="Contoh: 1234567890123"
              {...register('nib', { required: 'NIB wajib diisi' })}
              error={errors.nib?.message}
              required
            />
            <Input
              label="NPWP Perusahaan"
              placeholder="Contoh: 12.345.678.9-012.000"
              {...register('npwp', { required: 'NPWP wajib diisi' })}
              error={errors.npwp?.message}
              required
            />
            <Input
              label="Email Perusahaan"
              type="email"
              placeholder="Contoh: info@perusahaan.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Telepon Perusahaan"
              type="text"
              placeholder="Contoh: +62 21 1234 5678"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>
        </div>

        {/* Dokumen Perusahaan */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Dokumen Perusahaan</p>
            <p style={{ fontSize:'0.8125rem', color:'var(--muted)', marginTop:4 }}>Dokumen akan disimpan secara aman. Format: PDF, JPG, PNG. Maks. 10MB.</p>
          </div>
          <div className="profile-section__body" style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {DOCUMENTS.map(doc => {
              const uploaded = company.documents?.[doc.key]
              const isUploading = docUploading[doc.key]
              const isDeleting  = docDeleting[doc.key]
              return (
                <div key={doc.key}>
                  <label className="form-label">
                    {doc.label}
                    {doc.required
                      ? <span style={{ color:'var(--error)' }}> *</span>
                      : <span style={{ color:'var(--muted)', fontWeight:400 }}> (Opsional)</span>
                    }
                  </label>

                  {uploaded ? (
                    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--success-light)', border:'1px solid var(--success)', borderRadius:'var(--radius)' }}>
                      <FileText size={18} style={{ color:'var(--success)', flexShrink:0 }}/>
                      <span style={{ fontSize:'0.875rem', color:'var(--dark)', flex:1 }}>Dokumen terupload</span>
                      <a href={uploaded.viewUrl} target="_blank" rel="noreferrer"
                        style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.8125rem', color:'var(--primary)', textDecoration:'none', fontWeight:600 }}>
                        <ExternalLink size={13}/> Lihat
                      </a>
                      <button type="button"
                        onClick={() => handleDocDelete(doc.key)}
                        disabled={isDeleting}
                        style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.8125rem', color:'var(--error)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
                        <Trash2 size={13}/> {isDeleting ? 'Menghapus...' : 'Hapus'}
                      </button>
                    </div>
                  ) : (
                    <label style={{
                      display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                      border:'1.5px dashed var(--border)', borderRadius:'var(--radius)',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      background:'var(--bg-alt)', transition:'border-color 0.2s',
                    }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--primary)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                    >
                      <Upload size={18} style={{ color:'var(--primary)', flexShrink:0 }}/>
                      <span style={{ fontSize:'0.875rem', color: isUploading ? 'var(--primary)' : 'var(--muted)' }}>
                        {isUploading ? 'Mengupload...' : doc.placeholder}
                      </span>
                      <input
                        type="file"
                        style={{ display:'none' }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isUploading}
                        onChange={e => handleDocUpload(doc.key, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* About */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Tentang Perusahaan</p>
          </div>
          <div className="profile-section__body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">Deskripsi Perusahaan</label>
              <textarea className="rich-textarea" rows={5} placeholder="Ceritakan visi, misi, dan hal menarik tentang perusahaan Anda..." {...register('description')}/>
            </div>
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">Budaya Perusahaan</label>
              <textarea className="rich-textarea" rows={4} placeholder="Lingkungan kerja, nilai-nilai, dan budaya tim Anda..." {...register('culture')}/>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="profile-section__title">Media Sosial</p>
          </div>
          <div className="profile-section__body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group" style={{ margin:0, display:'flex', gap:10, alignItems:'center' }}>
              <Linkedin size={20} style={{ color:'#0A66C2', flexShrink:0 }}/>
              <input className="form-input" placeholder="https://linkedin.com/company/..." {...register('linkedin')}/>
            </div>
            <div className="form-group" style={{ margin:0, display:'flex', gap:10, alignItems:'center' }}>
              <Twitter size={20} style={{ color:'#1DA1F2', flexShrink:0 }}/>
              <input className="form-input" placeholder="https://twitter.com/..." {...register('twitter')}/>
            </div>
            <div className="form-group" style={{ margin:0, display:'flex', gap:10, alignItems:'center' }}>
              <Instagram size={20} style={{ color:'#E4405F', flexShrink:0 }}/>
              <input className="form-input" placeholder="https://instagram.com/..." {...register('instagram')}/>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display:'flex', gap:12, marginTop:8 }}>
          <button type="submit" className={`btn ${saved?'btn--success':'btn--primary'}`} disabled={saving} style={{ minWidth:160 }}>
            {saving ? 'Menyimpan...' : saved ? <><CheckCircle2 size={16}/> Tersimpan!</> : <><Save size={16}/> Simpan Perubahan</>}
          </button>
        </div>
      </form>
    </div>
  )
}