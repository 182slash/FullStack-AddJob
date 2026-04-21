import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react'
import api from '@/services/api'

const MAJORS = [
  'Teknologi Informasi', 'Sistem Informasi', 'Teknik Komputer', 'Teknik Elektro',
  'Teknik Industri', 'Teknik Sipil', 'Teknik Mesin', 'Arsitektur',
  'Manajemen', 'Akuntansi', 'Keuangan', 'Ekonomi', 'Bisnis Internasional',
  'Marketing', 'Ilmu Komunikasi', 'Hubungan Internasional', 'Hukum',
  'Psikologi', 'Human Resource', 'Administrasi Bisnis', 'Administrasi Publik',
  'Kedokteran', 'Keperawatan', 'Farmasi', 'Kesehatan Masyarakat',
  'Pendidikan', 'Sastra', 'Desain Grafis', 'Desain Interior',
  'Logistik & Supply Chain', 'Perhotelan', 'Pariwisata', 'Lainnya',
]

const glassmorphismStyle = {
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(25px) saturate(150%)',
  WebkitBackdropFilter: 'blur(25px) saturate(150%)',
  border: '1px solid rgba(255, 255, 255, 0.7)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  borderRadius: '24px',
}

export default function PreRegister() {
  const navigate = useNavigate()
  const [showPw, setShowPw]     = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess]   = useState(false)
  const [registeredName, setRegisteredName] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    setApiError('')
    try {
      await api.post('/auth/pre-register', {
        name:     data.name,
        email:    data.email,
        password: data.password,
        phone:    data.phone,
        major:    data.major,
      })
      setRegisteredName(data.name)
      setSuccess(true)
      setTimeout(() => navigate('/coming-soon', { state: { name: data.name } }), 2500)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Hero banner */}
      <div style={{ padding: '24px' }}>
        <div style={{
          ...glassmorphismStyle,
          padding: '48px 24px 56px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <img
              src="/logo/addjob-logo.png"
              alt="AddJob"
              style={{ height: '58px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.7)', border: '1px solid #4FC3F7', borderRadius: 99, padding: '6px 16px', marginBottom: 20 }}>
              <span style={{ color: '#0288D1', fontSize: '0.8125rem', fontWeight: 600 }}>🚀 Segera Hadir</span>
            </div>

            <h1 style={{ color: '#1A1A2E', fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 'clamp(1.75rem, 5vw, 3rem)', marginBottom: 16, lineHeight: 1.2 }}>
              Portal Kerja #1 Indonesia<br />
              <span style={{
                color: '#4FC3F7',
                fontFamily: '"Dancing Script", "Brush Script MT", cursive',
                fontSize: '2em',
                display: 'block',
                marginTop: '12px',
                textShadow: '1px 1px 2px rgba(255,255,255,0.5)',
                fontWeight: 'normal',
              }}>
                Segera Hadir
              </span>
            </h1>

            <p style={{ color: '#444', fontSize: '1rem', maxWidth: 520, margin: '0 auto 0', lineHeight: 1.7, fontWeight: 500 }}>
              Daftar sekarang dan jadilah yang pertama mengakses ribuan lowongan kerja terbaik di Indonesia.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form / Success */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px 24px 40px' }}>
        <AnimatePresence mode="wait">

          {/* Success state */}
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ ...glassmorphismStyle, width: '100%', maxWidth: 480, padding: '40px 32px', textAlign: 'center' }}
            >
              <div style={{ width: 72, height: 72, background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--success)' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 10, color: '#1A1A2E' }}>
                Selamat, {registeredName}! 
              </h2>
              <p style={{ color: '#444', lineHeight: 1.7, marginBottom: 24, fontSize: '0.9375rem' }}>
                Akun Anda sudah terdaftar! Mengarahkan ke halaman countdown...
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>

          ) : (

            /* Register form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ width: '100%', maxWidth: 480 }}
            >
              <div style={{ ...glassmorphismStyle, padding: '32px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.375rem', marginBottom: 4, color: '#1A1A2E' }}>
                  Daftar Pre-Registrasi
                </h2>
                <p style={{ color: '#555', fontSize: '0.875rem', marginBottom: 24, fontWeight: 500 }}>
                  Gratis selamanya. Akun aktif saat platform diluncurkan.
                </p>

                {apiError && (
                  <div className="alert alert--error" style={{ marginBottom: 16 }}>
                    <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>{apiError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Name */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#333', fontWeight: 600 }}>Nama Lengkap <span style={{ color: 'var(--error)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex', pointerEvents: 'none' }}>
                        <User size={16} />
                      </span>
                      <input type="text" placeholder="Nama Anda" className={`form-input ${errors.name ? 'form-input--error' : ''}`} style={{ paddingLeft: 40, background: 'rgba(255,255,255,0.7)' }} {...register('name', { required: 'Nama wajib diisi.' })} />
                    </div>
                    {errors.name && <p className="form-error">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#333', fontWeight: 600 }}>Email <span style={{ color: 'var(--error)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex', pointerEvents: 'none' }}>
                        <Mail size={16} />
                      </span>
                      <input type="email" placeholder="nama@email.com" className={`form-input ${errors.email ? 'form-input--error' : ''}`} style={{ paddingLeft: 40, background: 'rgba(255,255,255,0.7)' }}
                        {...register('email', { required: 'Email wajib diisi.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Format email tidak valid.' } })} />
                    </div>
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#333', fontWeight: 600 }}>No. HP <span style={{ color: '#777', fontWeight: 400 }}>(Opsional)</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex', pointerEvents: 'none' }}>
                        <Phone size={16} />
                      </span>
                      <input type="tel" placeholder="08xxxxxxxxxx" className="form-input" style={{ paddingLeft: 40, background: 'rgba(255,255,255,0.7)' }} {...register('phone')} />
                    </div>
                  </div>

                  {/* Major */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#333', fontWeight: 600 }}>Jurusan / Bidang <span style={{ color: 'var(--error)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
                        <BookOpen size={16} />
                      </span>
                      <select className={`form-input ${errors.major ? 'form-input--error' : ''}`} style={{ paddingLeft: 40, background: 'rgba(255,255,255,0.7)' }}
                        {...register('major', { required: 'Jurusan wajib dipilih.' })}>
                        <option value="">Pilih jurusan...</option>
                        {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    {errors.major && <p className="form-error">{errors.major.message}</p>}
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#333', fontWeight: 600 }}>Password <span style={{ color: 'var(--error)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex', pointerEvents: 'none' }}>
                        <Lock size={16} />
                      </span>
                      <input type={showPw ? 'text' : 'password'} placeholder="Min. 8 karakter"
                        className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                        style={{ paddingLeft: 40, paddingRight: 40, background: 'rgba(255,255,255,0.7)' }}
                        {...register('password', { required: 'Password wajib diisi.', minLength: { value: 8, message: 'Password minimal 8 karakter.' } })} />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex' }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password.message}</p>}
                  </div>

                  <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting} style={{ marginTop: 8, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    {isSubmitting ? 'Mendaftarkan...' : <><ArrowRight size={16} /> Daftar Sekarang — Gratis</>}
                  </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.8125rem', color: '#555', fontWeight: 500 }}>
                  Dengan mendaftar, Anda menyetujui Syarat & Ketentuan AddJob.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px 16px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
        <p style={{ fontSize: '0.8rem', color: '#555', fontWeight: 500 }}>
          © 2026 AddJob · globaladaptasi.com · adaptasindonesia@gmail.com
        </p>
      </div>
    </div>
  )
}