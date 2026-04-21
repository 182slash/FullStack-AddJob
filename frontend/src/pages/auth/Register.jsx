import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, User, Briefcase, GraduationCap, ArrowRight, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { registerSchema } from '@/utils/validators'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import api from '@/services/api'

const Register = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPw, setShowPw] = useState(false)
  const [apiError, setApiError] = useState('')
  const [referralStatus, setReferralStatus] = useState(null) // null | 'valid' | 'invalid'
  const [referralName, setReferralName] = useState('')

  const defaultRole = searchParams.get('role') || 'seeker'

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole, agreeTerms: false },
  })

  const selectedRole = watch('role')
  const referralCode = watch('referralCode')

  const validateReferral = async () => {
    if (!referralCode?.trim()) return
    try {
      const { data } = await api.get(`/subscription/validate-referral/${referralCode.trim()}`)
      setReferralStatus('valid')
      setReferralName(data.data.name)
    } catch {
      setReferralStatus('invalid')
      setReferralName('')
    }
  }

  const onSubmit = async (data) => {
    setApiError('')
    const result = await registerUser(data)
    if (result.success) {
      navigate(result.role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard', { replace: true })
    } else {
      setApiError(result.error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'var(--gradient-hero)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>AJ</div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: 800, background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AddJob</span>
        </Link>

        <div className="card card-body">
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Buat Akun Gratis</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', marginBottom: 24 }}>Mulai perjalanan karir Anda bersama AddJob.</p>

          {/* Role Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { value: 'seeker', label: 'Pencari Kerja', Icon: GraduationCap, desc: 'Cari lowongan & lamar' },
              { value: 'employer', label: 'Perusahaan', Icon: Briefcase, desc: 'Rekrut talenta terbaik' },
            ].map(({ value, label, Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('role', value)}
                style={{
                  padding: '14px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedRole === value ? 'var(--primary)' : 'var(--border)'}`,
                  background: selectedRole === value ? 'var(--accent-light)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Icon size={18} style={{ color: selectedRole === value ? 'var(--primary)' : 'var(--muted)' }} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: selectedRole === value ? 'var(--primary)' : 'var(--dark)' }}>
                    {label}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>{desc}</p>
              </button>
            ))}
          </div>
          {errors.role && <p className="form-error mb-4">{errors.role.message}</p>}

          {apiError && (
            <div className="alert alert--error" style={{ marginBottom: 20 }}>
              <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label={selectedRole === 'employer' ? 'Nama Perusahaan' : 'Nama Lengkap'}
              type="text"
              placeholder={selectedRole === 'employer' ? 'ex: PT. Global Adaptasi' : 'Nama Anda'}
              icon={<User size={16} />}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label={selectedRole === 'employer' ? 'Email Perusahaan' : 'Email'}
              type="email"
              placeholder={selectedRole === 'employer' ? 'perusahaan@mail.com' : 'nama@email.com'}
              icon={<Mail size={16} />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <div className="form-group">
              <label className="form-label">Password <span style={{ color: 'var(--error)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex', pointerEvents: 'none' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 karakter, huruf kapital & angka"
                  className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error mt-2">⚠ {errors.password.message}</p>}
            </div>

            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password Anda"
              icon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            {/* Referral Code — only shown for employer */}
            {selectedRole === 'employer' && (
              <div className="form-group">
                <label className="form-label">
                  Kode Referral <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Opsional)</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex', pointerEvents: 'none' }}>
                      <Tag size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Contoh: JOHN-X7K2"
                      className={`form-input ${referralStatus === 'invalid' ? 'form-input--error' : ''}`}
                      style={{
                        paddingLeft: 40,
                        borderColor: referralStatus === 'valid' ? 'var(--success)' : referralStatus === 'invalid' ? 'var(--error)' : undefined,
                        textTransform: 'uppercase',
                      }}
                      {...register('referralCode')}
                      onBlur={validateReferral}
                    />
                  </div>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={validateReferral}
                    style={{ whiteSpace: 'nowrap' }}>
                    Cek Kode
                  </button>
                </div>
                {referralStatus === 'valid' && (
                  <p style={{ color: 'var(--success)', fontSize: '0.8125rem', marginTop: 4 }}>
                    ✓ Kode valid — direferral oleh <strong>{referralName}</strong>
                  </p>
                )}
                {referralStatus === 'invalid' && (
                  <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: 4 }}>
                    Kode referral tidak ditemukan.
                  </p>
                )}
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" {...register('agreeTerms')} style={{ marginTop: 2, accentColor: 'var(--primary)', width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                Saya menyetujui{' '}
                <Link to="/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Syarat & Ketentuan</Link>
                {' '}dan{' '}
                <Link to="/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Kebijakan Privasi</Link>
              </span>
            </label>
            {errors.agreeTerms && <p className="form-error">⚠ {errors.agreeTerms.message}</p>}

            <Button type="submit" variant="accent" block loading={isSubmitting} style={{ marginTop: 8 }}>
              Buat Akun Gratis <ArrowRight size={16} />
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9375rem', color: 'var(--muted)' }}>
            Sudah punya akun?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Masuk di sini</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register